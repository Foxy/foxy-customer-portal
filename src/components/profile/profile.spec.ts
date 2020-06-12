import { SpecPage, newSpecPage } from "@stencil/core/testing";
import { testLifecycle } from "../../assets/utils/testLifecycle";
import { testStore } from "../../assets/utils/testStore";
import { mockFetch } from "../../assets/utils/mockFetch";
import { testI18N } from "../../assets/utils/testI18N";
import { Profile } from "./profile";

const tag = "foxy-profile";

describe("HTMLFoxyProfileElement", () => {
  testLifecycle("foxy-profile");
  testStore("foxy-profile");
  testI18N("foxy-profile");

  describe("Public methods", () => {
    let page: SpecPage;

    beforeEach(async () => {
      page = await newSpecPage({
        components: [Profile],
        html: `<${tag}></${tag}>`
      });
    });

    it("has `removeDefaultPaymentMethod()` method", async () => {
      expect(page.rootInstance).toHaveProperty("removeDefaultPaymentMethod");
      expect(typeof page.rootInstance.removeDefaultPaymentMethod).toEqual(
        "function"
      );
    });

    it("removes the default payment method when `removeDefaultPaymentMethod()` is called", async () => {
      page.win.fetch = await mockFetch();
      page.doc.cookie = "fx.customer=any";

      await page.rootInstance.removeDefaultPaymentMethod();

      const localState = await page.rootInstance.getState();
      const remoteState = await (
        await page.win.fetch(`/s/customer?zoom=default_payment_method`, {
          headers: { "fx.customer": "any" }
        })
      ).json();

      expect(localState._embedded["fx:default_payment_method"].save_cc).toBe(
        false
      );

      expect(remoteState._embedded["fx:default_payment_method"].save_cc).toBe(
        false
      );
    });
  });
});
