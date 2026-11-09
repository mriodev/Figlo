import { ChevronDown, Info } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export function InfoTip({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen(!open)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      className="mt-4 rounded-card border border-slate-200/70 bg-card-light p-4 dark:border-white/5 dark:bg-card-dark"
    >
      <View className="flex-row items-center">
        <Info size={18} color="#10B98A" />
        <Text className="ml-2 flex-1 font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <ChevronDown size={18} color="#94A3B8" />
        </View>
      </View>
      {open && (
        <Text className="mt-3 leading-6 text-slate-600 dark:text-slate-400">
          {children}
        </Text>
      )}
    </Pressable>
  );
}
