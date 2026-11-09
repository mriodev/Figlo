import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeSetting = "system" | "light" | "dark";

type AppState = {
  favorites: string[];
  recent: string[];
  inputs: Record<string, Record<string, string>>;
  theme: ThemeSetting;
  currency: string; // "" = automatic
  toggleFavorite: (id: string) => void;
  addRecent: (id: string) => void;
  setInput: (calcId: string, field: string, value: string) => void;
  setTheme: (t: ThemeSetting) => void;
  setCurrency: (c: string) => void;
  resetAll: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      recent: [],
      inputs: {},
      theme: "system",
      currency: "",
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      addRecent: (id) =>
        set((s) => ({
          recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 5),
        })),
      setInput: (calcId, field, value) =>
        set((s) => ({
          inputs: {
            ...s.inputs,
            [calcId]: { ...s.inputs[calcId], [field]: value },
          },
        })),
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      resetAll: () => set({ favorites: [], recent: [], inputs: {} }),
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
