import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from "react-native-webrtc";

import {
  doc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../config/firebase";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callRef = null;
    this.listeners = [];
    this.onRemoteStreamCallback = null;
    this.onIceCandidateCallback = null;
  }

  async createPeer() {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];

        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    return this.peerConnection;
  }

  async getLocalStream(video = true) {
    if (this.localStream) {
      return this.localStream;
    }

    this.localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: video
        ? {
            facingMode: "user",
            width: 640,
            height: 480,
          }
        : false,
    });

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    return this.localStream;
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();

    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  async createAnswer() {
    const answer = await this.peerConnection.createAnswer();

    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }
  async setRemoteDescription(description) {
    if (!this.peerConnection) {
      await this.createPeer();
    }

    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description)
    );
  }

  async addIceCandidate(candidate) {
    if (!candidate) return;

    try {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (error) {
      console.log("ICE Candidate Error:", error);
    }
  }

  onIceCandidate(callback) {
    this.onIceCandidateCallback = callback;
  }

  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  async createCall(callId, offer) {
    this.callRef = doc(db, "calls", callId);

    await setDoc(this.callRef, {
      offer,
      answer: null,
      status: "calling",
      createdAt: Date.now(),
    });

    const unsubscribe = onSnapshot(this.callRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();

      if (
        data.answer &&
        !this.peerConnection.currentRemoteDescription
      ) {
        this.setRemoteDescription(data.answer);
      }
    });

    this.listeners.push(unsubscribe);

    return true;
  }

  async answerCall(callId, answer) {
    this.callRef = doc(db, "calls", callId);

    await updateDoc(this.callRef, {
      answer,
      status: "connected",
    });
  }

  async sendIceCandidate(callId, type, candidate) {
    const candidates = collection(
      db,
      "calls",
      callId,
      type
    );

    await addDoc(candidates, candidate.toJSON());
  }
  listenForIceCandidates(callId, type, callback) {
    const candidatesRef = collection(
      db,
      "calls",
      callId,
      type
    );

    const unsubscribe = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          callback(change.doc.data());
        }
      });
    });

    this.listeners.push(unsubscribe);

    return unsubscribe;
  }

  async getCall(callId) {
    const snapshot = await getDoc(doc(db, "calls", callId));

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data();
  }

  async endCall() {
    this.listeners.forEach((unsubscribe) => unsubscribe());

    this.listeners = [];

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callRef = null;
  }
}

export default new WebRTCService();

export const createPeer = () =>
  WebRTCService.createPeer?.();

export const getLocalStream = (video = true) =>
  WebRTCService.getLocalStream?.(video);

export const createOffer = () =>
  WebRTCService.createOffer?.();

export const createAnswer = () =>
  WebRTCService.createAnswer?.();

export const setRemoteDescription = (description) =>
  WebRTCService.setRemoteDescription?.(description);

export const onIceCandidate = (callback) =>
  WebRTCService.onIceCandidate?.(callback);

export const onRemoteStream = (callback) =>
  WebRTCService.onRemoteStream?.(callback);

export const createCall = (callId, offer) =>
  WebRTCService.createCall?.(callId, offer);

export const answerCall = (callId, answer) =>
  WebRTCService.answerCall?.(callId, answer);

export const sendIceCandidate = (callId, type, candidate) =>
  WebRTCService.sendIceCandidate?.(callId, type, candidate);

export const listenForIceCandidates = (
  callId,
  type,
  callback
) =>
  WebRTCService.listenForIceCandidates?.(
    callId,
    type,
    callback
  );

export const getCall = (callId) =>
  WebRTCService.getCall?.(callId);

export const endCall = () =>
  WebRTCService.endCall?.();
