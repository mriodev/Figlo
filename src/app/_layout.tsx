import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { AdsProvider } from "../ads/AdsProvider";
import { THEME } from "../constants/app";
import "../global.css";
import { useAppStore } from "../store/useAppStore";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const themeSetting = useAppStore((s) => s.theme);

  useEffect(() => {
    setColorScheme(themeSetting);
  }, [themeSetting]);

  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <>
      return (
      <AdsProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bg },
            animation: "slide_from_right",
          }}
        />
      </AdsProvider>
      );
    </>
  );
}
