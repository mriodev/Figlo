import * as Haptics from "expo-haptics";
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Option = { value: string; label: string; hint?: string };

type Props = {
  title: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function SheetSelect({
  title,
  options,
  value,
  onChange,
  placeholder = "Select",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${current?.label ?? "not set"}. Tap to change`}
        className={`flex-row items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5 active:opacity-70 dark:bg-white/5 ${className}`}
      >
        <Text
          className={
            current
              ? "font-semibold text-slate-900 dark:text-white"
              : "text-slate-400"
          }
        >
          {current?.label ?? placeholder}
        </Text>
        <ChevronDown size={14} color="#94A3B8" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setOpen(false)}
        />
        <View
          className="max-h-[70%] rounded-t-3xl bg-card-light pt-3 dark:bg-card-dark"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-slate-300 dark:bg-white/20" />
          <Text className="mb-2 px-5 text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          <ScrollView>
            {options.map((o) => {
              const active = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex-row items-center px-5 py-3.5 active:bg-slate-100 dark:active:bg-white/5 ${
                    active ? "bg-brand-50 dark:bg-white/5" : ""
                  }`}
                >
                  <Text className="flex-1 text-base font-medium text-slate-800 dark:text-slate-200">
                    {o.label}
                  </Text>
                  {o.hint ? (
                    <Text className="mr-3 text-sm text-slate-400">
                      {o.hint}
                    </Text>
                  ) : null}
                  {active && <Check size={18} color="#10B98A" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
