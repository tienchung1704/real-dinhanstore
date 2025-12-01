import React from "react";

import { NextIntlClientProvider } from "next-intl";

const timeZone = "Asia/Saigon";

export function LocaleProvider(
  props: React.ComponentProps<typeof NextIntlClientProvider>
) {
  return (
    <NextIntlClientProvider
      timeZone={timeZone}
      getMessageFallback={(info) => {
        console.log('Missing translation key:', info.key);
        return info.key;
      }}
      {...props}
    />
  );
}