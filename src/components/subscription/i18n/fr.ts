import { getRanges, parseDate, toLocaleList } from "../utils";

import { Messages } from "../types";

const ordinal = (v: number) => `${v}${v === 1 ? "er" : "e"}`;

const weekdays = {
  1: "lundi",
  2: "mardi",
  3: "mercredi",
  4: "jeudi",
  5: "vendredi",
  6: "samedi",
  7: "dimanche"
};

export const messages: Messages = {
  ok: "OK",
  close: "Fermer",
  cancel: "Annuler",
  amex: "American Express logo.",
  diners: "Diners Club logo.",
  discover: "Discover logo.",
  jcb: "JCB logo.",
  maestro: "Maestro logo.",
  mastercard: "MasterCard logo.",
  unionpay: "UnionPay logo.",
  visa: "Visa logo.",
  unknown: "Cart générique image.",
  ccNumber: "4 derniers chiffres du numéro de carte:",
  ccUpdateFailed: "Mise à jour carte",
  ccRegion: "Méthode de paiement",
  ccEdit: "Modifier informations de carte.",
  receipt: "Reçu",
  failed: "Échoué",
  active: "Active",
  cancelled: "Annulé",
  transactions: "Transactions liées à cet abonnement",
  productLinkTitle:
    "Suivre ce lien pour en savoir plus à propos de ce produit (nouvel onglet).",
  productImageAlt: "Image du produit.",
  status: "Statut",
  amount: "Total",
  timestamp: "Date",
  id: "ID",
  links: "Liens",
  error: "Erreur du paiement",
  loadMore: "Charger plus",
  selectNextDate: "Sélectionner date suivante",
  selectFrequency: "Sélectionner fréquence",
  cancelSubscription: "Annuler abonnement",
  updateNotification: "Abonnement mis à jour.",
  errorNotification:
    "Une erreur inconnue s'est produite. Veuillez réessayer plus tard ou contactez-nous pour obtenir de l'aide",
  editItems: "Modifier",

  date: date => {
    return new Date(date).toLocaleDateString("fr", {
      month: "long",
      day: "numeric"
    });
  },

  year: date => {
    return new Date(date).toLocaleDateString("fr", {
      year: "numeric"
    });
  },

  price: (value, currency) => {
    return value.toLocaleString("fr", {
      style: "currency",
      currency
    });
  },

  items: length => `${length} ${length === 1 ? "article" : "articles"}`,

  summary: items => {
    const { name } = [...items].sort((a, b) => a.price - b.price).pop();
    return `${name}${items.length > 1 ? ` + ${items.length - 1} plus` : ""}`;
  },

  productDescription: (total, currency, quantity) => {
    const formattedTotal = messages.price(total, currency);
    return `${formattedTotal} (${quantity} article${quantity > 1 ? "s" : ""})`;
  },

  statusDescription: item => {
    if (Boolean(item.first_failed_transaction_date)) {
      return `A échoué le ${messages.date(item.first_failed_transaction_date)}`;
    }

    if (Boolean(item.end_date)) {
      const date = new Date(item.end_date);
      const ended = date.getTime() <= Date.now();
      return `${ended ? "Terminé" : "Se termine"} le ${messages.date(date)}`;
    }

    return `Prochain paiement le ${messages.date(item.next_transaction_date)}`;
  },

  frequencyDescription: frequency => {
    if (frequency === ".5m") return `2 fois par mois`;

    const count = parseInt(frequency.substr(0, frequency.length - 1));
    const period = frequency[frequency.length - 1];

    if (!["y", "m", "w", "d"].includes(period)) return frequency;

    return {
      y: (n: number) => (n > 1 ? `${n} années` : "année"),
      m: (n: number) => (n > 1 ? `${n} mois` : "mois"),
      w: (n: number) => (n > 1 ? `${n} semaines` : "1 semaine"),
      d: (n: number) => (n > 1 ? `${n} jours` : "jour")
    }[period](count);
  },

  nextDateDescription: rules => {
    const result: string[] = [];

    if (Boolean(rules.allowed_days_of_week)) {
      const ranges = getRanges(rules.allowed_days_of_week);
      const list = ranges.map(r => r.map(d => weekdays[d]).join("—"));

      // Example: "Vous pouvez choisir lundis—mercredis et vendredis."
      result.push(`Vous pouvez choisir ${toLocaleList(list)}.`);
    }

    if (Boolean(rules.allowed_days_of_month)) {
      const ranges = getRanges(rules.allowed_days_of_month);
      const dates = ranges.map(r => r.map(ordinal).join("—"));
      const tDates = toLocaleList(dates);
      const tDay = dates.length === 1 ? "jour" : "jours";

      // Example: "Seuls les 1er, 3e - 14e et 28e jours du mois sont autorisés."
      result.push(`Seuls les ${tDates} ${tDay} du mois sont autorisés.`);
    }

    if (Boolean(rules.disallowed_dates)) {
      const list = rules.disallowed_dates.map(v => {
        const range = v.split("..");
        return range.map(v => messages.date(parseDate(v))).join("—");
      });

      // Example: "Toute date sauf le 3 juin, le 13 juin et le 6 août—le 1er septembre."
      result.push(`Toute date sauf ${toLocaleList(list, "et")}.`);
    }

    return result.join(" ");
  },

  nextDateConfirm: date =>
    `Changer votre prochaine date de facturation pour le ${messages.date(
      date
    )}?`,

  frequencyConfirm: value =>
    `Changer votre fréquence de paiement de ${messages.frequencyDescription(
      value
    )}?`
};
