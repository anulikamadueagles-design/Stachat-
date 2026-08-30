import { Linking } from "react-native";

/**
 * PAYMENT ARCHITECTURE — READ THIS BEFORE TAKING REAL MONEY
 * ============================================================
 *
 * This app has no backend server (it talks to Firebase directly from
 * the phone). That's fine for chat, but real payment processing
 * cannot be done safely or correctly from client code alone:
 *
 *   - You can't confirm a payment actually succeeded from the client;
 *     a malicious user could just call markAdPaidAndActivate() (or
 *     forge a network request) without ever paying.
 *   - Card data must never touch your own client code directly for
 *     PCI compliance reasons — this is exactly what hosted payment
 *     pages (Stripe Checkout, Paystack Checkout, etc) exist for.
 *
 * WHAT'S IMPLEMENTED NOW (manual, but honest and works today):
 *   1. Advertiser fills out the ad request (CreateAdScreen).
 *   2. AdService.submitAdRequest() saves it as "pending_payment".
 *   3. This file sends the advertiser to a payment link YOU set up
 *      (Stripe Payment Link, Paystack Payment Link, PayPal.me, bank
 *      transfer instructions — whatever you already have) and/or
 *      emails you the request.
 *   4. YOU confirm the money actually arrived (check your Stripe/
 *      Paystack/bank dashboard).
 *   5. You open the Admin Dashboard in-app and tap "Mark Paid &
 *      Activate" — AdService.markAdPaidAndActivate() flips the ad
 *      live.
 *
 * WHAT A FULLY AUTOMATED VERSION NEEDS LATER (not built here):
 *   - A small backend — Firebase Cloud Functions is the natural fit
 *     since you're already on Firebase, but it requires enabling the
 *     Blaze (pay-as-you-go) plan. It has a generous free tier, but
 *     it's no longer the zero-cost Spark plan.
 *   - A real payment provider account (Stripe or Paystack are the
 *     common choices) with a webhook endpoint hosted on that Cloud
 *     Function, which verifies the payment server-side and then
 *     calls markAdPaidAndActivate() itself — removing the manual
 *     step above.
 *   - The same pattern (Cloud Function + webhook) is what you'd reuse
 *     later for subscriptions/premium accounts.
 *
 * Fill in your real values below once you have them.
 */

// TODO: replace with your real payment link (Stripe Payment Link,
// Paystack Payment Link, PayPal.me, etc) and contact email.
export const PAYMENT_LINK_URL = "https://your-payment-link.example.com";
export const ADVERTISING_CONTACT_EMAIL = "ads@yourdomain.example.com";

export const PRICE_TIERS = {
  banner: { label: "Banner ad", amount: 10, currency: "USD", per: "day" },
  chat_list: { label: "Sponsored chat list post", amount: 15, currency: "USD", per: "day" },
  status: { label: "Sponsored status", amount: 15, currency: "USD", per: "day" },
  channel: { label: "Sponsored channel", amount: 20, currency: "USD", per: "day" },
  fullscreen: { label: "Full-screen ad", amount: 30, currency: "USD", per: "day" },
};

// Sends the advertiser to your external payment page, and/or opens an
// email pre-filled with the request so you can follow up manually.
export async function openPaymentFlow(ad) {
  const canOpenLink = await Linking.canOpenURL(PAYMENT_LINK_URL);

  if (canOpenLink) {
    await Linking.openURL(PAYMENT_LINK_URL);
    return;
  }

  await openContactEmail(ad);
}

export async function openContactEmail(ad) {
  const subject = encodeURIComponent(
    `STAChat ad request: ${ad.businessName || ""}`
  );

  const body = encodeURIComponent(
    `Ad ID: ${ad.id || "(pending)"}\n` +
      `Business: ${ad.businessName}\n` +
      `Placement: ${ad.placement}\n` +
      `Title: ${ad.title}\n` +
      `Link: ${ad.linkUrl}\n\n` +
      `Please confirm once payment is sent so this ad can be activated.`
  );

  const url = `mailto:${ADVERTISING_CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  await Linking.openURL(url);
}
