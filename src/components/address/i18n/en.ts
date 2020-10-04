import { Messages } from "../types";

export const messages: Messages = {
  title: type => (type === "default_shipping_address" ? "Shipping" : "Billing"),
  label: key =>
    ({
      first_name: "First Name",
      last_name: "Last Name",
      company: "Company",
      phone: "Phone",
      address1: "Address Line 1",
      address2: "Address Line 2",
      city: "City",
      region: "Region",
      postal_code: "Postal Code",
      country: "Country"
    }[key]),
  save: type =>
    `Save ${
      type === "default_shipping_address" ? "shipping" : "billing"
    } address`,
  close: "Close",
  error:
    "An unknown error has occurred. Please try again later or contact us for help.",
  address: "Address",
  phone: "Phone",
  getAddress: address =>
    `${address.address1} ${address.city} ${address.region} ${address.postal_code}`,
  getFullName: name => `${name.first_name} ${name.last_name}`
};
