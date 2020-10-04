import { click } from "../../assets/utils/click";
import { usePage } from "../../assets/utils/usePage";
import { interceptAPIRequests } from "../../assets/utils/interceptAPIRequests";
import { E2EElement } from "@stencil/core/testing";
import { Subscription } from "../../assets/types/Subscription";

const tag = "foxy-subscriptions";

describe("HTMLFoxySubscriptionsElement", () => {
  const templates = [
    `<${tag}></${tag}>`,
    `<${tag} cols="6"></${tag}>`,
    `<${tag} locale="ru"></${tag}>`,
    `<${tag} locale="fr"></${tag}>`,
    `<${tag} locale="cy"></${tag}>`,
    `<${tag} locale="pt-br"></${tag}>`,
    `<${tag} endpoint="http://i.dont.exist.local"></${tag}>`
  ];

  const descriptions = [
    "zero config",
    "custom cols",
    "custom locale",
    "custom endpoint url"
  ];

  describe("logged out: displays empty state", () => {
    descriptions.forEach((testDescription, templateIndex) => {
      it(testDescription, async () => {
        await usePage(async ({ page }) => {
          await page.setContent(templates[templateIndex]);
          await page.waitForChanges();

          const elements = await page.findAll(`${tag} >>> foxy-subscription`);
          expect(elements.length).toEqual(0);
        });
      });
    });
  });

  describe("authorized:", () => {
    it("displays subscriptions from a remote source", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForChanges();

        const parent = await page.find(tag);
        const elements = await page.findAll(`${tag} >>> foxy-subscription`);

        expect(elements.length).toBeGreaterThan(0);
        expect(elements.length).toBeLessThanOrEqual(db.subscriptions.length);

        for (let i = 0; i < elements.length; ++i) {
          await shouldDisplay(elements[i], parent, db.subscriptions[i]);
        }
      });
    });

    it("navigates forwards and backwards", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForChanges();

        const parent = await page.find(tag);
        let elements = await page.findAll(`${tag} >>> foxy-subscription`);
        let offset = elements.length;

        await click(page, `${tag} >>> [data-e2e=btn-next]`);
        await page.waitForChanges();

        for (let i = 0; i < elements.length; ++i) {
          const child = elements[i];
          await shouldDisplay(child, parent, db.subscriptions[offset + i]);
        }

        await click(page, `${tag} >>> [data-e2e=btn-prev]`);
        await page.waitForChanges();

        offset -= elements.length;
        elements = await page.findAll(`${tag} >>> foxy-subscription`);

        for (let i = 0; i < elements.length; ++i) {
          const child = elements[i];
          await shouldDisplay(child, parent, db.subscriptions[offset + i]);
        }
      });
    });
  });
});

async function shouldDisplay(
  child: E2EElement,
  parent: E2EElement,
  subscription: Subscription
) {
  expect(await child.getProperty("link")).toEqual(
    subscription._links.self.href
  );

  expect(await child.getProperty("locale")).toEqual(
    await parent.getProperty("locale")
  );

  expect(await child.getProperty("endpoint")).toEqual(
    await parent.getProperty("endpoint")
  );
}
