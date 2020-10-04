import { Messages } from "../types";

export const messages: Messages = {
  title: type =>
    type === "default_shipping_address" ? "Livraison" : "Facturation",
  label: key =>
    ({
      first_name: "Prénom",
      last_name: "Nom de Famille",
      company: "Entreprise",
      phone: "Téléphone",
      address1: "Adresse Ligne 1",
      address2: "Adresse Ligne 2",
      city: "Ville",
      region: "Région",
      postal_code: "Code Postal",
      country: "Pays"
    }[key]),
  save: type =>
    `Sauvegarder l'adresse de ${
      type === "default_shipping_address" ? "livraison" : "facturation"
    }`,
  close: "Fermer",
  error:
    "Une erreur inconnue s'est produite. Veuillez réessayer plus tard ou contactez-nous pour obtenir de l'aide",
  address: "Adresse",
  phone: "Téléphone",
  getAddress: address =>
    `${address.address1} ${address.city} ${address.region} ${address.postal_code}`,
  getFullName: name => `${name.first_name} ${name.last_name}`
};
