/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * One of the payment methods for a customer. Note that `cc_number` is not updatable via the customer portal.
 */
export type PaymentMethod = {
  /**
   * Full creation date (ISO format).
   */
  date_created: string;
  /**
   * Full modification date (ISO format).
   */
  date_modified: string;
} & {
  /**
   * If the customer selected to save their payment information, this will be true. To clear out the payment information, set this to false.
   */
  save_cc: boolean;
  /**
   * The credit card or debit card type. This will be determined automatically once the payment card is saved.
   */
  cc_type: string | null;
  /**
   * A masked version of this payment card showing only the last 4 digits.
   */
  cc_number_masked: string | null;
  /**
   * The payment card expiration month in the MM format.
   */
  cc_exp_month: string | null;
  /**
   * The payment card expiration year in the YYYY format.
   */
  cc_exp_year: string | null;
};
