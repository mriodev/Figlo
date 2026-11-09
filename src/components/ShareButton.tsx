import { Share2 } from "lucide-react-native";
import { Pressable } from "react-native";

export function ShareButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityLabel="Share result"
      className="h-10 w-10 items-center justify-center rounded-full bg-card-light active:opacity-70 dark:bg-card-dark"
    >
      <Share2 size={18} color="#10B98A" />
    </Pressable>
  );
}
