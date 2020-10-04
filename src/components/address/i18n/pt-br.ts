import { Messages } from "../types";

export const messages: Messages = {
  title: type => (type === "default_shipping_address" ? "Envio" : "Fatura"),
  label: key =>
    ({
      first_name: "Primeiro nome",
      last_name: "Último nome",
      company: "Companhia",
      phone: "Telefone",
      address1: "Endereço linha 1",
      address2: "Endereço linha 2",
      city: "Cidade",
      region: "Região",
      postal_code: "CEP",
      country: "País"
    }[key]),
  save: "Salvar",
  close: "Fechar",
  error:
    "Ocorreu um erro desconhecido. Por favor, tente novamente mais tarde ou contacte-nos para obter ajuda.",
  address: "Endereço",
  phone: "Telefone",
  getAddress: address =>
    `${address.address1} ${address.city} ${address.region} ${address.postal_code}`,
  getFullName: name => `${name.first_name} ${name.last_name}`
};
