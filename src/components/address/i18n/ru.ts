import { Messages } from "../types";

export const messages: Messages = {
  title: type =>
    type === "default_shipping_address" ? "Адрес доставки" : "Платежный адрес",
  label: key =>
    ({
      first_name: "Имя",
      last_name: "Фамилия",
      company: "Организация",
      phone: "Телефон",
      address1: "Улица, дом, корпус",
      address2: "Квартира, подъезд",
      city: "Город",
      region: "Область",
      postal_code: "Индекс",
      country: "Страна"
    }[key]),
  save: type =>
    `Сохранить ${
      type === "default_shipping_address" ? "адрес доставки" : "платежный адрес"
    }`,
  close: "Закрыть",
  error:
    "Кажется, у нас что-то сломалось. Пожалуйста, попробуйте еще раз или напишите нам.",
  address: "Адрес",
  phone: "Телефон",
  getAddress: address => {
    let result = `${address.postal_code}, ${address.country}, `;
    if (address.region !== "") result += `${address.region}, `;
    return `${result} ${address.city}, ${address.address1} ${address.address2}.`;
  },
  getFullName: name => `${name.first_name} ${name.last_name}`
};
