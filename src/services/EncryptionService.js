// react-native-get-random-values MUST be imported before tweetnacl —
// tweetnacl needs a secure random source to generate keys/nonces, and
// none exists by default in React Native (no window.crypto, no Node
// "crypto" module). Without this polyfill, key generation throws at
// runtime with "no PRNG" the first time anyone tries to use it.
import "react-native-get-random-values";
import nacl from "tweetnacl";
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from "tweetnacl-util";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { db } from "../config/firebase";

const PRIVATE_KEY_STORAGE_PREFIX = "stachat:e2e:privateKey:";

/**
 * HOW THIS WORKS (and its honest limits)
 * ========================================
 * Each user has an X25519 keypair. The PRIVATE key never leaves the
 * device — it's stored in AsyncStorage only, never written to
 * Firestore. The PUBLIC key is published to users/{uid}.publicKey so
 * other people can encrypt messages to you.
 *
 * 1:1 messages use nacl.box (X25519 + XSalsa20-Poly1305): the sender
 * encrypts with (their private key, recipient's public key), and
 * because of how Diffie-Hellman works, the recipient can decrypt with
 * (their private key, sender's public key) — same shared secret both
 * ways. This means Firestore/Firebase only ever sees ciphertext for
 * message text.
 *
 * Group messages use a random per-message symmetric key (nacl.secretbox
 * for the actual content), then that symmetric key is individually
 * "wrapped" (nacl.box) for each group member using their public key.
 * This is a real, working scheme, but it's simplified compared to what
 * Signal/WhatsApp actually run (e.g. no forward secrecy / key
 * ratcheting, no verified safety numbers, no protection against a
 * malicious server swapping someone's published public key). Treat
 * this as "the server operator can no longer casually read your
 * messages," not as an audited, state-of-the-art protocol.
 *
 * KNOWN LIMITATION: if you lose the device or reinstall the app
 * without exporting your key first (see BackupScreen), your old
 * messages become permanently undecryptable — there is no recovery,
 * by design (that's what makes it end-to-end). Media (images/video/
 * voice/documents) is NOT encrypted by this pass — only text.
 */

function keyStorageKey(uid) {
  return PRIVATE_KEY_STORAGE_PREFIX + uid;
}

// Returns { publicKey, secretKey } as base64 strings. Creates a new
// keypair and publishes the public half to Firestore if none exists
// locally yet for this uid.
export async function loadOrCreateKeyPair(uid) {

  const stored = await AsyncStorage.getItem(keyStorageKey(uid));

  if (stored) {
    return JSON.parse(stored);
  }

  const pair = nacl.box.keyPair();

  const keyPairB64 = {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey),
  };

  await AsyncStorage.setItem(keyStorageKey(uid), JSON.stringify(keyPairB64));

  await setDoc(
    doc(db, "users", uid),
    { publicKey: keyPairB64.publicKey },
    { merge: true }
  );

  return keyPairB64;
}

export async function getMyPrivateKey(uid) {
  const stored = await AsyncStorage.getItem(keyStorageKey(uid));
  return stored ? JSON.parse(stored).secretKey : null;
}

export async function getPublicKeyForUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data()?.publicKey || null : null;
}

// Lets someone export their private key (e.g. before switching
// devices) so they can import it later and keep reading old messages.
// This is sensitive — treat the exported value like a password.
export async function exportPrivateKeyForBackup(uid) {
  const stored = await AsyncStorage.getItem(keyStorageKey(uid));
  return stored; // JSON string, or null if no keypair yet
}

export async function importPrivateKeyFromBackup(uid, keyPairJson) {
  const parsed = JSON.parse(keyPairJson);

  if (!parsed.publicKey || !parsed.secretKey) {
    throw new Error("That doesn't look like a valid STAChat encryption key.");
  }

  await AsyncStorage.setItem(keyStorageKey(uid), keyPairJson);

  // Re-publish in case this is a new device and Firestore has a
  // different (newer, unrelated) public key on file.
  await setDoc(
    doc(db, "users", uid),
    { publicKey: parsed.publicKey },
    { merge: true }
  );
}

// ---- 1:1 message encryption ----

export function encryptText(plainText, recipientPublicKeyB64, myPrivateKeyB64) {

  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  const cipher = nacl.box(
    decodeUTF8(plainText),
    nonce,
    decodeBase64(recipientPublicKeyB64),
    decodeBase64(myPrivateKeyB64)
  );

  return {
    cipherText: encodeBase64(cipher),
    nonce: encodeBase64(nonce),
  };

}

// Returns the decrypted string, or null if decryption failed (wrong/
// missing keys — e.g. you lost your private key on a new device).
export function decryptText(cipherTextB64, nonceB64, otherPartyPublicKeyB64, myPrivateKeyB64) {

  try {

    const opened = nacl.box.open(
      decodeBase64(cipherTextB64),
      decodeBase64(nonceB64),
      decodeBase64(otherPartyPublicKeyB64),
      decodeBase64(myPrivateKeyB64)
    );

    if (!opened) return null;

    return encodeUTF8(opened);

  } catch (error) {

    return null;

  }

}

// ---- Group message encryption ----
// One random symmetric key per message, wrapped individually for each
// member's public key. Note: this does one nacl.box wrap per member
// per message — fine for small groups, but it means encrypting a
// group message gets linearly more expensive as the group grows. A
// production version would want sender-keys or similar to avoid that.

export function encryptGroupText(plainText, memberPublicKeys, myUid, myPrivateKeyB64) {

  const messageKey = nacl.randomBytes(nacl.secretbox.keyLength);
  const contentNonce = nacl.randomBytes(nacl.secretbox.nonceLength);

  const cipherText = nacl.secretbox(
    decodeUTF8(plainText),
    contentNonce,
    messageKey
  );

  const wrappedKeys = {};

  for (const [uid, publicKeyB64] of Object.entries(memberPublicKeys)) {

    if (!publicKeyB64) continue; // member hasn't published a key yet

    const wrapNonce = nacl.randomBytes(nacl.box.nonceLength);

    const wrapped = nacl.box(
      messageKey,
      wrapNonce,
      decodeBase64(publicKeyB64),
      decodeBase64(myPrivateKeyB64)
    );

    wrappedKeys[uid] = {
      wrappedKey: encodeBase64(wrapped),
      wrapNonce: encodeBase64(wrapNonce),
    };

  }

  return {
    cipherText: encodeBase64(cipherText),
    contentNonce: encodeBase64(contentNonce),
    wrappedKeys,
  };

}

export function decryptGroupText(message, myUid, myPrivateKeyB64, senderPublicKeyB64) {

  try {

    const mine = message.wrappedKeys?.[myUid];
    if (!mine) return null;

    const messageKey = nacl.box.open(
      decodeBase64(mine.wrappedKey),
      decodeBase64(mine.wrapNonce),
      decodeBase64(senderPublicKeyB64),
      decodeBase64(myPrivateKeyB64)
    );

    if (!messageKey) return null;

    const opened = nacl.secretbox.open(
      decodeBase64(message.cipherText),
      decodeBase64(message.contentNonce),
      messageKey
    );

    if (!opened) return null;

    return encodeUTF8(opened);

  } catch (error) {

    return null;

  }

}
