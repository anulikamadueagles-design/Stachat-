/*
 * Web-safe WebRTC service.
 * The native Android/iOS implementation remains in WebRTCService.js.
 */

export const initializeWebRTC = async () => null;

export const createPeerConnection = async () => null;

export const createOffer = async () => null;

export const createAnswer = async () => null;

export const setRemoteDescription = async () => null;

export const addIceCandidate = async () => null;

export const closePeerConnection = async () => null;

export const startCall = async () => null;

export const endCall = async () => null;

export const answerCall = async () => null;

export const rejectCall = async () => null;

export const toggleMute = async () => null;

export const toggleVideo = async () => null;

export default {
  initializeWebRTC,
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  closePeerConnection,
  startCall,
  endCall,
  answerCall,
  rejectCall,
  toggleMute,
  toggleVideo,
};
