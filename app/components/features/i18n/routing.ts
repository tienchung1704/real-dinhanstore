import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { locales, DEFAULT_LOCALE } from "./config";

export const routing = defineRouting({
  locales: Object.values(locales),

  defaultLocale: DEFAULT_LOCALE,

  localePrefix: "as-needed",

  pathnames: {
    "/": "/",
  },
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);