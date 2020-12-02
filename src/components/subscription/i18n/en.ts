import { Messages } from "../types";

export const messages: Messages = {
  ok: "OK",
  close: "Close",
  cancel: "Cancel",
  amex: "American Express logo.",
  diners: "Diners Club logo.",
  discover: "Discover logo.",
  jcb: "JCB logo.",
  maestro: "Maestro logo.",
  mastercard: "MasterCard logo.",
  unionpay: "UnionPay logo.",
  visa: "Visa logo.",
  unknown: "Generic card image.",
  ccNumber: "Last 4 digits of the card number:",
  ccUpdateFailed: "Update card",
  ccRegion: "Payment method",
  ccEdit: "Edit card details.",
  receipt: "Receipt",
  failed: "Failed",
  active: "Active",
  cancelled: "Cancelled",
  transactions: "Transactions related to this subscription",
  productLinkTitle:
    "Follow this link to learn more about this product (opens in new tab).",
  productImageAlt: "Picture of this product.",
  status: "Status",
  amount: "Amount",
  timestamp: "Date",
  id: "ID",
  links: "Links",
  error: "Payment error",
  loadMore: "Load more",
  selectNextDate: "Select next date",
  selectFrequency: "Select frequency",
  cancelSubscription: "Cancel subscription",
  updateNotification: "Subscription updated.",
  errorNotification:
    "An unknown error has occurred. Please try again later or contact us for help.",
  editItems: "Edit",

  date: date => {
    return new Date(date).toLocaleDateString("en", {
      month: "long",
      day: "numeric"
    });
  },

  year: date => {
    return new Date(date).toLocaleDateString("en", {
      year: "numeric"
    });
  },

  price: (value, currency) => {
    return value.toLocaleString("en", {
      style: "currency",
      currency
    });
  },

  items: length => `${length} ${length === 1 ? "item" : "items"}`,

  summary: items => {
    const { name } = [...items].sort((a, b) => a.price - b.price).pop();
    return `${name}${items.length > 1 ? ` + ${items.length - 1} more` : ""}`;
  },

  productDescription: (total, currency, quantity) => {
    const formattedTotal = messages.price(total, currency);
    return `${formattedTotal} (${quantity} item${quantity > 1 ? "s" : ""})`;
  },

  statusDescription: item => {
    if (Boolean(item.first_failed_transaction_date)) {
      return `Failed on ${messages.date(item.first_failed_transaction_date)}`;
    }

    if (Boolean(item.end_date)) {
      const date = new Date(item.end_date);
      const ended = date.getTime() <= Date.now();
      return `End${ended ? "ed" : "s"} on ${messages.date(date)}`;
    }

    return `Next payment on ${messages.date(item.next_transaction_date)}`;
  },

  frequencyDescription: frequency => {
    if (frequency === ".5m") return `twice a month`;

    const count = parseInt(frequency.substr(0, frequency.length - 1));
    const period = frequency[frequency.length - 1];

    if (!["y", "m", "w", "d"].includes(period)) return frequency;

    return {
      y: (n: number) => (n > 1 ? `${n} years` : "year"),
      m: (n: number) => (n > 1 ? `${n} months` : "month"),
      w: (n: number) => (n > 1 ? `${n} weeks` : "week"),
      d: (n: number) => (n > 1 ? `${n} days` : "day")
    }[period](count);
  },

  nextDateConfirm: date =>
    `Change your next billing date to ${messages.date(date)}?`,

  frequencyConfirm: value =>
    `Change frequency to ${messages.frequencyDescription(value)}?`
};
