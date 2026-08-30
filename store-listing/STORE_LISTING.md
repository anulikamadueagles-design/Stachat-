# STAChat — Play Store Listing

Ready-to-paste content for the Play Console "Store listing" page, plus
a checklist of what's still needed from you before you can submit.

---

## App name
STAChat

## Short description (max 80 characters)
Fast, secure messaging with calls, groups, status updates & more

(80/80 — Play Console will reject anything longer)

## Full description (max 4000 characters)

STAChat is a fast, secure messaging app built for real conversations —
one-to-one chats, group chats, voice and video calls, status updates,
and rich media sharing, all in one place.

MESSAGING
• Real-time one-to-one and group chats
• Photos, videos, voice notes, and documents
• Message reactions, replies, and forwarding
• Read receipts and typing indicators
• Delete for me or delete for everyone

CALLING
• Voice and video calls
• Incoming call alerts, even when the app is in the background

STATUS
• Share photo and video updates that disappear after 24 hours
• See who's viewed your status

GROUPS
• Create groups and manage members
• Group admin controls for owners

PRIVACY
• Control who sees your online status and last seen time
• Delete your account and data at any time

STAChat is actively developed with new features shipping regularly.

---

## Category
Communication

## Tags / keywords (for your own reference — not directly submitted)
messaging, chat, video call, voice call, group chat, status, secure chat

## Contact details (required by Play Console)
- Email: [YOUR SUPPORT EMAIL]
- Website: [YOUR WEBSITE, if any — optional]
- Privacy Policy URL: [SEE "Privacy Policy Hosting" BELOW — required]

---

## Assets included in this folder

- `feature-graphic.png` — 1024×500, required for the store listing header
- `icon-512-store-listing.png` — 512×512, for the Play Console icon upload field specifically (separate from the app's own `assets/icon.png`, which is 1024×1024 for the app bundle itself)
- `privacy-policy.html` — required, see hosting instructions below

## Assets you still need to produce yourself

Play Console requires actual screenshots of the running app — these
can only be captured from a real device/emulator, not generated:

- **Phone screenshots**: minimum 2, recommended 4–8. 16:9 or 9:16
  aspect ratio, JPEG or 24-bit PNG (no alpha), each dimension between
  320px and 3840px. Good screens to capture: Chats list, an open
  conversation with media, a video call, Status, and a group chat.

## Privacy Policy hosting

Play Console requires a **public URL**, not just an HTML file. The
`privacy-policy.html` in this folder needs to be hosted somewhere
reachable — the simplest free option:

1. Create a public GitHub repo (or use your existing Vector Assistant
   AI GitHub Pages setup).
2. Upload `privacy-policy.html` to it.
3. Enable GitHub Pages for that repo (Settings → Pages).
4. Your URL will be something like
   `https://<username>.github.io/<repo>/privacy-policy.html`.
5. Paste that URL into Play Console's "Privacy Policy" field, and also
   update `ADVERTISING_CONTACT_EMAIL`/support links if needed.

Before publishing anywhere, open `src/constants/privacyPolicyText.js`
and replace `[YOUR CONTACT EMAIL]` with a real address — this also
updates the in-app Privacy Policy screen automatically since both use
the same source text.

## Content rating

You'll need to complete Play Console's content rating questionnaire.
Given STAChat allows user-generated messaging, photo/video sharing,
and calling between users, expect to answer "yes" to questions about
user communication/UGC — this typically lands around Teen and
requires the standard user-generated-content disclosures.

## Data safety section

Play Console also requires a separate "Data safety" form describing
what data you collect (see `privacy-policy.html` for the accurate
list: account info, messages/media, presence, call metadata) and
whether it's shared with third parties (per the policy: no third-party
ad networks, only Firebase/Google as your backend infrastructure).

## Before you submit — checklist

- [ ] Capture real screenshots on a device/emulator
- [ ] Host `privacy-policy.html` and get a public URL
- [ ] Fill in `[YOUR CONTACT EMAIL]` in `privacyPolicyText.js`
- [ ] Fill in `PAYMENT_LINK_URL` / `ADVERTISING_CONTACT_EMAIL` in
      `PaymentService.js` if the ad platform is live
- [ ] Set your own account's `isAdmin: true` in Firestore if you want
      dashboard access
- [ ] Deploy `firestore.rules` (Firebase Console → Firestore → Rules)
- [ ] Run `eas build --platform android --profile production`
      (this generates the signed `.aab` — EAS manages the signing
      keystore for you automatically on first run; just don't lose
      access to your Expo account, since that's where the keystore
      lives)
- [ ] Complete the content rating questionnaire in Play Console
- [ ] Complete the Data safety form in Play Console
- [ ] Submit for review
