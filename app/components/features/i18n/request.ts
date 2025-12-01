import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale) {
    locale = DEFAULT_LOCALE;
  }

  // Use dynamic import to avoid Node.js modules in Edge Runtime
  const { loadMessages } = await import('./load-messages');

  return {
    locale,
    messages: loadMessages(locale),
  };
});