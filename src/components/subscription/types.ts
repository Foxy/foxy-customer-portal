import { Subscription } from "../../assets/types/Subscription";
import { Item } from "../../assets/types/Item";

type NonBool<T> = T extends boolean ? never : T;
type NextDateConfig = Subscription["_embedded"]["template_config"]["allow_next_date_modification"];
type NextDateRules = Pick<
  NonBool<NextDateConfig>,
  "allowedDays" | "disallowedDates"
>;

export interface Messages {
  /** Generic action approval button text. */
  ok: string;

  /** Generic close view action button text. */
  close: string;

  /** Generic cancellation action button text. */
  cancel: string;

  /** American Express logo image alt text. */
  amex: string;

  /** Diners Club logo image alt text. */
  diners: string;

  /** Discover logo image alt text. */
  discover: string;

  /** JCB logo image alt text. */
  jcb: string;

  /** Maestro logo image alt text. */
  maestro: string;

  /** MasterCard logo image alt text. */
  mastercard: string;

  /** UnionPay logo image alt text. */
  unionpay: string;

  /** Visa logo image alt text. */
  visa: string;

  /** Unknown credit card type image alt text. */
  unknown: string;

  /** Label of the element group containing masked credit card number. */
  ccNumber: string;

  /** Caption of the CTA button in the subscription failure message. */
  ccUpdateFailed: string;

  /** Edit payment method details link label. */
  ccEdit: string;

  /** Credit card element group label. */
  ccRegion: string;

  /** Transaction receipt link text. */
  receipt: string;

  /** Short failed status description. */
  failed: string;

  /** Short active status description. */
  active: string;

  /** Short cancelled status description. */
  cancelled: string;

  /** Transaction table caption. */
  transactions: string;

  /** Cart item link title. */
  productLinkTitle: string;

  /** Alt text of the cart item image. */
  productImageAlt: string;

  /** Status column header of the transaction table. */
  status: string;

  /** Total amount column header of the transaction table. */
  amount: string;

  /** Transaction timestamp header of the transaction table. */
  timestamp: string;

  /** Transaction ID header of the transaction table. */
  id: string;

  /** Links column header of the transaction table. */
  links: string;

  /** Payment error column header of the transaction table. */
  error: string;

  /** Caption of the button that loads more transactions to the view. */
  loadMore: string;

  /** Next payment date selector label. */
  selectNextDate: string;

  /** Frequency selector label. */
  selectFrequency: string;

  /** Text of the link to the subscription cancellation page. */
  cancelSubscription: string;

  /** Sub modify link text (if present). */
  editItems: string;

  /** Any localized date in the component. */
  date: (date: Date | string) => string;

  /** Any localized year in the component. */
  year: (date: Date | string) => string;

  /** Any localized price in the component. */
  price: (value: number, currency: string) => string;

  /** Items section header including the number of items in a subscription. */
  items: (length: number) => string;

  /** The top text summarizing the subscription. */
  summary: (items: Item[]) => string;

  /** Short summary of a cart item including total price and quantity. */
  productDescription: (
    total: number,
    currency: string,
    quantity: number
  ) => string;

  /** Detailed subscription status describing when it ends and whether a failure has been registered or not. */
  statusDescription: (item: Subscription) => string;

  /** Subscription frequency description expanded from values like 1w, 2m, 14d etc. */
  frequencyDescription: (frequency: string) => string;

  /** When next date modification is restricted to the specific days of week or dates, this will generate a human-readable description of date constraints. */
  nextDateDescription: (rules: NextDateRules) => string;

  /** Vaadin date picker translations. */
  pickerI18n?: VaadinDatePickerI18n;

  /** New next transaction date confirmation dialog text. */
  nextDateConfirm: (date: string | Date) => string;

  /** Frequency change confirmation dialog text. */
  frequencyConfirm: (value: string) => string;

  /** Notification shown this subscription is updated successfully. */
  updateNotification: string;

  /** Notification shown when an unknown error occurs during an update request. */
  errorNotification: string;
}
