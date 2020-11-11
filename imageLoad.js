// index.js
// Get our dependencies
var express = require("express");
var socket = require("socket.io");
var fs = require("fs");
var path = require("path");

// initialize our express app
var app = express();

var port = 9090;

// have our app start listening
var server = app.listen(port, function() {
  console.log("Listening at http://localhost:" + port);
});

// Specify a directory to serve static files
app.use(express.static("views"));

// initialize our socket by passing in our express server
var sock = socket(server);

// respond to initial connection with our server
sock.on("connection", function(socket) {
  console.log("made connection with socket " + socket.id);

  // when the server receives a chat event
  socket.on("chat", function(data) {
    // use emit to send the “chat” event to everybody that is connected, including the sender
    sock.sockets.emit("chat", data);
  });
});


// function getImagesFromDir(dirPath) {

//     let allImages = []

//     let files = fs.readdirSync(dirPath)

//     for(file in files){
//         let fileLocation = path.join(dirPath, file)
//         var stat = fs.statSync(fileLocation)

//         if(stat && stat.isDirectory){
//             getImagesFromDir(fileLocation)
//         }
//         else if (stat && stat.isFile() && ['.jpg', '.png']
//         .indexOf(path.extname(fileLocation)) !== -1){
//             allImages.push('static/'+file)
//         }
//     }

//     return allImages
// }
