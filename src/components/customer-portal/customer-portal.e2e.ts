import { PageEventObj } from "puppeteer";
import { click } from "../../assets/utils/click";
import { customer } from "../../assets/defaults";
import faker from "faker";
import { interceptAPIRequests } from "../../assets/utils/interceptAPIRequests";
import { usePage } from "../../assets/utils/usePage";

const tag = "foxy-customer-portal";

describe("HTMLFoxyCustomerPortalElement", () => {
  describe("Logged out", () => {
    it("shows signin form", async () => {
      await usePage(async ({ page }) => {
        await page.setContent(`<${tag}></${tag}>`);
        await page.waitForChanges();
        const signIn = await page.find(`${tag} >>> foxy-sign-in`);
        expect(await signIn.isVisible()).toBe(true);
      });
    });
  });

  describe("Logged in", () => {
    const consumers = [
      "foxy-subscriptions",
      "foxy-transactions",
      "foxy-address",
      "foxy-profile"
    ];

    consumers.forEach(consumer => {
      it(`shares state with ${consumer}`, async () => {
        await interceptAPIRequests(async ({ page, url, signIn }) => {
          await signIn();
          await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
          await page.waitForChanges();

          const root = await page.find(tag);
          const rootState = await root.callMethod("getState");
          const rootLocale = await root.getProperty("locale");
          const rootEndpoint = await root.getProperty("endpoint");
          const child = await page.find(`${tag} >>> ${consumer}`);

          expect(await child.getProperty("locale")).toBe(rootLocale);
          expect(await child.getProperty("endpoint")).toBe(rootEndpoint);
          expect(await child.callMethod("getState")).toEqual(rootState);
        });
      });
    });

    it("shows activity page by default", async () => {
      await interceptAPIRequests(async ({ page, url, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForChanges();

        for (const child of ["foxy-subscriptions", "foxy-transactions"]) {
          const element = await page.find(`${tag} >>> ${child}`);
          expect(await element.isVisible()).toBe(true);
        }
      });
    });

    it("shows profile page when navigated to", async () => {
      await interceptAPIRequests(async ({ page, url, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForChanges();
        await click(page, `${tag} >>> [data-e2e=lnk-account]`);

        for (const child of ["foxy-profile", "foxy-address"]) {
          for (const element of await page.findAll(`${tag} >>> ${child}`)) {
            expect(await element.isVisible()).toBe(true);
          }
        }
      });
    });

    it("signs out when the sign out button is clicked", async () => {
      await interceptAPIRequests(async ({ page, url, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForChanges();
        await click(page, `${tag} >>> [data-e2e=btn-sign-out]`);

        const root = await page.find(tag);
        const foxySignIn = await page.find(`${tag} >>> foxy-sign-in`);
        const cookies = await page.cookies();
        const cookie = cookies.find(v => v.name === "fx.customer");

        if (typeof cookie === "undefined") {
          expect(cookie).toBeUndefined();
        } else {
          expect(cookie.expires).toBe(-1);
        }

        expect(await foxySignIn.isVisible()).toBe(true);
        expect(await root.callMethod("getState")).toMatchObject(customer());
      });
    });

    it("signs out on 401", async () => {
      await usePage(async ({ page }) => {
        const interceptor = (e: PageEventObj["request"]) => {
          if (e.isNavigationRequest() || Boolean(e.response())) return;
          if (e.url().startsWith("https://foxy.local")) {
            return e.respond({
              contentType: "application/json",
              status: 401,
              body: JSON.stringify({
                code: "401",
                type: "other",
                message: "This route is protected. Please login."
              })
            });
          }
          return e.continue();
        };

        page.on("request", interceptor);
        await page.setRequestInterception(true);

        await page.setCookie({
          name: "fx.customer",
          value: faker.random.alphaNumeric(128),
          url: "http://localhost:8080"
        });

        await page.setContent(
          `<${tag} endpoint="https://foxy.local"></${tag}>`
        );

        await page.waitForChanges();

        const root = await page.find(tag);
        const foxySignIn = await page.find(`${tag} >>> foxy-sign-in`);
        const cookies = await page.cookies();
        const cookie = cookies.find(v => v.name === "fx.customer");

        if (typeof cookie === "undefined") {
          expect(cookie).toBeUndefined();
        } else {
          expect(cookie.expires).toBe(-1);
        }

        expect(await foxySignIn.isVisible()).toBe(true);
        expect(await root.callMethod("getState")).toMatchObject(customer());

        page.off("request", interceptor);
        await page.setRequestInterception(false);
      });
    });

    it("renders additional links with markdown syntax", async () => {
      await interceptAPIRequests(async ({ page, url, signIn }) => {
        const links = "[Foo](https://example.com/foo)[Bar](portal://bar)";
        const content = `<${tag} endpoint="${url}" tabs="${links}" router></${tag}>`;

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const wrappers = await page.findAll(`${tag} >>> vaadin-tab > a`);
        const [bar, foo] = wrappers.reverse();

        expect(foo.getAttribute("href")).toEqual("https://example.com/foo");
        expect(bar.getAttribute("href")).toEqual("#foxy-customer-portal--bar");

        expect(foo).toEqualText("Foo");
        expect(bar).toEqualText("Bar");
      });
    });

    it("renders additional links when using js array", async () => {
      await interceptAPIRequests(async ({ page, url, signIn }) => {
        const tabs = [
          {
            href: "https://example.com/foo",
            text: "Foo"
          },
          {
            href: "portal://bar",
            text: "Bar"
          }
        ];

        await signIn();
        await page.setContent(`<${tag} endpoint="${url}" router></${tag}>`);
        await page.waitForEvent("ready");

        const root = await page.find(tag);
        root.setProperty("tabs", tabs);
        await page.waitForChanges();

        const wrappers = await page.findAll(`${tag} >>> vaadin-tab > a`);
        const [bar, foo] = wrappers.reverse();

        expect(foo.getAttribute("href")).toEqual("https://example.com/foo");
        expect(bar.getAttribute("href")).toEqual("#foxy-customer-portal--bar");

        expect(foo).toEqualText("Foo");
        expect(bar).toEqualText("Bar");
      });
    });
  });
});
