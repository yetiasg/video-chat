const webSocket = new WebSocket('ws://localhost:3000');

let username = null;
function sendUsername(){
  username = document.querySelector('#username-input').value;
  sendData({
    type: 'store_user',
    username
  });
}

function sendData(data){
  webSocket.send(JSON.stringify(data));
}

let localStream = null;
function startCall(){
  document.querySelector('#video-call-container').style.display = "block";
  navigator.getUserMedia({
    video: {
      frameRate: 30,
      height: '100%',
      aspectRatio: 16/9
    },
    audio: false
  }, stream => {
    localStream = stream;
    document.querySelector('#local-video').srcObject = localStream;
  }, error => console.log(error));
}