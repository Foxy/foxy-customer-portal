/* eslint-disable @stencil/ban-side-effects */

import faker from "faker";
import clone from "clone";
import { Path } from "path-parser";
import { DB } from "./utils/mockDatabase";
import { Subscription } from "./types/Subscription";

type RequestInfo = {
  body: any;
  headers: Record<string, string>;
  method: string;
  url: string;
};

type Request = {
  params: Record<string, string>;
  body: any;
};

type Response = {
  status: number;
  body: any;
};

class Handler {
  private path: Path;
  private method: string;

  constructor(
    method: string,
    pathTemplate: string,
    private needsAuth: boolean,
    private callback: (db: DB, request: Request) => Promise<Response>
  ) {
    this.path = new Path(pathTemplate);
    this.method = method.toUpperCase();
  }

  test(method: string, url: string) {
    return (
      method.toUpperCase() === this.method &&
      this.path.partialTest(url) !== null
    );
  }

  async run(db: DB, request: RequestInfo): Promise<Response> {
    if (
      this.needsAuth &&
      typeof request.headers["fx.customer"] === "undefined"
    ) {
      return {
        status: 401,
        body: {
          code: 401,
          type: "authentication",
          message: "Please login."
        }
      };
    }

    let body = request.body;

    try {
      body = JSON.parse(body);
    } catch (e) {}

    return this.callback(db, {
      params: this.path.partialTest(request.url),
      body
    });
  }
}

function createListResponse(key: string, request: Request, allItems: any[]) {
  const limit = "limit" in request.params ? parseInt(request.params.limit) : 10;
  const offset =
    "offset" in request.params ? parseInt(request.params.offset) : 0;

  const items = allItems.slice(offset, offset + limit);

  return {
    status: 200,
    body: {
      _links: {},
      _embedded: { [key]: items },
      total_items: allItems.length,
      returned_items: items.length,
      offset,
      limit
    }
  };
}

export const handlers = [
  new Handler("GET", "/subscriptions?limit&offset", true, async (db, req) => {
    return createListResponse("fx:subscriptions", req, db.subscriptions);
  }),
  new Handler("GET", "/transactions?limit&offset", true, async (db, req) => {
    return createListResponse("fx:transactions", req, db.transactions);
  }),
  new Handler("GET", "/?zoom&sso", true, async (db, req) => {
    const zoom = req.params.zoom || "";
    const body = clone(db.customer);

    body._embedded = body._embedded || {};
    body._links = body._links || {};

    if (zoom.includes("default_billing_address")) {
      body._embedded["fx:default_billing_address"] = db.billingAddress;
    }

    if (zoom.includes("default_shipping_address")) {
      body._embedded["fx:default_shipping_address"] = db.shippingAddress;
    }

    if (zoom.includes("default_payment_method")) {
      body._embedded["fx:default_payment_method"] = db.paymentMethod;
    }

    if (zoom.includes("subscriptions")) {
      body._embedded["fx:subscriptions"] = db.subscriptions.slice(0, 10);
    }

    if (zoom.includes("transactions")) {
      body._embedded["fx:transactions"] = db.transactions.slice(0, 10);
    }

    if (typeof req.params.sso !== "undefined") {
      body._links["fx:checkout"] = db.ssoLink;
    }

    return { status: 200, body };
  }),
  new Handler("PATCH", "/subscriptions/:id", true, async (db, request) => {
    const getID = (v: Subscription) => v._links.self.href.split("/").pop();
    const item = db.subscriptions.find(v => getID(v) === request.params.id);

    if (item === undefined) {
      return {
        status: 404,
        body: {
          code: 404,
          type: "not-found",
          message: "Resource doesn't exist."
        }
      };
    } else {
      Object.assign(item, request.body);
      return {
        status: 200,
        body: item
      };
    }
  }),
  new Handler("POST", "/forgot_password", false, async db => {
    db.passwordResetRequested = true;
    return {
      status: 200,
      body: {
        forgot_password: true
      }
    };
  }),
  new Handler("POST", "/authenticate", false, async (db, { body }) => {
    if (body.email !== db.customer.email || body.password !== db.password) {
      return {
        status: 422,
        body: {
          code: 422,
          type: "authentication",
          message: "Email or password incorrect."
        }
      };
    }

    return {
      status: 200,
      body: {
        cookieName: "fx.customer",
        cookieValue: faker.random.alphaNumeric(128),
        cookieMaxAge: 365 * 24 * 60 * 60
      }
    };
  }),
  new Handler("PATCH", "/", true, async (db, request) => {
    const { body } = request;
    const response = clone(db.customer);

    if (body.email) db.customer.email = body.email;
    if (body.first_name) db.customer.first_name = body.first_name;
    if (body.last_name) db.customer.last_name = body.last_name;

    if (body.password && body.password_old === db.password) {
      db.password = body.password;
    }

    if (body._embedded?.["fx:default_payment_method"]?.save_cc === false) {
      db.paymentMethod.cc_number_masked = "";
      db.paymentMethod.cc_exp_month = "";
      db.paymentMethod.cc_exp_year = "";
      db.paymentMethod.cc_type = "Visa";
      db.paymentMethod.save_cc = false;
    }

    if (body._embedded) {
      const embeds = {
        "fx:default_billing_address": db.billingAddress,
        "fx:default_shipping_address": db.shippingAddress,
        "fx:default_payment_method": db.paymentMethod
      };

      response._embedded = {};

      for (const name in embeds) {
        if (body._embedded[name]) {
          Object.assign(embeds[name], body._embedded[name]);
          response._embedded[name] = embeds[name];
        }
      }
    }

    return {
      status: 200,
      body: response
    };
  })
];
