const http = require('http')
const path = require('path')
const net = require('net')
const request = require('request')
const express = require('express')
const WebSocketServer = require('ws').Server
const debug = require('debug')('readimage')
//const { Parser } = require('minicap')
const app = express()
var bodyParser = require("body-parser");
const PORT = process.env.PORT || 9090
var util = require('util')
const Wda = require('./wda');
var wdaPort = 8100

var baseUrl = util.format('http://127.0.0.1:%d',wdaPort)

app.use(express.static(path.join(__dirname, '/views')));

app.get('/config.js', (req, res) => {
  res.status(200)
    .type('js')
    .type('png')
    .send(`var WSURL = "ws://localhost:${PORT}"`)
})

//connected devices
//var ideviceList = Wda.getiDeviceList();
//console.log("ideviceList : "+ideviceList[0]);

//node app 00008101-001C15A20AD2001E
var args = process.argv.slice(2);
console.log('udid: ', args[0]);

Wda.setDevice(args[0]);
// Wda.startWda();
Wda.start();

//server
const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })

wss.on('connection', function(socket) {
  
  console.log('Opened connection 🎉');
  
  // Send data back to the client
  var json = JSON.stringify({ message: 'Hello Mr.Client' });
  socket.send(json);

  // Receive data from the client
  // socket.on('message', function(message) {
  //   console.log('Received: ' + message);
  // });

  // The connection was closed
  socket.on('close', function() {
    console.log('Closed Connection 😱');
  });

  socket.on("disconnect", () => {
    console.log('Disconnected 😱');
  });

});
server.listen(PORT)

console.info(`Listening on port ${PORT}`)
