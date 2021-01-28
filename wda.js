const { exec } = require("child_process");
var execSync = require('child_process').execSync
var images = require('images')
var path = require('path')
var Subprocess = require("teen_process").SubProcess
var EventEmitter = require('events').EventEmitter;
var requestPromise = require('request-promise')
var util = require('util')
var wdaPath =  path.resolve('./')+'/repos/WebDriverAgent/';
var MaxFailCount = 3


var udid = "";
var wdaPort = 8100
var wdaRemotePort = 8100
var mjpegPort = 9100
var wdaMjpegRemotePort = 9100
var baseUrl = util.format('http://127.0.0.1:%d',wdaPort)
var plugin = new EventEmitter()
var wdaPro = null;
var sessionid = null;
var checkTimer = null
var batteryTimer = null
var bRestart = true
var exit = false
var proxyProMap = new Map()
var bRestartCnt = 0
var sessionTimer = null

plugin.on('restart',function(){
    if(!bRestart)
      return
      WDA.stopWda()
})

var WDA = {
  start: async function(){
    //var type = 'device'
    // if(type=='device'){
      proxyProMap.set(wdaPort,WDA.startIproxy(wdaPort,wdaRemotePort))
      proxyProMap.set(mjpegPort,WDA.startIproxy(mjpegPort,wdaMjpegRemotePort))
    // }
    return WDA.startWda().then(function(){
      return WDA
    })
  }

  ,restartIproxy:function(localPort,remotePort){
    if (!exit){
      proxyPro = null;
      proxyProMap.set(localPort,WDA.startIproxy(localPort,remotePort));
    }
  }

  ,startIproxy:function(localPort,remotePort){
    //console.log("start iproxy with params:%d %d %s",localPort,remotePort,udid)
    let pro = new Subprocess("iproxy",["-s","0.0.0.0","-u",udid,localPort,remotePort])
    // let pro = new Subprocess("iproxy",["-u",WDA.getDevices(),localPort,remotePort])

    pro.start();
    // pro.on("exit",(code,signal)=>{
    //   console.log("exit with code :%d",code)
    //   WDA.restartIproxy(localPort,remotePort);
    // });
    pro.on("output",(stdout,stderr)=>{

    });
    return pro
  }
  ,setDevice:function(id){
    udid = id;
  }
  ,getbaseUrl:function(){
    //console.log(baseUrl)
    return baseUrl;
  }
  ,startWda:function(){
    if(this.sessionid==null){
      WDA.initSession()

      if(this.sessionid!=null)
        return
    }

    var platform = ""

    // var udid = "c96e4f4016966c6b50c39e1168f5535ee1988f40";
    // if(options.type=='emulator'){
    //   platform = " Simulator"
    // }
    var uninstall = new Subprocess("ideviceinstaller",["--udid",udid,
         "--uninstall","com.apple.test.WebDriverAgentRunner-Runner"])
    uninstall.start()
    // var params = ['build-for-testing', 'test-without-building','-project',path.join(wdaPath,'WebDriverAgent.xcodeproj')
    //               ,'-scheme','WebDriverAgentRunner','-destination','id='+udid+',platform=iOS'+platform
    //               ,'-configuration','Debug','IPHONEOS_DEPLOYMENT_TARGET=10.2']
    var params = ['build-for-testing', 'test-without-building','-project',path.join(wdaPath,'WebDriverAgent.xcodeproj')
                  ,'-scheme','Controller','-destination','id='+udid+',platform=iOS'+platform
                  ,'-configuration','Debug','IPHONEOS_DEPLOYMENT_TARGET=10.2']
    //console.log("start WDA with params:%s",params);
    const env = {
      USE_PORT: 8100,
      MJPEG_SERVER_PORT:9100
    }
    wdaPro = new Subprocess("xcodebuild",params, {
      cwd: wdaPath,
      env,
      detached: true
    })
    wdaPro.start()
    return new Promise((resolve,reject)=>{
      wdaPro.on("exit",(code,signal)=>{
        wdaPro = null;
        bRestart = true
        WDA.restartWda();
        return resolve()
      });
      wdaPro.on("stream-line",line=>{
        bRestart = false
        // console.log(line)

        // if(line.includes('ServerURLHere')){
        //   console.log(line)
        //   // baseUrl = line.replace("ServerURLHere->", "");
        //   // baseUrl = baseUrl.replace("<-ServerURLHere", "");
        //   // console.log("baseUrl : "+baseUrl);
        // }

        // if (line.indexOf('=========')!=-1)
          // console.log(line)
        // if(line.indexOf("** TEST BUILD SUCCEEDED **")!=-1)
        //   console.log("xcodebuild build successfully")
        // else 
        if (line.indexOf("ServerURLHere->")!=-1){
          // console.log(line)
          // console.log("WDA started successfully")
          WDA.launchApp('com.apple.Preferences');
          WDA.initSession();
          plugin.emit("started");
          bRestart=true
          bRestartCnt = 0
          if(checkTimer===null){
            batteryTimer = setInterval(WDA.getBatteryInfo,300000)
            checkTimer = setInterval(WDA.checkWdaStatus,3000)

          }
          return resolve()
        }
      })
    })
  }
  ,getBatteryInfo:function(){
    WDA.GetRequest('wda/batteryInfo','',false)
  }
  ,checkWdaStatus:function(){
    WDA.GetRequest('check_status','',false)
  }
  ,stopWda:function(){
    if (wdaPro!=null){
      wdaPro.stop()
      wdaPro = null
    }
    if(checkTimer){
      clearInterval(batteryTimer)
      clearInterval(checkTimer)
      checkTimer = null
      batteryTimer = null
    }
  }
  ,end:function() {
    exit = true
    WDA.stopWda()
    var proIter = proxyProMap.values()
    while((pro=proIter.next().value)!=null){
      pro.stop()
    }
    proxyProMap.clear()
    return true
  }

  ,getiDeviceList:function() {
    var stdout = execSync('idevice_id -l',{});
    var out = stdout.toString().trim();
    if(out!=""){
      ref = out.split('\n');
      //this.update(ref,'device');
    }else{
      //this.update([],'device');
    }
    // ref = simtcl.GetBootedSim()
    // if(ref){
    //   this.update(ref,'emulator');
    // }
    // console.log(ref)
    return ref;
  }

  ,GetRequest:function(uri,param='',bWithSession=false){
    var session = ''

    if(bWithSession)
      session = util.format("/session/%s",WDA.getSessionid())
    let options = {
      method:'GET',
      uri:util.format("%s%s/%s%s",baseUrl,session,uri,param),
      json:true,
      headers:{
          'Content-Type':'application/json'
      }
    }
    // console.log(options);
    requestPromise(options).then(function(resp){
        failCnt = 0
        WDA.processResp(resp)
    }).catch(function(err){
        // console.log('get request err',err)
        return null
    })
  }
  ,processResp:function(resp){
    var respValue = resp.value
    //console.log("respValue : "+respValue)
    if(respValue=={}||respValue==null||respValue=="")
        return
    if(respValue.func==undefined)
        return
    return plugin.emit(respValue.func,respValue)
  }
  ,PostData:function(uri,body,bWithSession){
    var session = ''
    if(bWithSession)
      session = util.format("/session/%s",WDA.getSessionid())
    let options = {
      method:'POST',
      uri:util.format("%s%s/%s",baseUrl,session,uri),
      body:body,
      json:true,
      headers:{
          'Content-Type':'application/json'
      }
    }
    requestPromise(options).then(function(resp){
      failCnt = 0
      WDA.processResp(resp)
    }).catch(function(err){
      //log.info('post request err',err)
      return null
    })
  }
  ,launchApp:function(bundleId){
    var body = {
      capabilities:{
        bundleId:bundleId
      }
    }
    WDA.PostData('session',body,false)
  }
  ,PostData:function(uri,body,bWithSession){
    var session = ''
    if(bWithSession)
      session = util.format("/session/%s",WDA.getSessionid())
    let options = {
      method:'POST',
      uri:util.format("%s%s/%s",baseUrl,session,uri),
      body:body,
      json:true,
      headers:{
        'Content-Type':'application/json'
      }
    }
    requestPromise(options).then(function(resp){
      failCnt = 0
      WDA.processResp(resp)
    }).catch(function(err){
      //console.log('post request err',err)
      return null
    })
  }
  ,getSessionid:function(){
    if(this.sessionid==null){
        WDA.initSession()
    }
    return sessionid
  }
  ,initSession:function(){

    let options = {
        method:'GET',
        uri:baseUrl+'/status',
        headers:{
            'Content-Type':'application/json'
        },
        json:true
    }
    requestPromise(options).then(function(resp){
        sessionid = resp.sessionId

        if(sessionid == null){
          WDA.launchApp('com.apple.Preferences')
          WDA.initSession()
        }
        console.log("initSession : "+sessionid)
        return sessionid
    }).catch(function(err){
        return null
    })
  }
  ,isWdaStart:function(){
    return WDA.getSessionid()!=null
  }
  ,restartWda:function(){
    if (!exit && bRestart){
      bRestartCnt=bRestartCnt+1
      /*if(bRestartCnt>3){
        console.log("more than 3 times attemp to restart WDA.removing WDA and reboot the device")
        var uninstall = new Subprocess("ideviceinstaller",["--udid",udid,
          "--uninstall","com.apple.test.WebDriverAgentRunner-Runner"])
        uninstall.start()
        var reboot = new Subprocess("idevicediagnostics",["restart","-u",udid])
        reboot.start()
        bRestart = false
        plugin.end()
      }
      else{*/
        WDA.startWda();
    }
  }

}
module.exports = WDA;
