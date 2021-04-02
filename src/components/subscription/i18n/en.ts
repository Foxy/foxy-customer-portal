import { getRanges, parseDate, toLocaleList } from "../utils";

import { Messages } from "../types";
import ordinal from "ordinal";

const pluralWeekdays = {
  1: "Mondays",
  2: "Tuesdays",
  3: "Wednesdays",
  4: "Thursdays",
  5: "Fridays",
  6: "Saturdays",
  7: "Sundays"
};

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

  nextDateDescription: rules => {
    const result: string[] = [];

    if (Boolean(rules.allowed_days_of_week)) {
      const ranges = getRanges(rules.allowed_days_of_week);
      const list = ranges.map(g => g.map(d => pluralWeekdays[d]).join("—"));

      // Example: "You may choose Mondays—Wednesdays and Fridays."
      result.push(`You may choose ${toLocaleList(list)}.`);
    }

    if (Boolean(rules.allowed_days_of_month)) {
      const ranges = getRanges(rules.allowed_days_of_month);
      const dates = ranges.map(group => group.map(ordinal).join("—"));
      const tDates = toLocaleList(dates);
      const tDay = dates.length === 1 ? "day" : "days";

      // Example: "Only the 1st, 3rd—14th and 28th days of the month are allowed."
      result.push(`Only the ${tDates} ${tDay} of the month are allowed.`);
    }

    if (Boolean(rules.disallowed_dates)) {
      const list = rules.disallowed_dates.map(v => {
        const range = v.split("..");
        return range.map(v => messages.date(parseDate(v))).join("—");
      });

      // Example: "You can pick any date except June 3, June 13 and August 6—September 1."
      result.push(`You can pick any date except ${toLocaleList(list, "and")}.`);
    }

    return result.join(" ");
  },

  nextDateConfirm: date =>
    `Change your next billing date to ${messages.date(date)}?`,

  frequencyConfirm: value =>
    `Change frequency to ${messages.frequencyDescription(value)}?`
};
