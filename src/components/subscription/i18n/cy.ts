import { Messages } from "../types";

type LabelList = {
  1: String;
  2: String;
  n: String;
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
  visa: "Logo Visa.",
  unknown: "Delwedd card generig.",
  ccNumber: "Y 4 digid olaf o'ch rhif cardyn:",
  ccUpdateFailed: "Diweddaru cardyn",
  ccRegion: "Modd o dalu",
  ccEdit: "Addasu manylion cardyn.",
  items: "Eitemau a gynwyswyd",
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
      minimumFractionDigits: 0,
      currency
    });
  },

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

  nextDateConfirm: date =>
    `Newid eich dyddiad bilio nesaf i ${messages.date(date)}?`,

  frequencyConfirm: value =>
    `Newid amlder i ${messages.frequencyDescription(value)}?`
};
