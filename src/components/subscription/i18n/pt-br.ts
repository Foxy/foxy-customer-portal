import { Messages } from "../types";

export const messages: Messages = {
  ok: "OK",
  close: "Fechar",
  cancel: "Cancelar",
  amex: "Logo da American Express.",
  diners: "Logo da Diners Club.",
  discover: "Logo da Discover.",
  jcb: "Logo da JCB.",
  maestro: "Logo da Maestro.",
  mastercard: "Logo da MasterCard.",
  visa: "Logo da Visa.",
  unknown: "Imagem de um cartão genérico.",
  ccNumber: "Últimos 4 dígitos do número do cartão:",
  ccUpdateFailed: "Atualizar cartão",
  ccRegion: "Método de pagamento",
  ccEdit: "Editar detalhes do cartão.",
  receipt: "Recibo",
  failed: "Falhou",
  active: "Ativo",
  cancelled: "Cancelado",
  transactions: "Transações relacionadas a esta subscrição",
  productLinkTitle:
    "Siga este link para aprender mais sobre este produto (abre em uma nova aba).",
  productImageAlt: "Imagem deste produto.",
  status: "Situação",
  amount: "Quantidade",
  timestamp: "Data",
  id: "ID",
  links: "Links",
  error: "Erro no pagamento",
  loadMore: "Carregar mais",
  selectNextDate: "Selecionar próxima data",
  selectFrequency: "Selecionar frequência",
  cancelSubscription: "Cancelar subscrição",
  updateNotification: "Subscrição atualizada",
  errorNotification:
    "Ocorreu um erro desconhecido. Por favor, tente novamente mais tarde ou contate-nos para obter ajuda.",
  editItems: "Editar",

  date: date => {
    return new Date(date).toLocaleDateString("pt-br", {
      month: "long",
      day: "numeric"
    });
  },

  year: date => {
    return new Date(date).toLocaleDateString("pt-br", {
      year: "numeric"
    });
  },

  price: (value, currency) => {
    return value.toLocaleString("pt-br", {
      style: "currency",
      currency
    });
  },

  items: length => `${length} ${length === 1 ? "iteь" : "itens"}`,

  summary: items => {
    const { name } = [...items].sort((a, b) => a.price - b.price).pop();
    return `${name}${items.length > 1 ? ` + ${items.length - 1} more` : ""}`;
  },

  productDescription: (total, currency, quantity) => {
    const formattedTotal = messages.price(total, currency);
    return `${formattedTotal} (${quantity} ${quantity > 1 ? "itens" : "item"})`;
  },

  statusDescription: item => {
    if (Boolean(item.first_failed_transaction_date)) {
      return `Falha em ${messages.date(item.first_failed_transaction_date)}`;
    }

    if (Boolean(item.end_date)) {
      const date = new Date(item.end_date);
      const ended = date.getTime() <= Date.now();
      return `Encerra${ended ? "do" : ""} em ${messages.date(date)}`;
    }

    return `Próximo pagamento em ${messages.date(item.next_transaction_date)}`;
  },

  frequencyDescription: frequency => {
    if (frequency === ".5m") return `duas vezes por mês`;

    const count = parseInt(frequency.substr(0, frequency.length - 1));
    const period = frequency[frequency.length - 1];

    if (!["y", "m", "w", "d"].includes(period)) return frequency;

    return {
      y: (n: number) => (n > 1 ? `${n} anos` : "ano"),
      m: (n: number) => (n > 1 ? `${n} meses` : "mês"),
      w: (n: number) => (n > 1 ? `${n} semanas` : "semana"),
      d: (n: number) => (n > 1 ? `${n} dias` : "dia")
    }[period](count);
  },

  nextDateConfirm: date =>
    `Mudar sua próxima data de pagamento para ${messages.date(date)}?`,

  frequencyConfirm: value =>
    `Mudar a frequência para ${messages.frequencyDescription(value)}?`
};
