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
const PORT = process.env.PORT || 8080
const Wda = require('./wda');

app.use(express.static(path.join(__dirname, '/views')));
//app.use(express.static(path.join(__dirname, '/uploads')));

app.get('/config.js', (req, res) => {
  res.status(200)
    .type('js')
    .type('png')
    .send(`var WSURL = "ws://localhost:${PORT}"`)
})

app.get('/', function (req, res) {
    var coords = req.body.x + ' ' + req.body.y ;
    console.log(coords)
    //res.send(coords);
});


//server
const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })

wss.on('connection', function(socket) {
  console.log('Opened connection 🎉');
  const wda = new Wda();


  // Send data back to the client
  var json = JSON.stringify({ message: 'Gotcha' });
  socket.send(json);

  // When data is received
  socket.on('message', function(message) {
    console.log('Received: ' + message);
  });

  // The connection was closed
  socket.on('close', function() {
    console.log('Closed Connection 😱');
  });

});


// WebSocket server
// wss.on('request', function(request) {
// var connection = request.accept(null, request.origin);

// This is the most important callback for us, we'll handle
// all messages from users here.
// connection.on('message', function(message) {
//   if (message.type === 'utf8') {
//     // process WebSocket message
//   }
// });

// connection.on('close', function(connection) {
//   // close user connection
// });


server.listen(PORT)
console.info(`Listening on port ${PORT}`)
