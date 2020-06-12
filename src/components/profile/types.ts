import { PaymentMethod } from "../../assets/types/PaymentMethod";

export interface Messages {
  /** Component title text. */
  title: string;

  /** Email label text. */
  email: string;

  /** Error overlay action text. */
  close: string;

  /** Generic error message. */
  error: string;

  /** Password label text. */
  password: string;

  /** Old or temporary password field label. */
  oldPassword: string;

  /** New password field label. */
  newPassword: string;

  /** Generic action approval button text. */
  ok: string;

  /** Generic cancellation action button text. */
  cancel: string;

  /** Title of the section allowing users to manage their saved card info. */
  ccTitle: string;

  /** Label of the element group containing masked credit card number. */
  ccNumber: string;

  ccLogoAlt: (card: PaymentMethod) => string;

  /** Text description of the payment method, e.g. "Visa ending at 4242" */
  ccDescription: (card: PaymentMethod) => string;

  /** Remove credit card info button caption. */
  removeCC: string;

  /** A warning about the implications of removing the saved card details. */
  removeCCWarning: string;

  /** Title of the section allowing users to change their password. */
  changePasswordTitle: string;

  /** Quick hint on how to change the password placed under the title. */
  changePasswordHint: string;
}
