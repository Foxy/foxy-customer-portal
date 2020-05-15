import { click } from "../../assets/utils/click";
import { usePage } from "../../assets/utils/usePage";
import { interceptAPIRequests } from "../../assets/utils/interceptAPIRequests";
import { E2EElement } from "@stencil/core/testing";
import { Transaction } from "../../assets/types/Transaction";

const tag = "foxy-transactions";

describe("HTMLFoxyTransactionsElement", () => {
  const templates = [
    `<${tag}></${tag}>`,
    `<${tag} cols="6"></${tag}>`,
    `<${tag} locale="ru"></${tag}>`,
    `<${tag} locale="fr"></${tag}>`,
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

          const tbody = await page.find(`${tag} >>> tbody`);
          expect(tbody).toEqualText("");
        });
      });
    });
  });

  describe("authorized:", () => {
    it("displays transactions from a remote source", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForChanges();

        const locale = await (await page.find(tag)).getProperty("locale");
        const rows = await page.findAll(`${tag} >>> tbody tr`);

        expect(rows.length).toBeGreaterThan(0);
        expect(rows.length).toBeLessThanOrEqual(db.transactions.length);

        for (let i = 0; i < rows.length; ++i) {
          await shouldDisplay(rows[i], db.transactions[i], locale);
        }
      });
    });

    it("navigates forwards and backwards", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();
        await page.setContent(`<${tag} endpoint="${url}"></${tag}>`);
        await page.waitForEvent("ready");

        const locale = await (await page.find(tag)).getProperty("locale");

        let rows = await page.findAll(`${tag} >>> tbody tr`);
        let offset = rows.length;
        await click(page, `${tag} >>> [data-e2e=btn-next]`);

        for (let i = 0; i < rows.length; ++i) {
          await shouldDisplay(rows[i], db.transactions[offset + i], locale);
        }

        await click(page, `${tag} >>> [data-e2e=btn-prev]`);
        offset -= rows.length;
        rows = await page.findAll(`${tag} >>> tbody tr`);

        for (let i = 0; i < rows.length; ++i) {
          await shouldDisplay(rows[i], db.transactions[offset + i], locale);
        }
      });
    });
  });
});

async function shouldDisplay(
  row: E2EElement,
  item: Transaction,
  locale: string
) {
  const cells = await row.findAll("td");
  const receiptLink = await cells[3].find("a");
  const resolvedLocale = locale === "default" ? "en" : locale;

  expect(cells[0].textContent.includes(item.id.toString())).toBe(true);

  expect(
    cells[1].textContent.includes(
      new Date(item.transaction_date).toLocaleDateString(resolvedLocale, {
        year: "numeric",
        month: "short",
        day: "2-digit"
      })
    )
  ).toBe(true);

  expect(cells[2]).toEqualText(
    new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: item.currency_code
    }).format(item.total_order)
  );

  expect(await receiptLink.getProperty("href")).toEqualText(
    item._links["fx:receipt"].href
  );
}
