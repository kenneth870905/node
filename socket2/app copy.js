
// 这一步主要是为了使用下面的静态资源
var express = require('express')

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000,function(){
    console.log('端口监听已开启：3000')
})

// 设置静态资源地址
app.use(express.static('public'))

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    // socket.join('all',()=>{

    // })
    socket.on('join', function (userName) {
        console.log('join')
        socket.join('all'); 
        console.log(socket.rooms)
        // user = userName;
        // // 将用户昵称加入房间名单中
        // if (!roomInfo[roomID]) {
        //     roomInfo[roomID] = [];
        // }
        // roomInfo[roomID].push(user);

        // socket.join(roomID);    // 加入房间
        // // 通知房间内人员
        // socketIO.to(roomID).emit('sys', user + '加入了房间', roomInfo[roomID]);
        // console.log(user + '加入了' + roomID);
    });
    // 除了connect、message 和 disconnect，你都可以发送自定义事件
    //emit 发送给客服端  
    //on 接受客服端
    // 事件备忘可以查看这个
    // https://socket.gitbook.io/docs/2-wen-dang-docs/emit_cheatsheet
    socket.on('getsocket',function(fc){
        console.log(socket.id)
        console.log(socket.rooms)
    })

    socket.emit('news', { hello: 'world newsnewsnewsnewsnewsnewsnews' });
    socket.on('my other event', function (data) {
        console.log(data);
        setTimeout(() => {
            socket.emit('haha', { hello: 'world11111111111' });
        }, 3000);
    });

    //消息确认
    socket.on('ferret',(name,word,fn)=>{
        fn(name+'says'+word)
    })

    // 广播

    socket.on('触发广播',(fc)=>{
        // 好像自己接收不到消息
        socket.broadcast.emit('接收广播',`手动触发广播${new Date()}`)
        fc('触发成功')
    })


    socket.on('进入房间',(str)=>{
        console.log(str)
        socket.join(str,()=>{
            console.log(socket.rooms)
            let rooms= Object.keys(socket.rooms);
            console.log(rooms); // [ <socket.id>, 'room 237' ]
            io.to(str).emit('msg','一个用户加入房间'); // 广播给房间里的每个人
        })
    })


    //指定id发送
    // socket.broadcast.to('socketId').emit('hi',"hi") //给指定人发送
});




