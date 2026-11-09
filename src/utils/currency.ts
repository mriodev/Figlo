import { getLocales } from "expo-localization";

const locale = getLocales()[0];

export const CURRENCY_SYMBOL: string =
  locale?.currencySymbol || locale?.currencyCode || "$";

export const REGION: string = locale?.regionCode ?? "";
