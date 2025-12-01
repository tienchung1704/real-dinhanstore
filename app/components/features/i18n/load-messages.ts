// Static imports for better performance and reliability
import enUS from './messages/en-US/pages.json';
import esES from './messages/es-ES/pages.json';
import deDE from './messages/de-DE/pages.json';
import frFR from './messages/fr-FR/pages.json';
import ruRU from './messages/ru-RU/pages.json';
import viVN from './messages/vi-VN/pages.json';

const messagesMap = {
  'en-US': enUS,
  'es-ES': esES,
  'de-DE': deDE,
  'fr-FR': frFR,
  'ru-RU': ruRU,
  'vi-VN': viVN,
};

export function loadMessages(locale: string) {
  return messagesMap[locale as keyof typeof messagesMap] || messagesMap['en-US'] || {};
}