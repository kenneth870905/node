var mysql = require('mysql');
var connection;
function handleDisconnect() {
    // connection = mysql.createConnection({
    connection = mysql.createPool({
        host: '127.0.0.1',	// 连接的服务器
        port:"3307",
        user: 'root',	// 用户名
        password: '123456',	// 用户密码
        database: 'socket_io',	// 选择的库
    });
    
    // connection.connect(function(err) {              // The server is either down
    //     if(err) {                                     // or restarting (takes a while sometimes).
    //         console.log('error when connecting to db:', err);
    //         setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    //     }                                     // to avoid a hot loop, and to allow our node script to
    // });                                     // process asynchronous requests in the meantime.
    //                                           // If you're also serving http, display a 503 error.
    // connection.on('error', function(err) {
    //     console.log('db error', err);
    //     if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    //         handleDisconnect();                         // lost due to either server restart, or a
    //     } else {                                      // connnection idle timeout (the wait_timeout
    //         throw err;                                  // server variable configures this)
    //     }
    // });
}

handleDisconnect();

const queryUserById = (id) =>{
    return new Promise((resolve, reject) => {
        // connection.connect();
        connection.query(`SELECT * FROM user WHERE id=${id}`, (err, results, fields) => {
            if (err) {
                resolve({})
                throw err;
            };
            let o = results.length > 0 ? results[0] : {};
            delete o.pwd
            // console.log('The solution is:', results[0].solution);	// 返回第一条记录的solution列的内容
            // return results;
            resolve(o)
        });
        // connection.end();
    });
}

module.exports = {
    queryUserById
}
// export {
//     queryUserById
// }





