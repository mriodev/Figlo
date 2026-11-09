import { View } from "react-native";
import type { Calculator } from "../constants/calculators";
import { CalcCard } from "./CalcCard";

type Props = {
  items: Calculator[];
  onOpen: (id: string) => void;
};

export function CalcGrid({ items, onOpen }: Props) {
  const rows: Calculator[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View className="-mx-1.5">
      {rows.map((row, index) => (
        <View key={index} className="flex-row">
          {row.map((calc) => (
            <CalcCard
              key={calc.id}
              calc={calc}
              onPress={() => onOpen(calc.id)}
            />
          ))}
          {row.length === 1 && <View className="m-1.5 flex-1" />}
        </View>
      ))}
    </View>
  );
}
