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

//api's
app.get('/hello', (req, res) => res.send("Hello World!"));

// app.get('/ios.js', (req, res) => {
//   res.status(200)
//     .type('js')
//     .send(`var WSURL = "ws://localhost:${PORT}"`)
// })

app.get('/config.js', (req, res) => {
  res.status(200)
    .type('js')
    .send(`var WSURL = "ws://localhost:${PORT}"`)
})


//server
const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })

// wss.on('connection', (ws) => {
//   console.info('Got a ios-minicap client : '+MINICAP_PORT)

//   const stream = net.connect({
//     port: MINICAP_PORT
//   })

//   stream.on('error', (err) => {
//     console.error(err)
//     console.error('Be sure to run ios-minicap on port ' + MINICAP_PORT)
//     console.error('May be ios device need reset all settings')
//     process.exit(1)
//   })

//   function onBannerAvailable (banner) {
//     debug('banner', banner)
//   }

//   function onFrameAvailable (frame) {
//     ws.send(frame.buffer, {
//       binary: true
//     })
//   }

//   const parser = new Parser({
//     onBannerAvailable,
//     onFrameAvailable
//   })

//   function tryParse () {
//     for (let chunk; (chunk = stream.read());) {
//       parser.parse(chunk)
//     }
//   }

//   stream.on('readable', tryParse)
//   tryParse()

//   ws.on('close', () => {
//     console.info('Lost a client')
//     stream.end()
//   })
// })

server.listen(PORT)
console.info(`Listening on port ${PORT}`)