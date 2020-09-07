const { exec } = require("child_process");
var execSync = require('child_process').execSync

function screenshot(i){
  exec("/usr/local/bin/idevicescreenshot -u 00008030-001A550A2643802E /Users/krish/Downloads/00008030-001A550A2643802E"+i+".png", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });
}

capture = function(i) {
  var array = new Array();
      console.log('Capturing screenshot')
      var udid = "00008030-001A550A2643802E";
      var filename = "/Users/krish/readimage/uploads/"+udid+i+".png";
      cmd = "idevicescreenshot -u "+udid+" "+filename;
      console.log(cmd)
      stdout = execSync(cmd,{});
      // img = images(filename);
      // transfer = img.encode('jpg');
      // cmd = 'rm '+filename;
      // execSync(cmd,{});
      // return storage.store('blob', transfer, {
      //   filename: util.format('%s.jpg', udid)
      // , contentType: 'image/jpeg'
      // , knownLength: transfer.length
      // })
     //return array.push(filename);
    }

 for (i = 0; i < 50; i++) {
    // screenshot(i);
    capture(i)
 }
