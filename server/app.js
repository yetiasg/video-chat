const Socket = require('websocket').server;
const http = require('http');

const server = http.createServer((req, res) => {})

server.listen(3000, () => console.log("Listening on port: 3000"));

const webSocket = new Socket({httpServer: server});
let users = [];

webSocket.on('request', (req) => {
  const connection = req.accept();

  connection.on('message', message => {
    const data = JSON.parse(message.utf8Data);

    const user = findUser(data.username)
    console.log(data.type);

    switch(data.type){
      case 'store_user': 
      if(user !=null) return;
        const newUser = {
          connection: connection,
          username: data.username
        }
        users.push(newUser);
        console.log(newUser.username);
        break;
      case 'store_offer': 
        if(user == null) return;
        user.offer = data.offer;
        console.log('store_offer');
        break;
      case 'store_candidate':
        if(user == null) return;
        if(user.candidates == null) user.candidates = [];
        user.candidates.push(data.candidate);
        console.log('candidate');
        break;
      case 'send_answer':
        if(user == null) return;
        sendData({
          type: 'answer',
          answer: data.answer
        }, user.connection);
        console.log('send_answer');
        break;
      case 'send_candidate':
        if(user == null) return;
        sendData({
          type: 'candidate',
          candidate: data.candidate
        }, user.connection);
        console.log('send_candidate');
        break;
      case 'join_call': 
        if(user == null) return;
        sendData({
          type: 'offer',
          offer: user.offer
        }, connection);
        console.log('join_call');
        user.candidates.forEach(candidate => {
          sendData({
            type: 'candidate',
            candidate
          }, connection)
        })
        break;
    }
  })
  connection.on('close', (reason, description) => {
    users.forEach(user => {
      if(user.connection = connection){
        users.splice(users.indexOf(user), 1);
        return
      }
    })
  })
})

function sendData(data, connection) {
  connection.send(JSON.stringify(data));
}


function findUser(username) {
    for (let i = 0;i < users.length;i++) {
        if (users[i].username == username)
            return users[i]
    }
}

