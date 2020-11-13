/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A subscription is a recurring transaction. If the subscription is integrated with a third party subscription system (such as PayPal Express), there may be limitiations on what can be modified such as the next_transaction_date and frequency.
 */
export type Subscription = {
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
   * Useful resource pointers.
   */
  _links: {
    /**
     * Link to this resource.
     */
    self: {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
    /**
     * Link to the first resource.
     */
    first?: {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
    /**
     * Link to the previous resource.
     */
    prev?: {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
    /**
     * Link to next resource.
     */
    next?: {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
    /**
     * Link to last resource.
     */
    last?: {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
  } & {
    /**
     * A named resource link of a particular type.
     */
    "fx:sub_token_url": {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
    /**
     * A named resource link of a particular type.
     */
    "fx:sub_modification_url"?: {
      /**
       * A few words describing where this link points.
       */
      title: string;
      /**
       * An absolute URL of the resource.
       */
      href: string;
      /**
       * Link type (optional, value depending on the context).
       */
      type?: string;
    };
  };
  /**
   * Embedded content.
   */
  _embedded: {
    /**
     * Various template settings to help inform the UI.
     */
    template_config: {
      /**
       * Indicates whether or not a subscription's next date can be modified by the customer. Note that this is included per transaction, though the setting at this point is store-wide.
       */
      allow_next_date_modification: boolean;
      /**
       * A list of allowed frequencies if frequency modification is enabled for this subscription or `false` otherwise. The list can be empty, in which case it should be treated as `false` value.
       */
      allow_frequency_modification: false | string[];
    };
    "fx:transactions": ({
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
       * Useful resource pointers.
       */
      _links: {
        /**
         * Link to this resource.
         */
        self: {
          /**
           * A few words describing where this link points.
           */
          title: string;
          /**
           * An absolute URL of the resource.
           */
          href: string;
          /**
           * Link type (optional, value depending on the context).
           */
          type?: string;
        };
        /**
         * Link to the first resource.
         */
        first?: {
          /**
           * A few words describing where this link points.
           */
          title: string;
          /**
           * An absolute URL of the resource.
           */
          href: string;
          /**
           * Link type (optional, value depending on the context).
           */
          type?: string;
        };
        /**
         * Link to the previous resource.
         */
        prev?: {
          /**
           * A few words describing where this link points.
           */
          title: string;
          /**
           * An absolute URL of the resource.
           */
          href: string;
          /**
           * Link type (optional, value depending on the context).
           */
          type?: string;
        };
        /**
         * Link to next resource.
         */
        next?: {
          /**
           * A few words describing where this link points.
           */
          title: string;
          /**
           * An absolute URL of the resource.
           */
          href: string;
          /**
           * Link type (optional, value depending on the context).
           */
          type?: string;
        };
        /**
         * Link to last resource.
         */
        last?: {
          /**
           * A few words describing where this link points.
           */
          title: string;
          /**
           * An absolute URL of the resource.
           */
          href: string;
          /**
           * Link type (optional, value depending on the context).
           */
          type?: string;
        };
      } & {
        /**
         * A named resource link of a particular type.
         */
        "fx:receipt": {
          /**
           * A few words describing where this link points.
           */
          title: string;
          /**
           * An absolute URL of the resource.
           */
          href: string;
          /**
           * Link type (optional, value depending on the context).
           */
          type?: string;
        };
      };
      _embedded: {
        "fx:attributes": ({
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
           * Attribute name.
           */
          name: string;
          /**
           * Attribute value.
           */
          value: string;
          /**
           * Public availability of this attribute.
           */
          visibility: "public" | "private";
        })[];
        "fx:items"?: {
          name: string;
          price: number;
          quantity: number;
          quantity_min: number;
          quantity_max: number;
          weight: number;
          code: string;
          parent_code: string;
          discount_name: string;
          discount_type: string;
          discount_details: string;
          subscription_frequency: string;
          subscription_start_date: string;
          subscription_next_transaction_date: string;
          subscription_end_date: null;
          is_future_line_item: boolean;
          shipto: string;
          url: string;
          image: string;
          length: number;
          width: number;
          height: number;
          expires: number;
          date_created: null;
          date_modified: string;
        }[];
      };
      /**
       * The order number.
       */
      id: number;
      /**
       * The order number for display.
       */
      display_id: number;
      /**
       * True if this transaction was a test transaction and not run against a live payment gateway.
       */
      is_test: boolean;
      /**
       * Set this to true to hide it in the FoxyCart admin.
       */
      hide_transaction: boolean;
      /**
       * If the webhook for this transaction has been successfully sent, this will be true. You can also modify this to meet your needs.
       */
      data_is_fed: boolean;
      /**
       * The date of this transaction shown in the timezone of the store. The format used is ISO 8601 (or 'c' format string for PHP developers).
       */
      transaction_date: string;
      /**
       * The locale code of this transaction. This will be a copy of the store's local_code at the time of the transaction.
       */
      locale_code: string;
      /**
       * The customer's given name at the time of the transaction.
       */
      customer_first_name: string;
      /**
       * The customer's surname at the time of the transaction.
       */
      customer_last_name: string;
      /**
       * If the customer provided a tax_id during checkout, it will be included here.
       */
      customer_tax_id: string;
      /**
       * The customer's email address at the time of the transaction.
       */
      customer_email: string;
      /**
       * The customer's ip address at the time of the transaction.
       */
      customer_ip: string;
      /**
       * The country of the customer's ip address.
       */
      ip_country: string;
      /**
       * User Agent string.
       */
      user_agent: string;
      /**
       * Total amount of the items in this transaction.
       */
      total_item_price: number;
      /**
       * Total amount of the taxes for this transaction.
       */
      total_tax: number;
      /**
       * Total amount of the shipping costs for this transaction.
       */
      total_shipping: number;
      /**
       * If this transaction has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items.
       */
      total_future_shipping: number;
      /**
       * Total amount of this transaction including all items, taxes, shipping costs and discounts.
       */
      total_order: number;
      /**
       * ISO 4217 currency code, uppercase.
       */
      currency_code: string;
      /**
       * A text symbol representing the currency this transaction was made in.
       */
      currency_symbol: string;
      /**
       * Used for transactions processed with a hosted payment gateway which can change the status of the transaction after it is originally posted. If the status is empty, a normal payment gateway was used and the transaction should be considered completed.
       */
      status:
        | ""
        | "captured"
        | "approved"
        | "authorized"
        | "declined"
        | "pending"
        | "rejected";
    })[];
    "fx:transaction_template": {
      _embedded: {
        "fx:items": {
          name: string;
          price: number;
          quantity: number;
          quantity_min: number;
          quantity_max: number;
          weight: number;
          code: string;
          parent_code: string;
          discount_name: string;
          discount_type: string;
          discount_details: string;
          subscription_frequency: string;
          subscription_start_date: string;
          subscription_next_transaction_date: string;
          subscription_end_date: null;
          is_future_line_item: boolean;
          shipto: string;
          url: string;
          image: string;
          length: number;
          width: number;
          height: number;
          expires: number;
          date_created: null;
          date_modified: string;
        }[];
      };
      language: string;
      locale_code: string;
      use_customer_shipping_address: boolean;
      billing_first_name: string;
      billing_last_name: string;
      billing_company: string;
      billing_address1: string;
      billing_address2: string;
      billing_city: string;
      billing_state: string;
      billing_postal_code: string;
      billing_country: string;
      billing_phone: string;
      customer_email: string;
      shipping_first_name: string;
      shipping_last_name: string;
      shipping_company: string;
      shipping_address1: string;
      shipping_address2: string;
      shipping_city: string;
      shipping_state: string;
      shipping_postal_code: string;
      shipping_country: string;
      shipping_phone: string;
      total_item_price: number;
      total_tax: number;
      total_shipping: number;
      total_future_shipping: number;
      total_order: number;
      date_created: null;
      date_modified: string;
      currency_code: string;
      currency_symbol: string;
    };
  };
  /**
   * The original date this subscription began or will begin if set in the future.
   */
  start_date: string;
  /**
   * The date for when this subscription will run again.
   */
  next_transaction_date: string;
  /**
   * If set, the date this subscription will end. The subscription will not run on this day.
   */
  end_date: string | null;
  /**
   * This determines how often this subscription will be processed. The format is a number followed by a date type such as d (day), w (week), m (month), or y (year). You can also use .5m for twice a month.
   */
  frequency: string;
  /**
   * If the last run of this subscription encountered an error, that error message will be saved here. It will also note if a past due payment was made.
   */
  error_message: string;
  /**
   * If a subscription payment is missed, this amount will be increased by that payment. The next time the subscription runs, it will be charged automatically, depending on your store's subscription settings.
   */
  past_due_amount: number;
  /**
   * If this subscription failed to process due to an error such as expired payment card, this field will show the first date the subscription failed to process. If it processes successfully at the next attempt, this field will be cleared.
   */
  first_failed_transaction_date: string | null;
  /**
   * Determines whether or not this transaction is active or not. If you are using the subscription datafeed, it is best to set the end_date to tomorrow instead of settings this to inactive.
   */
  is_active: boolean;
  /**
   * If this subscription is using a third party subscription system such as PayPal Express, their identifier will be set here.
   */
  third_party_id?: string;
};
