import { MessagesProvider } from "../../../mixins/i18n";
import { messages as bundledMessages } from "./en";

export const i18nProvider: MessagesProvider<typeof bundledMessages> = {
  en: bundledMessages,
  ru: () => import("./ru").then(v => v.messages),
  fr: () => import("./fr").then(v => v.messages)
};
