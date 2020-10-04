import { Address } from "../../assets/types/Address";

export type AddressType =
  | "default_billing_address"
  | "default_shipping_address";

export interface Messages {
  /** Component heading text. */
  title: (type: AddressType) => string;

  /** Field label describing the appropriate API response property. */
  label: (field: keyof Address) => string;

  /** "Save" button caption. */
  save: (type: AddressType) => string;

  /** Error overlay action text. */
  close: string;

  /** Generic error message. */
  error: string;

  /** Phone section label. */
  phone: string;

  /** Address section label. */
  address: string;

  /** Formats full address according to the locale. */
  getAddress: (address: Address) => string;

  /** Formats name according to the locale. */
  getFullName: (name: Pick<Address, "first_name" | "last_name">) => string;
}
