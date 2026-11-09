import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";
import { AD_UNITS } from "./adUnits";

const COOLDOWN_MS = 3 * 60 * 1000; // at most once every 3 minutes
const START_GRACE_MS = 2 * 60 * 1000; // none in the first 2 minutes
const VISITS_NEEDED = 3; // after 3 calculator visits

let ad: InterstitialAd | null = null;
let loaded = false;
let lastShown = 0;
let visits = 0;
const appStart = Date.now();

export function initInterstitial() {
  if (ad) return;
  ad = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);

  ad.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    ad?.load(); // get the next one ready
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    setTimeout(() => ad?.load(), 60_000); // retry later, quietly
  });

  ad.load();
}

/** Call when the user returns home after using a calculator */
export function onCalculatorExit() {
  visits++;
  const now = Date.now();
  if (!ad || !loaded) return;
  if (visits < VISITS_NEEDED) return;
  if (now - appStart < START_GRACE_MS) return;
  if (now - lastShown < COOLDOWN_MS) return;

  visits = 0;
  lastShown = now;
  ad.show();
}
