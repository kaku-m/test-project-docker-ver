const express = require('express')
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const mysql = require('mysql2/promise')
const connectionInfo = {
  host: 'db',
  user: 'root',
  database: 'test_db',
  password: 'Password@9',
}

/**
 * ページの一覧を取得する
 */
 app.get('/list', async (req, res) => {
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = 'SELECT id, title FROM pages'
    const [results, fields] = await connection.query(sql)
    let pages = []
    for (let i = 0; i < results.length; i++) {
      pages.push({ pageId: results[i].id, pageTitle: results[i].title })
    }
    const json = JSON.stringify(pages)
    res.send(json)
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * 直近の親ページのid、titleを取得する
 */
 app.get('/parent/:id', async (req, res) => {
  const pageId = req.params.id
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = `SELECT t1.id, t1.title FROM pages AS t1 LEFT OUTER JOIN pages AS t2 ON t1.path = (SELECT MAX(path) FROM pages WHERE t2.path LIKE CONCAT(path, '_%')) WHERE t2.id = ?`
    const [results, fields] = await connection.execute(sql, [pageId])
    const parent = results[0] ? { pageId: results[0].id, pageTitle: results[0].title } : null
    const json = JSON.stringify(parent)
    res.send(json)
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * 当ページのpath、title、contentを取得する
 */
 app.get('/:id', async (req, res) => {
  const pageId = req.params.id
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = 'SELECT path, title, content FROM pages WHERE id = ?'
    const [results, fields] = await connection.execute(sql, [pageId])
    const json = JSON.stringify({ pagePath: results[0].path, pageTitle: results[0].title, content: results[0].content })
    res.send(json)
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * 直近の子ページのid、titleを取得する
 */
 app.get('/children/:id', async (req, res) => {
  const pageId = req.params.id
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = `SELECT t1.id, t1.title FROM pages AS t1 LEFT OUTER JOIN pages AS t2 ON t2.path = (SELECT MAX(path) FROM pages WHERE t1.path LIKE CONCAT(path, '_%')) WHERE t2.id = ?`
    const [results, fields] = await connection.execute(sql, [pageId])
    let children = []
    if (results[0]) {
      for (let i = 0; i < results.length; i++) {
        children.push({ pageId: results[i].id, pageTitle: results[i].title })
      }
    }
    const json = JSON.stringify(children)
    res.send(json)
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * パンくず用（祖先ページのpageId、pageTitleを取得する）
 */
app.get('/ancestors/:id', async (req, res) => {
  const pageId = req.params.id
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = `SELECT id, title FROM pages AS p WHERE (SELECT path FROM pages WHERE id = ?) LIKE CONCAT(p.path, '_%')`
    const [results, fields] = await connection.execute(sql, [pageId])
    let ancestors = []
    if (results[0]) {
      for (let i = 0; i < results.length; i++) {
        ancestors.push({ pageId: results[i].id, pageTitle: results[i].title })
      }
    } else {
      ancestors = null
    }
    const json = JSON.stringify(ancestors)
    res.send(json)
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * ページの新規作成
 */
app.post('/create/new', async (req, res) => {
  const parentPageId = req.body.parentPageId || null
  const pageTitle = req.body.pageTitle
  // エラーチェックが必要
  const connection = await mysql.createConnection(connectionInfo)
  try {
    await connection.beginTransaction()
    const sql1 = 'INSERT INTO sequence VALUES (NULL)'
    const [results1, fields1] = await connection.query(sql1)
    const pageId = results1.insertId
    const sql2 = `INSERT INTO pages (id, path, title) SELECT ?, CONCAT((CASE WHEN ? IS NULL THEN '/' ELSE (SELECT path FROM pages WHERE id = ?) END), ?, '/'), ?`
    await connection.execute(sql2, [pageId, parentPageId, parentPageId, pageId, pageTitle])
    await connection.commit()
    const json = JSON.stringify({ createdPageId: pageId })
    res.send(json)
  } catch(e) {
    await connection.rollback()
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * 子ページの作成
 */
app.post('/create/child', async (req, res) => {
  const parentPageId = req.body.parentPageId
  const pageTitle = req.body.pageTitle
  // エラーチェックが必要
  const connection = await mysql.createConnection(connectionInfo)
  try {
    await connection.beginTransaction()
    const sql1 = 'INSERT INTO sequence VALUES (NULL)'
    const [results1, fields1] = await connection.query(sql1)
    const pageId = results1.insertId
    const sql2 = `INSERT INTO pages (id, path, title) SELECT ?, CONCAT((SELECT path FROM pages WHERE id = ?), ?, '/'), ?`
    await connection.execute(sql2, [pageId, parentPageId, pageId, pageTitle])
    await connection.commit()
    const json = JSON.stringify({ createdPageId: pageId })
    res.send(json)
  } catch(e) {
    await connection.rollback()
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * ページの移動（子ページを含む）
 */
app.put('/move', async (req, res) => {
  const parentPageId = req.body.parentPageId
  const pageId = req.body.pageId
  // エラーチェックが必要
  const connection = await mysql.createConnection(connectionInfo)
  try {
    await connection.beginTransaction()
    // 移動対象ページを含む子孫idを取得
    const sql1 = `SELECT id FROM pages WHERE path LIKE '%/${pageId}/%'`
    const [results1, fields1] = await connection.query(sql1)
    let descendants = []
    for (let i = 0; i < results1.length; i++) {
      descendants.push(results1[i].id)
    }
    // 子ページへの移動不可
    if (descendants.includes(Number(parentPageId))) {
      throw '子ページに移動することは出来ません'
    }
    // 親ページのpathを取得
    const sql2 = 'SELECT path FROM pages WHERE id = ?'
    const [results2, fields2] = await connection.execute(sql2, [parentPageId])
    const parentPagePath = results2[0].path
    // 移動対象ページのpathを取得
    const sql3 = 'SELECT path FROM pages WHERE id = ?'
    const [results3, fields3] = await connection.execute(sql3, [pageId])
    const pagePath = results3[0].path
    // 親ページのpathに結合する位置を調べる
    const pos = pagePath.indexOf(`/${pageId}/`) + 2
    // 親ページのpathに結合して更新する
    const sql4 = `UPDATE pages AS p SET path = CONCAT(?, SUBSTR(p.path, ?)) WHERE p.path LIKE CONCAT(?, '%')`
    await connection.execute(sql4, [parentPagePath, pos, pagePath])
    await connection.commit()
    res.send('更新完了')
  } catch(e) {
    await connection.rollback()
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * ページの削除（子ページを含む）
 */
app.delete('/delete/:id', async (req, res) => {
  const pageId = req.params.id
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = `DELETE FROM pages WHERE path LIKE '%/${pageId}/%'`
    await connection.query(sql)
    res.send('削除完了')
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * ページの保存
 */
 app.put('/save', async (req, res) => {
  const pageId = req.body.pageId
  const pageTitle = req.body.pageTitle
  const content = req.body.content
  const connection = await mysql.createConnection(connectionInfo)
  try {
    await connection.beginTransaction()
    // タイトル重複チェック
    const sql1 = 'SELECT id FROM pages WHERE title = ?'
    const [results1, fields1] = await connection.execute(sql1, [pageTitle])
    if (results1[0] && results1[0].id !== Number(pageId)) {
      res.send(JSON.stringify({ msg: 'title duplicated.' }))
      return
    }
    // 更新
    const sql2 = 'UPDATE pages SET title = ?, content = ? WHERE id = ?'
    await connection.execute(sql2, [pageTitle, content, pageId])
    await connection.commit()
    res.send('保存完了')
  } catch(e) {
    await connection.rollback()
    console.log(e)
  } finally {
    connection.end()
  }
})

module.exports = {
  path: "/api/page",
  handler: app
}
