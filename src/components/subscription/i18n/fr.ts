import { Messages } from "../types";

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

  nextDateConfirm: date =>
    `Changer votre prochaine date de facturation pour le ${messages.date(
      date
    )}?`,

  frequencyConfirm: value =>
    `Changer votre fréquence de paiement de ${messages.frequencyDescription(
      value
    )}?`
};
