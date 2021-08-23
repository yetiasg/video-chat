'use strict'
const webSocket = new WebSocket('ws://localhost:3000');

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

let username
let localStream
let peerConn

function startCall() {
    document.getElementById("video-call-container").style.display = "inline"

    navigator.mediaDevices
        .getUserMedia({
            video: {
                frameRate: 30,
                height: '100%',
                aspectRatio: 16/9
            },
            audio: true
        }).then(stream => {
            localStream = stream
            document.getElementById("local-video").srcObject = localStream

            let configuration = {
                iceServers: [
                    {
                        "urls": [
                            "stun:stun.l.google.com:19302", 
                            "stun:stun1.l.google.com:19302", 
                            "stun:stun2.l.google.com:19302"
                        ]
                    }
                ]
            }

            peerConn = new RTCPeerConnection(configuration)
            peerConn.addStream(localStream)
            peerConn.onaddstream = (e) => {
                document.getElementById("remote-video")
                .srcObject = e.stream
            }

            peerConn.onicecandidate = ((e) => {
                if (e.candidate == null)
                    return
                sendData({
                    type: "store_candidate",
                    candidate: e.candidate
                })
            })
            createAndSendOffer()
        })
        .catch (error => {
            console.log(error)
        });
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })
        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(new RTCSessionDescription(data.answer))

            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
            break
    }
}

function sendUsername() {
    username = document.getElementById("username-input").value
    sendData({
        type: "store_user"
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}