import * as Haptics from "expo-haptics";
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Unit } from "../utils/units";

type Props = {
  label: string;
  units: Unit[];
  value: string;
  onChange: (id: string) => void;
};

export function UnitSelect({ label, units, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = units.find((u) => u.id === value) ?? units[0];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current.name}. Tap to change`}
        className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 active:opacity-70 dark:bg-white/5"
      >
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </Text>
        <View className="mt-0.5 flex-row items-center">
          <Text
            numberOfLines={1}
            className="flex-1 text-base font-semibold text-slate-900 dark:text-white"
          >
            {current.name}
          </Text>
          <ChevronDown size={16} color="#94A3B8" />
        </View>
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
            {label}
          </Text>
          <ScrollView>
            {units.map((u) => {
              const active = u.id === current.id;
              return (
                <Pressable
                  key={u.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onChange(u.id);
                    setOpen(false);
                  }}
                  className={`flex-row items-center px-5 py-3.5 active:bg-slate-100 dark:active:bg-white/5 ${
                    active ? "bg-brand-50 dark:bg-white/5" : ""
                  }`}
                >
                  <Text className="flex-1 text-base text-slate-800 dark:text-slate-200">
                    {u.name}
                  </Text>
                  <Text className="mr-3 text-sm text-slate-400">
                    {u.symbol}
                  </Text>
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
