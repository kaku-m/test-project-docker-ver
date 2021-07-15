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

const multer = require('multer')
const multerStorage = multer.diskStorage({
  destination (req, file, callback) {
    callback(null, './static/images/')
  },
  filename (req, file, callback) {
    const uniqueSuffix = Date.now()
    callback(null, `${uniqueSuffix}.png`)
  }
})
const upload = multer({ storage: multerStorage }).single('image')

/**
 * アップロード画像を取得する
 */
 app.get('/:id', async (req, res) => {
  const pageId = req.params.id
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = 'SELECT id, name FROM images WHERE page_id = ?'
    const [results, fields] = await connection.execute(sql, [pageId])
    let images = []
    for (let i = 0; i < results.length; i++) {
      images.push({imageId: results[i].id, name: results[i].name})
    }
    const json = JSON.stringify(images)
    res.send(json)
  } catch(e) {
    console.log(e)
  } finally {
    connection.end()
  }
})

/**
 * 画像のアップロード
 */
 app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log('A Multer error occurred when uploading.')
    } else if (err) {
      console.log('An unknown error occurred when uploading.')
    }
    const pageId = req.body.pageId
    const name = req.file.filename
    const path = req.file.path.replace(name, '')
    const connection = await mysql.createConnection(connectionInfo)
    try {
      const sql = 'INSERT INTO images (page_id, name, path) VALUES (?, ? ,?)'
      const [results, fields] = await connection.execute(sql, [pageId, name, path])
      const imageId = results.insertId
      const json = JSON.stringify({imageId: imageId, name: name})
      res.send(json)
    } catch(e) {
      console.log(e)
    } finally {
      connection.end()
    }
  })
})

module.exports = {
  path: "/api/image",
  handler: app
}
