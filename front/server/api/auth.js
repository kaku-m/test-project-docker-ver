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

const jwt = require('jsonwebtoken')

/**
 * ログイン
 */
app.post('/login', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  // データチェック
  if (username === '' || password === '') {
    return res.status(400).json({ error: 'error' })
  }
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = 'SELECT * FROM users WHERE name = ? AND password = ?'
    const [results, fields] = await connection.execute(sql, [username, password])
    if (!results[0] || results[0].password !== password) {
      return res.status(400).json({ error: 'error' })
    }
    const payload = {
      username: username
    }
    const token = jwt.sign(payload, 'secret')
    return res.json({ token })
  } catch (e) {
    console.log(e)
    return res.status(400).json({ error: 'error' })
  } finally {
    connection.end()
  }
})

/**
 * ユーザー認証
 */
app.get('/user', async (req, res) => {
  const bearToken = req.headers['authorization']
  const bearer = bearToken.split(' ')
  const token = bearer[1]
  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      return res.sendStatus(403)
    } else {
      return res.json({ user })
    }
  })
})

/**
 * ユーザー登録
 */
app.post('/register', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  // データチェック
  if (username === '' || password === '') {
    const json = JSON.stringify({ error: 'error' })
    res.send(json)
    return
  }
  const connection = await mysql.createConnection(connectionInfo)
  try {
    const sql = 'INSERT INTO users (name, password) VALUES (?, ?)'
    await connection.execute(sql, [username, password])
    res.send('登録完了')
  } catch (e) {
    const json = JSON.stringify({ error: 'error' })
    res.send(json)
  } finally {
    connection.end()
  }
})

module.exports = {
  path: '/api/auth',
  handler: app
}
