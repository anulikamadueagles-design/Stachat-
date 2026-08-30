export const PRIVACY_POLICY_LAST_UPDATED = "August 2026";

// IMPORTANT: This is a starting draft based on what the app actually
// does, not legal advice. Have a lawyer review it before you publish
// to the Play Store, especially the contact email and any
// jurisdiction-specific requirements (GDPR, CCPA, etc) that may apply
// to you. Replace [YOUR CONTACT EMAIL] below with a real address.

export const PRIVACY_POLICY_TEXT = `STAChat Privacy Policy
Last updated: ${PRIVACY_POLICY_LAST_UPDATED}

This policy explains what information STAChat collects, how it's used, and the choices you have.

1. INFORMATION WE COLLECT

Account information: When you register, we collect your name, email address, and password (handled securely by Firebase Authentication — we never see or store your raw password).

Profile information: Your profile photo and bio, if you choose to add them.

Messages and media: Text messages are end-to-end encrypted — your message text is encrypted on your device before it's sent, and only the people in that conversation can decrypt it. We store the encrypted data, not the readable text. Images, videos, voice notes, and documents are currently NOT end-to-end encrypted (only text is, as of this version) — they're stored on our servers similarly to how most messaging apps handle media. Group messages are visible to all members of that group and use the same text encryption.

Status updates: Photos/videos you post to Status are visible to other users for 24 hours, then expire.

Presence information: Whether you're online, and when you were last active, so contacts can see your status (you can disable this in Settings > Privacy).

Call metadata: When calls happen, who was on them, and how long they lasted — not the audio/video content itself, which is transmitted directly between devices (peer-to-peer) and not stored by us.

Blocking and reports: If you block someone, we record that so their messages stop reaching you. If you report a user or message, we record the report (who reported, who/what was reported, and the reason) so it can be reviewed.

Device permissions: We request camera access (to take photos/videos), microphone access (for voice notes and calls), and photo library access (to share existing media) — only when you use those specific features.

2. HOW WE USE INFORMATION

To provide the core functionality of the app: messaging, calls, status updates, and group chats.
To show you sponsored content (ads) within the app. Ad impressions and clicks are counted in aggregate against each ad; we do not build individual behavioral advertising profiles or share your data with third-party ad networks.
To keep the app secure and prevent abuse.

3. THIRD-PARTY SERVICES

STAChat is built on Google Firebase (Authentication, Firestore Database, and Cloud Storage). Firebase processes and stores your account data, messages, and media on our behalf, subject to Google's own privacy and security practices. We do not use third-party advertising networks — sponsored content shown in the app is managed directly by us.

4. DATA RETENTION AND DELETION

You can delete your account at any time from Profile > Delete my account. This removes your account and profile information. Please note: messages you've sent in shared conversations with other people are not automatically deleted from those conversations when you delete your account, the same way deleting your account on most messaging apps doesn't erase messages from the other person's device/view. If you'd like specific content removed, contact us at the address below.

5. CHILDREN'S PRIVACY

STAChat is not intended for children under 13 (or the minimum age required by your local law, if higher). We don't knowingly collect information from children below that age.

6. YOUR CHOICES

You can control who sees your online status and last-seen time in Settings > Privacy.
You can block or report another user directly from a conversation.
You can export your encryption key (Settings > Chat Backup) before switching devices — without doing this first, you will permanently lose access to your old encrypted messages, since we don't have a copy of your key and can't recover it for you.
You can request a copy of your data or ask us to delete specific content by contacting us.
You can delete your account at any time from within the app.

7. CHANGES TO THIS POLICY

We may update this policy as the app changes. We'll update the "Last updated" date above when we do.

8. CONTACT US

Questions about this policy or your data? Contact us at: [YOUR CONTACT EMAIL]
`;
