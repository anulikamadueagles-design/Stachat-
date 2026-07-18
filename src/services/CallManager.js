import {
  createPeer,
  getLocalStream,
  createOffer,
  createAnswer,
  setRemoteDescription,
  onIceCandidate,
  onRemoteStream
} from "./WebRTCService";

import {
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  subscribeCall
} from "./SignalingService";

export async function startCall(callId, video) {

  await createPeer();

  const stream =
    await getLocalStream(video);

  const offer =
    await createOffer();

  await sendOffer(callId, offer);

  onIceCandidate(candidate => {

    sendIceCandidate(
      callId,
      candidate,
      "callerCandidates"
    );

  });

  return stream;

}

export async function answerIncomingCall(callId, video) {

  await createPeer();

  const stream =
    await getLocalStream(video);

  subscribeCall(callId, async call => {

    if (call.offer) {

      await setRemoteDescription(call.offer);

      const answer =
        await createAnswer();

      await sendAnswer(callId, answer);

    }

  });

  onIceCandidate(candidate => {

    sendIceCandidate(
      callId,
      candidate,
      "receiverCandidates"
    );

  });

  return stream;

}

export function listenForRemote(callId, callback) {

  subscribeCall(callId, async call => {

    if (call.answer) {

      await setRemoteDescription(
        call.answer
      );

    }

    callback(call);

  });

}

export function listenRemoteStream(callback) {

  onRemoteStream(callback);

}
