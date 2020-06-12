/* eslint-disable prettier/prettier */

import { Messages } from "../types";

export const messages: Messages = {
  ok: "OK",
  cancel: "Отменить",
  title: "Профиль",
  email: "Email",
  password: "Пароль",
  oldPassword: "Текущий или временный пароль",
  newPassword: "Новый пароль",
  ccTitle: "Карта",
  ccNumber: "Последние 4 цифры номера карты:",
  ccLogoAlt: card => `Логотип ${card.cc_type}`,
  ccDescription: card => card.save_cc ? `${card.cc_type} (${card.cc_number_masked.substr(card.cc_number_masked.length - 4)})` : "Нет привязанных карт",
  removeCC: "Отвязать",
  removeCCWarning: "Внимание: любые активные подписки, использующие эту карту, будут приостановлены по окончании оплаченного периода.",
  changePasswordTitle: "Поменять пароль",
  changePasswordHint: "Если хотите сохранить прежний, оставьте эти поля пустыми.",
  close: "Закрыть",
  error: "Кажется, у нас что-то сломалось. Пожалуйста, попробуйте еще раз или напишите нам."
};
