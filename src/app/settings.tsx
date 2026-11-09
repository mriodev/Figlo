import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import {
  ChevronRight,
  Coins,
  Mail,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trash2,
} from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrency } from "@/hooks/useCurrency";
import { useAds } from "../ads/AdsProvider";
import { Card } from "../components/Card";
import { ScreenHeader } from "../components/ScreenHeader";
import { Segmented } from "../components/Segmented";
import { SheetSelect } from "../components/SheetSelect";
import { APP_NAME, PRIVACY_URL, SUPPORT_EMAIL } from "../constants/app";
import { useAppStore, type ThemeSetting } from "../store/useAppStore";

const { privacyOptionsRequired, showPrivacyOptions } = useAds();

const CURRENCIES = [
  { value: "", label: `Automatic (${useCurrency()})`, hint: "From phone" },
  { value: "Rs", label: "Rs", hint: "Sri Lankan Rupee" },
  { value: "₹", label: "₹", hint: "Indian Rupee" },
  { value: "$", label: "$", hint: "US Dollar" },
  { value: "€", label: "€", hint: "Euro" },
  { value: "£", label: "£", hint: "British Pound" },
  { value: "A$", label: "A$", hint: "Australian Dollar" },
  { value: "C$", label: "C$", hint: "Canadian Dollar" },
  { value: "AED", label: "AED", hint: "UAE Dirham" },
  { value: "SAR", label: "SAR", hint: "Saudi Riyal" },
  { value: "¥", label: "¥", hint: "Yen / Yuan" },
  { value: "₨", label: "₨", hint: "Pakistani Rupee" },
  { value: "৳", label: "৳", hint: "Bangladeshi Taka" },
  { value: "RM", label: "RM", hint: "Malaysian Ringgit" },
  { value: "₱", label: "₱", hint: "Philippine Peso" },
  { value: "₦", label: "₦", hint: "Nigerian Naira" },
];

const version = Constants.expoConfig?.version ?? "1.0.0";
const androidPackage = Constants.expoConfig?.android?.package ?? "";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const resetAll = useAppStore((s) => s.resetAll);

  const rateApp = () => {
    if (!androidPackage) return;
    Linking.openURL(`market://details?id=${androidPackage}`).catch(() =>
      Linking.openURL(
        `https://play.google.com/store/apps/details?id=${androidPackage}`,
      ),
    );
  };

  const shareApp = () =>
    Share.share({
      message: `Try ${APP_NAME}: loan, discount, age, GPA and more calculators in one app.\nhttps://play.google.com/store/apps/details?id=${androidPackage}`,
    });

  const sendFeedback = () =>
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} feedback (v${version})`)}`,
    );

  const confirmReset = () =>
    Alert.alert(
      "Reset all data?",
      "This clears your favorites, recent calculators and saved inputs. Your theme and currency stay the same.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            resetAll();
          },
        },
      ],
    );

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
        }}
      >
        <ScreenHeader title="Settings" />

        <SectionLabel text="Appearance" />
        <Card>
          <Text className="mb-2 font-medium text-slate-800 dark:text-slate-200">
            Theme
          </Text>
          <Segmented
            full
            value={theme}
            onChange={(v) => setTheme(v as ThemeSetting)}
            options={[
              { label: "System", value: "system" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
          />
        </Card>

        <SectionLabel text="Calculations" />
        <Card>
          <View className="flex-row items-center">
            <IconBox>
              <Coins size={18} color="#14B8A6" />
            </IconBox>
            <View className="ml-3 flex-1">
              <Text className="font-medium text-slate-800 dark:text-slate-200">
                Currency
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Used in all money calculators
              </Text>
            </View>
            <SheetSelect
              title="Currency"
              options={CURRENCIES}
              value={currency}
              onChange={setCurrency}
              className="min-w-[96px]"
            />
          </View>
        </Card>

        <SectionLabel text="Support" />
        <Card className="py-1">
          <LinkRow
            icon={<Star size={18} color="#F59E0B" />}
            label="Rate the app"
            onPress={rateApp}
          />
          <LinkRow
            icon={<Share2 size={18} color="#10B98A" />}
            label="Share with friends"
            onPress={shareApp}
          />
          <LinkRow
            icon={<Mail size={18} color="#8B5CF6" />}
            label="Send feedback"
            onPress={sendFeedback}
          />
          {privacyOptionsRequired && (
            <LinkRow
              icon={<SlidersHorizontal size={18} color="#64748B" />}
              label="Ad privacy choices"
              onPress={showPrivacyOptions}
            />
          )}

          <LinkRow
            icon={<ShieldCheck size={18} color="#64748B" />}
            label="Privacy policy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
            last
          />
        </Card>

        <SectionLabel text="Data" />
        <Card className="py-1">
          <LinkRow
            icon={<Trash2 size={18} color="#EF4444" />}
            label="Reset all data"
            onPress={confirmReset}
            danger
            last
          />
        </Card>

        <Text className="mt-8 text-center text-xs text-slate-400">
          {APP_NAME} · Version {version}
        </Text>
        <Text className="mt-1 text-center text-xs text-slate-400">
          Works offline · No account needed
        </Text>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="mb-2 ml-1 mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {text}
    </Text>
  );
}

function IconBox({ children }: { children: ReactNode }) {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5">
      {children}
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
  danger,
  last,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center py-3 active:opacity-70 ${
        last ? "" : "border-b border-slate-100 dark:border-white/5"
      }`}
    >
      <IconBox>{icon}</IconBox>
      <Text
        className={`ml-3 flex-1 font-medium ${
          danger ? "text-red-500" : "text-slate-800 dark:text-slate-200"
        }`}
      >
        {label}
      </Text>
      <ChevronRight size={18} color="#94A3B8" />
    </Pressable>
  );
}
