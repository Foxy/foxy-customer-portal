import { MessagesProvider } from "../../../mixins/i18n";
import { messages as defaultMessages } from "./en";

export const i18nProvider: MessagesProvider<typeof defaultMessages> = {
  en: defaultMessages,
  ru: () => import("./ru").then(v => v.messages),
  fr: () => import("./fr").then(v => v.messages),
  cy: () => import("./cy").then(v => v.messages)
};
