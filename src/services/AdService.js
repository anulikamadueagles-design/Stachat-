import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

const adsRef = collection(db, "ads");

// Placement types the rest of the app knows how to render.
export const AD_PLACEMENTS = {
  CHAT_LIST: "chat_list",
  STATUS: "status",
  CHANNEL: "channel",
  BANNER: "banner",
  FULLSCREEN: "fullscreen",
};

// A business submitting a request to advertise. This does NOT charge
// anyone — see PaymentService.js for why real payment collection needs
// a backend. This just records the request in "pending_payment" status
// for an admin to review and activate once payment is confirmed
// out-of-band (bank transfer, payment link, invoice, etc).
export async function submitAdRequest(data) {
  return await addDoc(adsRef, {
    businessName: data.businessName,
    contactEmail: data.contactEmail,
    title: data.title,
    description: data.description || "",
    imageUrl: data.imageUrl || null,
    linkUrl: data.linkUrl,
    placement: data.placement,
    scheduleStart: data.scheduleStart,
    scheduleEnd: data.scheduleEnd,
    priceTier: data.priceTier || null,
    amount: data.amount || null,
    currency: data.currency || "USD",
    status: "pending_payment",
    paymentStatus: "unpaid",
    paymentRef: null,
    impressions: 0,
    clicks: 0,
    createdBy: data.createdBy || null,
    createdAt: serverTimestamp(),
  });
}

// Admin creating a house ad directly (e.g. promoting their own
// business/channel) — goes live immediately, no payment step.
export async function createHouseAd(data) {
  return await addDoc(adsRef, {
    businessName: data.businessName,
    contactEmail: data.contactEmail || "",
    title: data.title,
    description: data.description || "",
    imageUrl: data.imageUrl || null,
    linkUrl: data.linkUrl,
    placement: data.placement,
    scheduleStart: data.scheduleStart,
    scheduleEnd: data.scheduleEnd,
    priceTier: "house",
    amount: 0,
    currency: data.currency || "USD",
    status: "active",
    paymentStatus: "paid",
    paymentRef: "house",
    impressions: 0,
    clicks: 0,
    createdBy: data.createdBy || null,
    createdAt: serverTimestamp(),
  });
}

// Admin dashboard: every ad, any status.
export function subscribeAllAds(callback) {
  const q = query(adsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    );
  });
}

// Public-facing placements: only ads that are active, paid, and
// currently inside their scheduled window. Filtered client-side to
// avoid requiring a composite Firestore index for every combination
// of placement + status + date range.
export function subscribeActiveAds(placement, callback) {
  const q = query(adsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const now = Date.now();

    const active = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((ad) => {
        if (ad.placement !== placement) return false;
        if (ad.status !== "active") return false;
        if (ad.paymentStatus !== "paid") return false;
        if (ad.scheduleStart && now < ad.scheduleStart) return false;
        if (ad.scheduleEnd && now > ad.scheduleEnd) return false;
        return true;
      });

    callback(active);
  });
}

export async function updateAdStatus(adId, status) {
  await updateDoc(doc(db, "ads", adId), { status });
}

// Lets an admin edit an ad's actual content (title, image, link,
// schedule, etc) after it's been created — previously only status
// (active/paused) could be changed, not the ad itself.
export async function updateAdContent(adId, data) {
  await updateDoc(doc(db, "ads", adId), data);
}

// Ads a given user submitted, regardless of status — so an advertiser
// can check on their own request without needing admin access.
export function subscribeMyAds(uid, callback) {
  const q = query(adsRef, where("createdBy", "==", uid));

  return onSnapshot(q, (snapshot) => {
    const ads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    ads.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(ads);
  });
}

// Called by an admin once payment has actually been confirmed
// out-of-band. See PaymentService.js.
export async function markAdPaidAndActivate(adId, paymentRef = "manual") {
  await updateDoc(doc(db, "ads", adId), {
    paymentStatus: "paid",
    paymentRef,
    status: "active",
  });
}

export async function deleteAd(adId) {
  await deleteDoc(doc(db, "ads", adId));
}

export async function recordImpression(adId) {
  await updateDoc(doc(db, "ads", adId), {
    impressions: increment(1),
  }).catch(() => {});
}

export async function recordClick(adId) {
  await updateDoc(doc(db, "ads", adId), {
    clicks: increment(1),
  }).catch(() => {});
}
