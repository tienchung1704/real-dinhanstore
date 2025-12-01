export const locales = {
  EN: "en",
  VI: "vi",
} as const;

export const DEFAULT_LOCALE = locales.EN;

export const localesList = [locales.EN, locales.VI] as const;

export const localeOptionsList = [
  { value: locales.EN, label: "English" },
  { value: locales.VI, label: "Tiếng Việt" },
] as const;
