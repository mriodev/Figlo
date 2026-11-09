import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAds } from "./AdsProvider";
import { AD_UNITS } from "./adUnits";

export function HomeBanner() {
  const { ready } = useAds();
  const insets = useSafeAreaInsets();
  if (!ready) return null;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 items-center bg-surface-light dark:bg-surface-dark"
      style={{ paddingBottom: insets.bottom }}
    >
      <BannerAd
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}
