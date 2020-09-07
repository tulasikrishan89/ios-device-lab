const http = require('http')
const path = require('path')
const net = require('net')
const request = require('request')
const express = require('express')
const WebSocketServer = require('ws').Server
const debug = require('debug')('readimage')
const { Parser } = require('minicap')
const app = express()
const PORT = process.env.PORT || 8080
const MINICAP_PORT = process.env.MINICAP_PORT || 12345

app.use(express.static(path.join(__dirname, '/views')));
//app.use(express.static(path.join(__dirname, '/uploads')));

app.get('/config.js', (req, res) => {
  res.status(200)
    .type('js')
    .type('png')
    .send(`var WSURL = "ws://localhost:${PORT}"`)
})


//server
const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })


server.listen(PORT)
console.info(`Listening on port ${PORT}`)