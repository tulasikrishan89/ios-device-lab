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
var ideviceList = Wda.getiDeviceList();
console.log("ideviceList : "+ideviceList[0]);

Wda.setDevice(ideviceList[0]);
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
  socket.on('message', function(message) {
    //console.log('Received: ' + message);

    if (message.type === "Tap"){

    }
          
    if (message.type === "Double-Tap") {
      
    }
 
    if (message.type === "Tap-Hold") {
      
    }

  });

  // var size = null;
  // console.log("Width : "+size.value.width);
  // console.log("Height : "+size.value.height);
  // console.log("deviceSize : "+Wda.getSize());
  // Wda.getSize().then(resp => {
  //   if(resp!=null){
  //     console.log("size : "+JSON.stringify(resp))
  //     this.size = JSON.stringify(resp);
  //   }
  // });
  // console.log(this.size)
  // if(this.size!= null)
  //   socket.send(this.size);
  

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
