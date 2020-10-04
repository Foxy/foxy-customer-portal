import JSCookie from "js-cookie";
import {
  APIError,
  Embed,
  LinkEmbed,
  DeepEmbed,
  serializeZoom,
  hasSSOLink
} from "./utils";
import { Attribute } from "../assets/types/Attribute";
import { Customer } from "../assets/types/Customer";
import { PaymentMethod } from "../assets/types/PaymentMethod";
import { Subscription } from "../assets/types/Subscription";
import { Transaction } from "../assets/types/Transaction";
import { Address } from "../assets/types/Address";
import { getCookieExpiryDate } from "./authenticate";
import { Item } from "../assets/types/Item";

export type EditablePaymentMethod = Pick<
  PaymentMethod,
  "save_cc" | "cc_exp_month" | "cc_exp_year"
>;

export type SetOnlyCustomer = {
  /**
   * Your customer's old or temporary password
   * needed whenever a new password is set.
   */
  password_old: string;

  /**
   * Your customer's clear text password. This value is never stored,
   * not displayed for this resource, and is not available in our system.
   * You can, however, pass it via clear text when creating or modifying a customer.
   * When creating a customer, if you leave this blank, a random value will be
   * generated for you which you can modify later as needed.
   */
  password: string;
};

export type EditableCustomer = Pick<
  Customer,
  "email" | "first_name" | "last_name"
>;

export type EditableAddress = Omit<
  Address,
  | "address_name"
  | "is_default_billing"
  | "is_default_shipping"
  | "date_created"
  | "date_modified"
>;

export interface GetRequest {
  /** List of zoomable resources. */
  zoom?: {
    /** Default billing address (returned as _embedded["fx:default_billing_address"]). */
    default_billing_address?: boolean;

    /** Default shipping address (returned as _embedded["fx:default_shipping_address"]). */
    default_shipping_address?: boolean;

    /** Default payment method (returned as _embedded["fx:default_payment_method"]). */
    default_payment_method?: boolean;

    /** Up to 10 active subscriptions sorted by start date (new to old). */
    subscriptions?: boolean | Partial<Record<"transactions", boolean>>;

    /** Up to 10 latest transactions sorted by date (new to old). */
    transactions?: boolean | Partial<Record<"items", boolean>>;
  };

  /** An SSO URI (will be returned as _links[“fx:checkout”]). */
  sso?: boolean;
}

export type GetResponse<T extends GetRequest> = Customer &
  Embed<T, "subscriptions", "fx:subscriptions", Subscription[]> &
  Embed<T, "transactions", "fx:transactions", Transaction[]> &
  Embed<T, "default_billing_address", "fx:default_billing_address", Address> &
  Embed<T, "default_shipping_address", "fx:default_shipping_address", Address> &
  DeepEmbed<
    T,
    { transactions: { items: boolean } },
    {
      "fx:transactions": (Transaction & {
        _embedded: { "fx:items": Item[] };
      })[];
    }
  > &
  DeepEmbed<
    T,
    { subscriptions: { transactions: boolean } },
    {
      "fx:subscriptions": (Subscription & {
        _embedded: { "fx:transactions": Transaction[] };
      })[];
    }
  > &
  Embed<
    T,
    "default_payment_method",
    "fx:default_payment_method",
    PaymentMethod
  > &
  LinkEmbed<T, "sso", "fx:checkout"> & {
    _embedded?: {
      /** Various attributes set on this customer's profile. */
      "fx:attributes"?: Attribute[];
    };
  };

export type FullGetResponse = GetResponse<{
  zoom: {
    default_billing_address: true;
    default_shipping_address: true;
    default_payment_method: true;
    subscriptions: { transactions: true };
    transactions: { items: true };
  };
  sso: true;
}>;

/**
 * Makes a GET request to `/s/customer`, retrieving logged in
 * customer's data. Auth is required.
 *
 * @param endpoint Full API endpoint, e.g. `https://foxy-demo.foxycart.com/s/customer`.
 * @param request Query parameters.
 */
export async function get<T extends GetRequest>(
  endpoint: string,
  request: T = {} as T
): Promise<GetResponse<T>> {
  const query = new URLSearchParams();
  const hasSSOCookie = Boolean(JSCookie.get("fx.customer.sso"));

  if (request.sso || !hasSSOCookie) query.set("sso", "true");

  if (Boolean(request.zoom)) {
    query.set("zoom", serializeZoom(request.zoom).toString());
  }

  const response = await window.fetch(`${endpoint}?${query.toString()}`, {
    method: "GET",
    headers: { "fx.customer": JSCookie.get("fx.customer") }
  });

  if (response.ok) {
    const json = (await response.json()) as GetResponse<T>;

    if (hasSSOLink(json)) {
      if (!hasSSOCookie && json._links["fx:checkout"].href !== null) {
        JSCookie.set("fx.customer.sso", json._links["fx:checkout"].href, {
          expires: getCookieExpiryDate() || new Date(Date.now() + 10800000),
          secure: location.hostname !== "localhost"
        });
      }

      if (!request.sso) delete json._links["fx:checkout"];
    }

    return json;
  } else {
    throw new APIError(await response.json());
  }
}

export type PatchRequest = {
  zoom?: GetRequest["zoom"];
  _embedded?: {
    "fx:default_billing_address"?: Partial<EditableAddress>;
    "fx:default_shipping_address"?: Partial<EditableAddress>;
    "fx:default_payment_method"?: Partial<EditablePaymentMethod>;
  };
} & (Partial<EditableCustomer> | (Partial<EditableCustomer> & SetOnlyCustomer));

export type PatchResponse<T extends PatchRequest> = GetResponse<T>;

/**
 * Makes a PATCH request to `/s/customer`, updating logged in
 * customer's data. Auth is required.
 *
 * @param endpoint Full API endpoint, e.g. `https://foxy-demo.foxycart.com/s/customer`.
 * @param request Data to update.
 */
export async function patch<T extends PatchRequest>(
  endpoint: string,
  request: T
) {
  const query = new URLSearchParams();

  if (Boolean(request.zoom)) {
    query.set("zoom", Object.keys(request.zoom).toString());
  }

  const response = await window.fetch(`${endpoint}?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      "fx.customer": JSCookie.get("fx.customer")
    },
    method: "PATCH",
    body: JSON.stringify(request)
  });

  if (response.ok) {
    return response.json() as Promise<PatchResponse<T>>;
  } else {
    throw new APIError(await response.json());
  }
}
