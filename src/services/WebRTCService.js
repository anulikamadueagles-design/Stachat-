import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices
} from "react-native-webrtc";

const configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
      ]
    }
  ]
};

let peerConnection = null;
let localStream = null;

export async function createPeer() {

  peerConnection = new RTCPeerConnection(configuration);

  return peerConnection;

}

export async function getLocalStream(video = false) {

  localStream = await mediaDevices.getUserMedia({

    audio: true,

    video: video
      ? {
          facingMode: "user",
          width: 640,
          height: 480
        }
      : false

  });

  localStream.getTracks().forEach(track => {

    peerConnection.addTrack(track, localStream);

  });

  return localStream;

}

export async function createOffer() {

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  return offer;

}

export async function createAnswer() {

  const answer = await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(answer);

  return answer;

}

export async function setRemoteDescription(description) {

  await peerConnection.setRemoteDescription(

    new RTCSessionDescription(description)

  );

}

export async function addIceCandidate(candidate) {

  await peerConnection.addIceCandidate(

    new RTCIceCandidate(candidate)

  );

}

export function onIceCandidate(callback) {

  peerConnection.onicecandidate = event => {

    if (event.candidate) {

      callback(event.candidate);

    }

  };

}

export function onRemoteStream(callback) {

  peerConnection.ontrack = event => {

    callback(event.streams[0]);

  };

}

export function closeConnection() {

  if (localStream) {

    localStream.getTracks().forEach(track => track.stop());

  }

  if (peerConnection) {

    peerConnection.close();

  }

  peerConnection = null;
  localStream = null;

}
