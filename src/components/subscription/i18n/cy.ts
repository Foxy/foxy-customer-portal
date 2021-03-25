import { getRanges, parseDate, toLocaleList } from "../utils";

import { Messages } from "../types";

type LabelList = {
  1: String;
  2: String;
  n: String;
};

const weekdays = {
  1: "Llun",
  2: "Mawrth",
  3: "Mercher",
  4: "Iau",
  5: "Gwener",
  6: "Sadwrn",
  7: "Sul"
};

export const messages: Messages = {
  ok: "OK",
  close: "Cau",
  cancel: "Canslo",
  amex: "Logo American Express.",
  diners: "Logo Diners Club.",
  discover: "Logo Discover.",
  jcb: "Logo JCB.",
  maestro: "Logo Maestro.",
  mastercard: "Logo MasterCard.",
  unionpay: "Logo UnionPay",
  visa: "Logo Visa.",
  unknown: "Delwedd card generig.",
  ccNumber: "Y 4 digid olaf o'ch rhif cardyn:",
  ccUpdateFailed: "Diweddaru cardyn",
  ccRegion: "Modd o dalu",
  ccEdit: "Addasu manylion cardyn.",
  receipt: "Derbyneb",
  failed: "Methodd",
  active: "Cyfredol",
  cancelled: "Canslwyd",
  transactions: "Trafodion yn ymwneud â'r tanysgrifiad hwn",
  productLinkTitle:
    "Dilynwch y ddolen hon i ddysgu mwy am yr eitem yma (yn agor mewn tab newydd).",
  productImageAlt: "Llun o'r eitem.",
  status: "Statws",
  amount: "Swm",
  timestamp: "Dyddiad",
  id: "ID",
  links: "Dolenni",
  error: "Gwall taliad",
  loadMore: "Llwytho mwy",
  selectNextDate: "Dewisiwch y dyddiad nesaf",
  selectFrequency: "Dewisiwch amlder",
  cancelSubscription: "Canslo tanysgrifiad",
  updateNotification: "Diweddarwyd y danysgrifiad.",
  errorNotification:
    "Mae gwall anhysbys wedi digwydd. Rhowch gynnig arall arni yn nes ymlaen neu cysylltwch â ni am help..",
  editItems: "Golygu",

  date: date => {
    return new Date(date).toLocaleDateString("cy", {
      month: "long",
      day: "numeric"
    });
  },

  year: date => {
    return new Date(date).toLocaleDateString("cy", {
      year: "numeric"
    });
  },

  price: (value, currency) => {
    return value.toLocaleString("cy", {
      style: "currency",
      currency
    });
  },

  items: length => `${length} eitem`,

  summary: items => {
    const { name } = [...items].sort((a, b) => a.price - b.price).pop();
    return `${name}${items.length > 1 ? ` + ${items.length - 1} yn fwy` : ""}`;
  },

  productDescription: (total, currency, quantity) => {
    const formattedTotal = messages.price(total, currency);
    return `${formattedTotal} (${quantity} eitem)`;
  },

  statusDescription: item => {
    if (Boolean(item.first_failed_transaction_date)) {
      const dateI18N = messages.date(item.first_failed_transaction_date);
      return `Methodd y tanysgrifiad ar ${dateI18N}`;
    }

    if (Boolean(item.end_date)) {
      const date = new Date(item.end_date);
      const ended = date.getTime() <= Date.now();
      const dateI18N = messages.date(date);
      return `Da${ended ? "eth y" : "aw'r"} tanysgrifiad i ben ar ${dateI18N}`;
    }

    return `Taliad nesaf ar ${messages.date(item.next_transaction_date)}`;
  },

  frequencyDescription: frequency => {
    if (frequency === ".5m") return `ddwywaith y mis`;

    const count = parseInt(frequency.substr(0, frequency.length - 1));
    const period = frequency[frequency.length - 1];

    if (!["y", "m", "w", "d"].includes(period)) return frequency;

    const frequencyFactory = (labels: LabelList) => (n: number) => {
      if (n === 1) {
        return labels[1];
      } else if (n === 2) {
        return `${n} ${labels[2]}`;
      } else {
        return `${n} ${labels.n}`;
      }
    };

    return {
      y: frequencyFactory({ 1: "flwyddyn", 2: "flynedd", n: "mlynedd" }),
      m: frequencyFactory({ 1: "mis", 2: "fis", n: "mis" }),
      w: frequencyFactory({ 1: "wythnos", 2: "wythnos", n: "wythnos" }),
      d: frequencyFactory({ 1: "diwrnod", 2: "ddiwrnod", n: "diwrnod" })
    }[period](count);
  },

  nextDateDescription: rules => {
    const result: string[] = [];

    if (Boolean(rules.allowed_days_of_week)) {
      const ranges = getRanges(rules.allowed_days_of_week);
      const list = ranges.map(r => r.map(d => weekdays[d]).join("—"));

      // Example: "Diwrnodau ar gael: Llun—Mercher a Gwener."
      result.push(`Diwrnodau ar gael: ${toLocaleList(list, "a")}.`);
    }

    if (Boolean(rules.allowed_days_of_month)) {
      const ranges = getRanges(rules.allowed_days_of_month);
      const dates = ranges.map(r => r.join(" – "));
      const tDates = toLocaleList(dates, "a");

      // Example: "Dyddiadau'r mis sydd ar gael: 1, 3—14 a 28."
      result.push(`Dyddiadau'r mis sydd ar gael: ${tDates}.`);
    }

    if (Boolean(rules.disallowed_dates)) {
      const list = rules.disallowed_dates.map(v => {
        const range = v.split("..");
        return range.map(v => messages.date(parseDate(v))).join("—");
      });

      // Example: "Ddim yn selectable Mehefin 3, Mehefin 13, a Awst 6—Medi 1."
      result.push(`Ddim yn selectable ${toLocaleList(list, "a")}.`);
    }

    return result.join(" ");
  },

  nextDateConfirm: date =>
    `Newid eich dyddiad bilio nesaf i ${messages.date(date)}?`,

  frequencyConfirm: value =>
    `Newid amlder i ${messages.frequencyDescription(value)}?`
};
