'use strict'
const webSocket = new WebSocket('ws://localhost:3000');

webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
  switch (data.type) {
      case "offer":
          peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
          createAndSendAnswer()
          break
      case "candidate":
          peerConnection.addIceCandidate(data.candidate)
          break
  }
}


function createAndSendAnswer () {
  peerConnection.createAnswer((answer) => {
      peerConnection.setLocalDescription(answer)
      sendData({
          type: "send_answer",
          answer: answer
      })
  }, error => {
      console.log(error)
  })
}


function sendData(data){
  data.username = username
  webSocket.send(JSON.stringify(data)); 
}

let localStream = null;
let peerConnection = null;
let username;

function joinCall() {

  username = document.getElementById("username-input").value

  document.getElementById("video-call-container")
  .style.display = "inline"

  navigator.getUserMedia({
      video: {
          frameRate: 30,
          width: {
              min: 480, ideal: 720, max: 1280
          },
          aspectRatio: 1.33333
      },
      audio: true
  }, (stream) => {
      localStream = stream
      document.getElementById("local-video").srcObject = localStream

      let configuration = {
          iceServers: [
              {
                  "urls": ["stun:stun.l.google.com:19302", 
                  "stun:stun1.l.google.com:19302", 
                  "stun:stun2.l.google.com:19302"]
              }
          ]
      }

      peerConnection = new RTCPeerConnection(configuration)
      peerConnection.addStream(localStream)

      peerConnection.onaddstream = (e) => {
          document.getElementById("remote-video")
          .srcObject = e.stream
      }

      peerConnection.onicecandidate = ((e) => {
          if (e.candidate == null)
              return
          
          sendData({
              type: "send_candidate",
              candidate: e.candidate
          })
      })

      sendData({
          type: "join_call"
      })

    sendData({
      type: 'join_call',
    })
  }, error => console.log(error));
}

let isAudio = true;
function muteAudio(){
  isAudio = !isAudio;
  localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;
function muteVideo(){
  isVideo = !isVideo;
  localStream.getVideoTracks()[0].enabled = isVideo;
}