import { SpecPage, newSpecPage } from "@stencil/core/testing";

import { Subscription } from "./subscription";
import { mockFetch } from "../../assets/utils/mockFetch";
import { testI18N } from "../../assets/utils/testI18N";
import { testLifecycle } from "../../assets/utils/testLifecycle";
import { testStore } from "../../assets/utils/testStore";

const tag = "foxy-subscription";

describe("HTMLFoxySubscriptionElement", () => {
  testLifecycle("foxy-subscription");
  testStore("foxy-subscription");
  testI18N("foxy-subscription");

  describe("Public properties", () => {
    let page: SpecPage;

    beforeEach(async () => {
      page = await newSpecPage({
        components: [Subscription],
        html: `<${tag}></${tag}>`
      });
    });

    it("has writable property `open` defaulting to `false`", () => {
      expect(page.rootInstance).toHaveProperty("open", false);
      page.rootInstance.open = true;
      expect(page.rootInstance).toHaveProperty("open", true);
    });
  });

  describe("Public methods", () => {
    let page: SpecPage;

    beforeEach(async () => {
      page = await newSpecPage({
        components: [Subscription],
        html: `<${tag}></${tag}>`
      });
    });

    it("has `setFrequency()` method", async () => {
      expect(page.rootInstance).toHaveProperty("setFrequency");
      expect(typeof page.rootInstance.setFrequency).toEqual("function");
    });

    it("has `setNextTransactionDate()` method", async () => {
      expect(page.rootInstance).toHaveProperty("setNextTransactionDate");
      expect(typeof page.rootInstance.setNextTransactionDate).toEqual(
        "function"
      );
    });

    it("sets a new frequency with `setFrequency()`", async () => {
      const newValue = "40d";
      page.win.fetch = await mockFetch();

      page.doc.cookie = "fx.customer=any";
      await page.rootInstance.setState(await page.rootInstance.getState(true));

      page.doc.cookie = "fx.customer=any";
      await page.rootInstance.setFrequency(newValue);

      const localState = await page.rootInstance.getState();
      const localSubscriptions = localState._embedded["fx:subscriptions"];
      expect(localSubscriptions[0].frequency).toBe(newValue);

      const remoteState = await (
        await page.win.fetch(`/s/customer?zoom=subscriptions&sso=true`, {
          headers: { "fx.customer": "any" }
        })
      ).json();

      const remoteSubscriptions = remoteState._embedded["fx:subscriptions"];
      expect(remoteSubscriptions[0].frequency).toBe(newValue);
    });

    it("sets a new next transaction date with `setNextTransactionDate()`", async () => {
      const WEEK = 604800000;
      const newValue = new Date(Date.now() + WEEK);
      page.win.fetch = await mockFetch();

      page.doc.cookie = "fx.customer=any";
      await page.rootInstance.setState(await page.rootInstance.getState(true));

      page.doc.cookie = "fx.customer=any";
      await page.rootInstance.setNextTransactionDate(newValue);

      const localState = await page.rootInstance.getState();
      const localSubscriptions = localState._embedded["fx:subscriptions"];
      expectSameDay(newValue, localSubscriptions[0].next_transaction_date);

      const remoteState = await (
        await page.win.fetch(`/s/customer?zoom=subscriptions&sso=true`, {
          headers: { "fx.customer": "any" }
        })
      ).json();

      const remoteSubscriptions = remoteState._embedded["fx:subscriptions"];
      expectSameDay(newValue, remoteSubscriptions[0].next_transaction_date);
    });
  });
});

function expectSameDay(a: Date | string, b: Date | string) {
  const date1 = new Date(a);
  const date2 = new Date(b);

  expect(date1.getFullYear()).toBe(date2.getFullYear());
  expect(date1.getMonth()).toBe(date2.getMonth());
  expect(date1.getDate()).toBe(date2.getDate());
}
