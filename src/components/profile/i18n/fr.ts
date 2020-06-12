/* eslint-disable prettier/prettier */

import { Messages } from "../types";

export const messages: Messages = {
  ok: "OK",
  cancel: "Annuler",
  title: "Compte",
  email: "Courriel",
  password: "Mot de passe",
  oldPassword: "Mot de passe actuel ou temporaire",
  newPassword: "Nouveau mot de passe",
  ccTitle: "Méthode de paiement enregistrée",
  ccNumber: "4 derniers chiffres du numéro de carte:",
  ccLogoAlt: card => `Logo ${card.cc_type}`,
  ccDescription: card => card.save_cc ? `${card.cc_type} se terminant à ${card.cc_number_masked.substr(card.cc_number_masked.length - 4)}` : "Aucune carte de crédit enregistrée",
  removeCC: "Retirer",
  removeCCWarning: "Attention: si vous avez des abonnements actifs utilisant cette carte, ils échoueront au début de la prochaine période de facturation.",
  changePasswordTitle: "Changer votre mot de passe",
  changePasswordHint: "Laissez vide pour garder votre mot de passe actuel.",
  close: "Fermer",
  error: "Une erreur inconnue s'est produite. Veuillez réessayer plus tard ou contactez-nous pour obtenir de l'aide"
};
