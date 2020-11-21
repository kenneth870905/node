var express = require('express');
var app = express();     //引入 express库
// const http=require('http'); 
const http=require('http').Server(app); //将express注册到http中
const url=require('url');
const fs=require('fs');
var WebSocket=require('ws');

// var fun=function (request,response) {
//     var stream=fs.createReadStream('../views/ws.html',{flag:'r',encoding:'utf8'});
//     stream.pipe(response);
// }
// var server =http.createServer(fun).listen(8000);

//启动监听，监听3000端口
var server = http.listen(3000,function(){
    console.log('listening on *:3000')
});

var wss=new WebSocket.Server({ server:server });

wss.boardcast=function boardcast() {
    wss.clients.forEach(function each (client) {
        if(client.readyState==WebSocket.OPEN){
            client.send("开始通信吧！");
        }
    })
}

wss.on('connection',function connection(ws,req) {
    console.log('connection')
    var s;
    //const location = url.parse(req.url, true);
    ws.on('message',function incoming(message) {
        // console.log(message);
        // console.log(wss.clients)
        var smg = JSON.parse(message);
        console.log(smg.msg + " " + smg.name);
        if(smg.msg!="") {
            s = smg.name + "说：" + smg.msg;
            ws.send(s);
        }else {
            ws.send("说些什么吧，别这么高冷呀")
        }

        wss.clients.forEach(function each(client) {
            console.log(client.id)
            if (client.readyState === WebSocket.OPEN) {
              client.send( smg.name + " -> " + message);
            }
        });
    });
    wss.boardcast();
})



