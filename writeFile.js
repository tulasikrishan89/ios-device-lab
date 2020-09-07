var Promise = require('bluebird')
var adb = require('adbkit')
var client = adb.createClient()

const fs = require('fs');
let dataF;
client.listDevices()
  .then(function(devices) {
    return Promise.filter(devices, function(device) {
      return client.getFeatures(device.id)
        .then(function(features) {
          return features['android.hardware.nfc']
        })
    })
  })
  .then(function(supportedDevices) {
    // console.log('The following devices support NFC:', supportedDevices);

    dataF = JSON.stringify(supportedDevices);

    //console.log(dataF);
    fs.writeFileSync('devices.json', dataF);

    //read file
    fs.readFile('devices.json', (err, data) => {
        if (err) throw err;
        let device = JSON.parse(data);
        console.log(device);
    });


  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
