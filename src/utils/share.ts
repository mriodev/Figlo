import * as Haptics from "expo-haptics";
import { Share } from "react-native";
import { APP_NAME } from "../constants/app";

export async function shareResult(title: string, lines: string[]) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await Share.share({
    message: [title, ...lines, "", `Calculated with ${APP_NAME}`].join("\n"),
  });
}
