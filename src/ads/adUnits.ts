import { TestIds } from "react-native-google-mobile-ads";

// Real IDs go here before publishing (from your AdMob account).
const PROD = {
  banner: "ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB",
  interstitial: "ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII",
};

// Test ads in development, real ads only in release builds
export const AD_UNITS = __DEV__
  ? { banner: TestIds.ADAPTIVE_BANNER, interstitial: TestIds.INTERSTITIAL }
  : PROD;
