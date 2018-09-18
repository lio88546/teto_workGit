var http = require('http');//調用http函式庫
var mysql = require("mysql");//資料庫插件
var io = require('socket.io'); //加入 Socket.IO

//建立一個伺服器連結
var server = http.createServer(function(request, response){
    console.log('Connection');//印出連接字樣
  });
  
server.listen(8542);//伺服器port點指定
  
var serv_io = io.listen(server);// 開啟 Socket.IO 的 listener

//資料庫連結物件
var connection = mysql.createConnection({
  host: "192.168.30.118",
  user: "root",
  password: "passwords",
  database: "git",
});

//連接資料庫
connection.connect(function(error){
  if(error) throw error;
  console.log("DB connectied!");
});

//與瀏覽器端建立連結
serv_io.sockets.on('connection', function(socket) {
  //發送訊息給瀏覽器，確認連結
  socket.emit('message', {'connection': 'Condition Good'});
  
  //接瀏覽器訊息，確認連結
  socket.on('condition',function(msg){
    console.log(msg.condition);
  })
  
  var playerData = {};//存放玩家資料用

  //註冊
  socket.on('regs',function(regData) {
    console.log("task : "+regData.task);

    let today = new Date();
    //查詢是否重複
    let checkSql = "SELECT * FROM member " + 
               "WHERE id='" + regData.name + "' || name='" + regData.realName + "'";
    connection.query(checkSql, function(err, result){
      if (err) throw err;
      if(result.length > 0) {
        socket.emit('regsResult',{response : 'faile'});
        return;
      }     
      //註冊SQL
      let registerSql = "INSERT INTO "+
            "member ( id, passwords, name, sex, age, country, address, phone, regdate, regtime, record, money)"+
            " VALUES ( '" + regData.name + "', '"+
                            regData.psw + "', '"+
                            regData.realName + "', '"+
                            regData.sex + "', '"+
                            regData.age + "', '"+
                            regData.country + "', '"+
                            regData.address + "', '"+
                            regData.phone + "', '"+
                            today.toLocaleDateString() + "', '"+
                            today.toLocaleTimeString() + "', '"+
                            "0/0" + "', '"+
                            10000 + "' ) ;";
      connection.query(registerSql, function (err, result) {
        if (err) throw err;
        socket.emit('regsResult',{response : 'success'});
        //寫入LOG檔SQL
        let logfileSql = "INSERT INTO "+
        "log ( date, time, ip, type, note)"+
        " VALUES ( '" + today.toLocaleDateString() + "', '"+
                        today.toLocaleTimeString() + "', '"+
                        socket.request.connection.remoteAddress + "', '"+
                        "Register" + "', '"+
                        regData.name + " Register " + "' ) ;";
        connection.query(logfileSql, function (err, result) {
          if (err) throw err;
        });
      });
      
    });
  });

  //登入
  socket.on('login',function(loginData) {
    console.log("task : "+loginData.task);
    
    let sql = "SELECT * FROM member " + 
          "WHERE id='" + loginData.name + "' && passwords='" + loginData.psw + "'";
    connection.query(sql,function(error, loginResult, fields){
      if(loginResult != ""){
        let options = {year:'numeric', month: '2-digit', day: '2-digit' };
        let today = new Date();//取當下Date
        //寫入LOG檔SQL
        logfileSql = "INSERT INTO "+
        "log ( date, time, ip, type, note)"+
        " VALUES ( '" + today.toLocaleDateString() + "', '"+
                        today.toLocaleTimeString() + "', '"+
                        socket.request.connection.remoteAddress + "', '"+
                        "Login" + "', '"+
                        loginData.name + " Login " + "' ) ;";
        connection.query(logfileSql, function (err, logResult) {
          if (err) throw err;
          loginResult[0].regdate = loginResult[0].regdate.toLocaleDateString('ch',options);
          socket.emit('logResult',{response : 'success'});
          socket.emit('loginMemberData',{loginResult});//回傳登入成功的會員資料
          playerData = loginResult[0];//存放會員資料
        });
      } else {
        socket.emit('logResult',{response : 'faile'});
      }
    });
    
  });
  
  
  //遊戲後台
  //接賭注要求
  socket.on('bet',function(bet){
    console.log("task : bet");
    let today = new Date();//取當下Date
    let record = playerData.record.split('/');
    let logNote = {
      'betMoney' : bet.betMoney,
      'originalMoney' : playerData.money,
      'lastMoney' : 0,
      'result' : ''
    };
    let ran =  Math.floor(Math.random()*2)
    switch(ran){
      case 0:
        playerData.money += bet.betMoney;
        record[0]++;
        logNote.lastMoney = playerData.money;
        logNote.result = 'win';
        break;
      case 1:
        playerData.money -= bet.betMoney;
        record[1]++;
        logNote.lastMoney = playerData.money;
        logNote.result = 'lose';
        break;
    }
    playerData.record = record[0] + '/' + record[1];
    logNote = logNote.betMoney + '/' + logNote.originalMoney + '/' + logNote.lastMoney + '/' + logNote.result;
    

    //更新玩家資料SQL
    let UpdateSql = "UPDATE member" + 
                    " set money='" + playerData.money +  "' ," +
                    " record='" + playerData.record + "'"+ 
                    " WHERE id ='" + playerData.id + "'";
    connection.query(UpdateSql, function (err, result) {
    if (err) throw err;
    });

    //寫入LOG檔SQL
    let logfileSql = "INSERT INTO "+
    "log ( date, time, ip, type, note)"+
    " VALUES ( '" + today.toLocaleDateString() + "', '"+
                    today.toLocaleTimeString() + "', '"+
                    socket.request.connection.remoteAddress + "', '"+
                    "Bet" + "', '"+
                    logNote +  "' ) ;";
    connection.query(logfileSql, function (err, logResult) {
      if (err) throw err;
      socket.emit('betResult',{playerData});
    });
    
  });


});