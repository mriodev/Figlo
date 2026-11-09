import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import mobileAds, {
    AdsConsent,
    AdsConsentPrivacyOptionsRequirementStatus,
} from "react-native-google-mobile-ads";
import { initInterstitial } from "./interstitial";

type AdsState = {
  ready: boolean;
  privacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdsContext = createContext<AdsState>({
  ready: false,
  privacyOptionsRequired: false,
  showPrivacyOptions: async () => {},
});

export const useAds = () => useContext(AdsContext);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const started = useRef(false);

  const start = useCallback(async () => {
    try {
      const info = await AdsConsent.getConsentInfo();
      setPrivacyOptionsRequired(
        info.privacyOptionsRequirementStatus ===
          AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      );
      if (!info.canRequestAds || started.current) return;
      started.current = true;

      await mobileAds().initialize();
      initInterstitial();
      setReady(true);
    } catch (e) {
      console.warn("Ads start failed", e);
    }
  }, []);

  useEffect(() => {
    AdsConsent.gatherConsent()
      .then(start)
      .catch((e) => console.warn("Consent failed", e));
    // Also try with the previous session's consent, in parallel
    start();
  }, [start]);

  const showPrivacyOptions = useCallback(async () => {
    try {
      await AdsConsent.showPrivacyOptionsForm();
      await start();
    } catch (e) {
      console.warn("Privacy options failed", e);
    }
  }, [start]);

  return (
    <AdsContext.Provider
      value={{ ready, privacyOptionsRequired, showPrivacyOptions }}
    >
      {children}
    </AdsContext.Provider>
  );
}
