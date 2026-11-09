import { View, type ViewProps } from "react-native";

export function Card({
  className = "",
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-card border border-slate-200/70 bg-card-light p-4 dark:border-white/5 dark:bg-card-dark ${className}`}
      {...props}
    />
  );
}
