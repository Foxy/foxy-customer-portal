/* eslint-disable @stencil/ban-side-effects */

import clone from "clone";
import faker from "faker";
import path from "path";
import jsf from "json-schema-faker";

import PaymentMethodSchema from "../schema/PaymentMethod.json";
import SubscriptionSchema from "../schema/Subscription.json";
import TransactionSchema from "../schema/Transaction.json";
import CustomerSchema from "../schema/Customer.json";
import AddressSchema from "../schema/Address.json";
import LinkSchema from "../schema/Link.json";
import { Address } from "../types/Address";
import { Link } from "../types/Link";
import { Customer } from "../types/Customer";
import { Transaction } from "../types/Transaction";
import { Subscription } from "../types/Subscription";
import { PaymentMethod } from "../types/PaymentMethod";

const cwd = path.resolve(__dirname, "../schema/");
const template = new Array(12).fill(0);

jsf.extend("faker", () => faker);
jsf.option("useExamplesValue", true);

function sortByDate(a: Address, b: Address) {
  const d1 = new Date(a.date_created).getTime();
  const d2 = new Date(b.date_created).getTime();

  return d2 - d1;
}

export type DB = {
  ssoLink: Link;
  customer: Customer;
  transactions: Transaction[];
  subscriptions: Subscription[];
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  passwordResetRequested: boolean;
  password: string;
};

export async function mockDatabase(url = "https://foxy.local/s/customer/") {
  const [
    ssoLink,
    address,
    customer,
    paymentMethod,
    subscriptions,
    transactions
  ] = await Promise.all([
    jsf.resolve(LinkSchema, cwd),
    jsf.resolve(AddressSchema, cwd),
    jsf.resolve(CustomerSchema, cwd),
    jsf.resolve(PaymentMethodSchema, cwd),
    Promise.all(template.map(() => jsf.resolve(SubscriptionSchema, cwd))),
    Promise.all(template.map(() => jsf.resolve(TransactionSchema, cwd)))
  ]);

  customer.email = "hello@foxy.io";

  address.first_name = customer.first_name;
  address.last_name = customer.last_name;

  const billingAddress = clone(address);
  const shippingAddress = clone(address);

  billingAddress.address_name = "Default Billing Address";
  billingAddress.is_default_billing = true;
  billingAddress.is_default_shipping = false;

  shippingAddress.address_name = "Default Shipping Address";
  shippingAddress.is_default_billing = false;
  shippingAddress.is_default_shipping = true;

  subscriptions.sort(sortByDate).forEach((item, index, array) => {
    item._embedded["fx:transactions"] = item._embedded["fx:transactions"].sort(
      (a: Transaction, b: Transaction) => {
        return (
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime()
        );
      }
    );

    item.is_active = index <= (array.length / 3) * 2;

    const href = `${url}subscriptions/${faker.random.uuid()}`;
    item._links.self = { title: "This Subscription", href };
    item._links["fx:sub_token_url"] = { title: "Token URL", href };

    if (new Date(item.next_transaction_date) > new Date(item.end_date)) {
      const next = item.next_transaction_date;
      item.next_transaction_date = item.end_date;
      item.end_date = next;
    }

    if (index <= array.length / 3) {
      item.end_date = null;

      if (index === 1) {
        // custom next date modification rules in the second subscription

        const fourDaysFromNow = new Date();
        fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

        const nextWeekStart = new Date();

        do {
          nextWeekStart.setDate(nextWeekStart.getDate() + 1);
        } while (nextWeekStart.getDay() === 0);

        const nextWeekEnd = new Date(nextWeekStart);

        do {
          nextWeekEnd.setDate(nextWeekEnd.getDate() + 1);
        } while (nextWeekEnd.getDay() === 6);

        item._embedded.template_config.allow_next_date_modification = {
          min: "2d", // can't change to a date earlier than 2 days from now
          max: "3m", // can't change to a date later than 3 months from now
          allowedDays: {
            type: "day", // allow only Mondays, Thursdays and Sundays
            days: [1, 4, 7]
          },
          disallowedDates: [
            fourDaysFromNow.toISOString().substr(0, 10), // disallow the date 4 days from now
            [nextWeekStart, nextWeekEnd]
              .map(v => v.toISOString().substr(0, 10))
              .join("..") // disallow the entire next week
          ]
        };
      } else {
        item._embedded.template_config.allow_next_date_modification = true;
      }
    } else if (index > array.length / 2) {
      const endDate = new Date(item.end_date);

      if (endDate.getTime() > Date.now()) {
        endDate.setFullYear(new Date().getFullYear() - 1);
        item.end_date = endDate.toISOString();
      }

      item.next_transaction_date = item.end_date;
      item._embedded.template_config.allow_next_date_modification = false;
    }

    if (index === 0) {
      const failedDate = new Date(
        item._embedded["fx:transactions"][0].transaction_date
      );

      failedDate.setMonth(failedDate.getMonth() + 1);
      item.first_failed_transaction_date = failedDate.toISOString();
      item.is_active = true;
    } else {
      item.first_failed_transaction_date = null;
      item.is_active = true;
      item.past_due_amount = 0;
      item.error_message = "";
    }
  });

  transactions.sort(sortByDate).forEach((transaction: Transaction) => {
    transaction.customer_email = customer.email;
    transaction.customer_first_name = customer.customer_first_name;
    transaction.customer_last_name = customer.customer_last_name;

    const receiptURL = `https://foxy.local/transactions/${transaction.id}`;
    transaction._links["fx:receipt"].href = receiptURL;
  });

  return {
    ssoLink,
    customer,
    transactions,
    subscriptions,
    billingAddress,
    shippingAddress,
    paymentMethod,
    password: "asdfasdf",
    passwordResetRequested: false
  };
}
