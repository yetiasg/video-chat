const webSocket = new WebSocket('ws://localhost:3000');

webSocket.onmessage = e => {
  handleSignalingData(JSON.parse(e.data));
}

function handleSignalingData(data) {
  switch (data.type){
    case "answer":
      peerConnection.setRemoteDescription(data.answer);
      break;
    case "candidate": 
      peerConnection.addIceCandidate(data.candidate)
      break;
  }
}

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
let peerConnection = null;
function startCall(){
  document.querySelector('#video-call-container').style.display = "block";
  navigator.getUserMedia({
    video: {
      frameRate: 30,
      height: '100%',
      aspectRatio: 16/9
    },
    audio: true
  }, stream => {
    localStream = stream;
    document.querySelector('#local-video').srcObject = localStream;

    let config = {
      iceServers: [
        {
          'urls': ['stun.l.google.com:19302',
            'stun1.l.google.com:19302',
            'stun2.l.google.com:19302']
        }
      ]
    }

    peerConnection = new RTCPeerConnection(config);
    peerConnection.addStream(localStream);

    peerConnection.onaddstream = e => {
      document.querySelector('#remote-video').srcObject = e.stream;
    }

    peerConnection.onicecandidate = e => {
      if( e.candidate == null) return;
      sendData({
        type: "store_candidate",
        candidate: e.candidate
      })
    }

    createAndSendOffer()
  }, error => console.log(error));
}

function createAndSendOffer(){
  peerConnection.createOffer( offer => {
    sendData({
      type: 'store_offer',
      offer
    })
    peerConnection.setLocatConnection(offer);
  }, error => console.log(error));
}

let isAudio = true;
function muteAudio(){
  isAudio = !isAudio;
  localStream.getAudioTracks()[0].enable = isAudio;
}

let isVideo = true;
function muteVideo(){
  isVideo = !isVideo;
  localStream.getVideoTrack[0].enable = isVideo;
}