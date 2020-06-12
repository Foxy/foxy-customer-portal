/* eslint-disable prettier/prettier */

import { Messages } from "../types";

export const messages: Messages = {
  ok: "OK",
  cancel: "Cancel",
  title: "Profile",
  email: "Email",
  password: "Password",
  oldPassword: "Current or temporary password",
  newPassword: "New password",
  ccTitle: "Saved Payment Method",
  ccNumber: "Last 4 digits of the card number:",
  ccLogoAlt: card => `${card.cc_type} logo`,
  ccDescription: card => card.save_cc ? `${card.cc_type} ending at ${card.cc_number_masked.substr(card.cc_number_masked.length - 4)}` : "No saved cards",
  removeCC: "Remove",
  removeCCWarning: "Warning: if you have any active subscriptions using this card, they will fail at the beginning of the next billing period.",
  changePasswordTitle: "Change password",
  changePasswordHint: "Leave empty to keep the current password.",
  close: "Close",
  error: "An unknown error has occurred. Please try again later or contact us for help."
};
