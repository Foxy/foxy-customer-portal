import { Messages } from "../types";

export const messages: Messages = {
  title: type =>
    type === "default_shipping_address" ? "Dosbarthu" : "Anfonebu",
  label: key =>
    ({
      first_name: "Enw cyntaf",
      last_name: "Cyfenw",
      company: "Cwmni",
      phone: "Ffôn",
      address1: "Cyfeiriad 1",
      address2: "Cyfeiriad 2",
      city: "Tref/ Dinas",
      region: "Sir",
      postal_code: "Cod Post",
      country: "Gwlad"
    }[key]),
  save: () => "Arbed",
  close: "Cau",
  error:
    "Mae gwall anhysbys wedi digwydd. Rhowch gynnig arall arni yn nes ymlaen neu cysylltwch â ni am help.",
  address: "Cyfeiriad",
  phone: "Ffôn",
  getAddress: address =>
    `${address.address1} ${address.city} ${address.region} ${address.postal_code}`,
  getFullName: name => `${name.first_name} ${name.last_name}`
};
