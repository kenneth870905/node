
// 这一步主要是为了使用下面的静态资源
var express = require('express')

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const jwt = require('jsonwebtoken');
var uniqid = require('uniqid');
var md5 = require('md5');

// import { queryUserById } from "./user";
var USER=require("./user.js");

//获取url参数
var URL = require('url');

server.listen(3000,function(){
    console.log('端口监听已开启：3000')
})

// 设置静态资源地址 比如图片 js 之类的
app.use(express.static('public'))

// 中间件 
// 这个中间件在这里好像不是很好用
// io.use((socket,next)=>{
//     const token = socket.handshake.query.token;
//     if (token){
//         return next();
//     }
//     return next(new Error("authentication error"))
// });

function testToken(token){
    return new Promise((resolve, reject) => {
        let secret = 'e0b5d4fd15f77767a52c9c47c37ee6a3';
        jwt.verify(token, secret, function(err, decoded) {
            if(err){
                reject(err)
            }else{
                resolve(decoded)
            }
        });
    });
}

app.get('/createtoken', (request, response) => {
    //要生成 token 的主题信息
    let user = {
        id: '2',
        jti:md5(uniqid())   //这个这里是参数是没用的
    }
    //这是加密的 key（密钥）
    let secret = 'e0b5d4fd15f77767a52c9c47c37ee6a3';
    //生成 Token
    let token = jwt.sign(user, secret, {
        expiresIn: 60*60*24, // 设置过期时间, 24 小时
        algorithm: 'HS256'
    })
    response.send({status: true, token});
})

// token验证
app.get('/testToken',function(request, response){
    var p = URL.parse(request.url,true); 
    let token = p.query.token;
    let secret = 'e0b5d4fd15f77767a52c9c47c37ee6a3';
    jwt.verify(token, secret, function(err, decoded) {
        console.log(err)
        // console.log(decoded)    //bar
        response.send({status: true, decoded});
    });
})

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var roomInfo = {};
io.on('connection', function (socket) {
    //进入房间
    var roomeName = ''; //房间名称
    socket.on('join', async function (obj) {

        var id = socket.id
        var userid="";
        try {
            let r = await testToken(obj.token);
            userid = r.id;
        } catch (error) {}        

        roomeName = obj.roomeName ? obj.roomeName : "未知" 
        //判断房间是否存在
        if(!roomInfo[roomeName]){
            roomInfo[roomeName] = [];
        }

        if(roomInfo[roomeName].find(x=>x.id==id)){
            var u = roomInfo[roomeName].find(x=>x.id==id);
            // u.user.id = userid
            if(userid){  //这个时候token导致的可能已经变了
                if(u.u2.id!=userid){
                    let u2 = await USER.queryUserById(userid);
                    u.u2 = u2;
                }
            }else{
                u.u2 = {name:"游客"}
            }
            // 发送给指定 id 用户
            io.to(id).emit('sys','你已经在房间了:'+roomeName);
            var msg = {
                type:0,
                msg:roomInfo[roomeName]
            }
            io.to(roomeName).emit('msg',msg)
            return
        }
        socket.join(roomeName);

        var u2 = {}
        if(userid){
            u2 = await USER.queryUserById(userid)
        }else{
            u2.name="游客"
        }
        var user = {
                id:id,
                u2:u2
            }
        roomInfo[roomeName].push(user);
        console.log(JSON.stringify(roomInfo))
        io.to(roomeName).emit('sys', (u2.name ? u2.name : "游客")+'加入了房间:'+roomeName+'，socketId:'+id);
        var msg = {
                type:0,
                msg:roomInfo[roomeName]
            }
        io.to(roomeName).emit('msg',msg)
    });

    socket.on('leave', function () {
        socket.emit('disconnect');
    });

    socket.on('disconnect', function () {
        // 从房间名单中移除
        console.log('房间中移除',roomInfo,roomeName,socket.id)

        if(!roomInfo[roomeName]) return
        var index = roomInfo[roomeName].findIndex(x=>x.id == socket.id);
        if (index == -1) return
        // var name = 
        roomInfo[roomeName].splice(index, 1);
        var msg = {
            type:0,
            msg:roomInfo[roomeName]
        }
        io.to(roomeName).emit('msg',msg)
        // socketIO.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
        // socket.leave(roomID);    // 退出房间
        // socketIO.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
        // console.log(user + '退出了' + roomID);
    });

    socket.on('触发广播',function(fc){
        // 可以去这个网址看看具体什么意思 https://socket.gitbook.io/docs/2-wen-dang-docs/emit_cheatsheet  
        // socket.broadcast.emit('接收广播',`id：${socket.id}，手动触发广播${new Date()}`)
        io.emit('接收广播',`id：${socket.id}，手动触发广播${new Date()}`)
        fc('触发成功')
    })
});

// msg={
//     type:0,  0人员
//     meg:""
// }



