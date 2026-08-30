import WebRTCService from "./WebRTCService";
import {
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  subscribeCall,
  subscribeIceCandidates,
} from "./SignalingService";

export async function startCall(callId, video = true) {
  await WebRTCService.createPeer();

  const stream = await WebRTCService.getLocalStream(video);

  const offer = await WebRTCService.createOffer();

  await sendOffer(callId, offer);

  WebRTCService.onIceCandidate((candidate) => {
    sendIceCandidate(callId, candidate, "callerCandidates");
  });

  subscribeIceCandidates(
    callId,
    "receiverCandidates",
    async (candidate) => {
      await WebRTCService.addIceCandidate(candidate);
    }
  );

  return stream;
}

export async function answerIncomingCall(callId, video = true) {
  await WebRTCService.createPeer();

  const stream = await WebRTCService.getLocalStream(video);

  subscribeCall(callId, async (call) => {
    if (call.offer) {
      await WebRTCService.setRemoteDescription(call.offer);

      const answer = await WebRTCService.createAnswer();

      await sendAnswer(callId, answer);
    }
  });

  WebRTCService.onIceCandidate((candidate) => {
    sendIceCandidate(callId, candidate, "receiverCandidates");
  });

  subscribeIceCandidates(
    callId,
    "callerCandidates",
    async (candidate) => {
      await WebRTCService.addIceCandidate(candidate);
    }
  );

  return stream;
}

export function listenForRemote(callback) {
  WebRTCService.onRemoteStream(callback);
}

export async function endCurrentCall() {
  await WebRTCService.endCall();
}
