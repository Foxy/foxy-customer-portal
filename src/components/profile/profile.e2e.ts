import faker from "faker";
import { E2EPage } from "@stencil/core/testing";
import { click } from "../../assets/utils/click";
import { replaceText } from "../../assets/utils/replaceText";
import { usePage } from "../../assets/utils/usePage";
import { interceptAPIRequests } from "../../assets/utils/interceptAPIRequests";
import { Customer } from "../../assets/types/Customer";
import { DB } from "../../assets/utils/mockDatabase";
import { PaymentMethod } from "../../assets/types/PaymentMethod";

describe("HTMLFoxyProfileElement", () => {
  const templates = [
    "<foxy-profile></foxy-profile>",
    '<foxy-profile locale="ru"></foxy-profile>',
    '<foxy-profile locale="fr"></foxy-profile>',
    '<foxy-profile endpoint="http://i.dont.exist.local"></foxy-profile>'
  ];

  const descriptions = ["zero config", "custom locale", "custom endpoint url"];

  describe("logged out: displays empty state", () => {
    descriptions.forEach((testDescription, templateIndex) => {
      it(testDescription, async () => {
        await usePage(async ({ page }) => {
          await page.setContent(templates[templateIndex]);
          await page.waitForChanges();
          await shouldRenderEmptyState(page);
        });
      });
    });
  });

  describe("authorized: displays error message upon failure to fetch", () => {
    descriptions.forEach((testDescription, templateIndex) => {
      it(testDescription, async () => {
        await interceptAPIRequests(async ({ page, signIn }) => {
          await signIn();
          await page.setContent(templates[templateIndex]);
          await page.waitForEvent("ready");

          const error = await page.find("foxy-profile >>> [data-e2e=error]");
          expect(error).not.toBeNull();
        });
      });
    });
  });

  describe("authorized: supports customer profile", () => {
    it("displays by default", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();

        const html = `<foxy-profile endpoint="${url}"></foxy-profile>`;
        await page.setContent(html);
        await page.waitForEvent("ready");

        await shouldRenderProfile(page, db.customer);
        await shouldRenderCard(page, db.paymentMethod);
      });
    });

    it("allows undoing edits before saving", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-profile endpoint="${url}"></foxy-profile>`;
        const newData = remixData(db);

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await click(page, "foxy-profile >>> [data-e2e=toggle]");
        await enterData(page, newData);
        await click(page, "foxy-profile >>> [data-e2e=toggle]");

        await shouldRenderProfile(page, db.customer);
      });
    });

    it("allows editing and saving", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-profile endpoint="${url}"></foxy-profile>`;
        const newData = remixData(db);

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await click(page, "foxy-profile >>> [data-e2e=toggle]");
        await enterData(page, newData);
        await click(page, "foxy-profile >>> [data-e2e=save]");

        await shouldRenderProfile(page, db.customer);
        expect(db.password).toBe(newData.password);
        expect(db.customer.email).toBe(newData.email);
      });
    });

    it("allows removing card data as a separate action", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-profile endpoint="${url}"></foxy-profile>`;

        await signIn();
        await page.setContent(html);
        await page.waitForEvent("ready");

        await click(page, "foxy-profile >>> [data-e2e=toggle]");
        await click(page, "foxy-profile >>> [data-e2e=btn-remove-cc]");

        await page.waitForSelector("[data-e2e=btn-ok]");
        await page.$eval("[data-e2e=btn-ok]", v => (v as any).click());
        await page.waitFor(1000);

        expect(
          await page.find("foxy-profile >>> [data-e2e=cc-number]")
        ).toBeNull();

        expect(db.paymentMethod.save_cc).toBe(false);
      });
    });
  });
});

type ProfileData = Record<"email" | "password" | "password_old", string>;

async function enterData(page: E2EPage, data: ProfileData) {
  const email = await page.find(`foxy-profile >>> [data-e2e=fld-email]`);
  const oldPw = await page.find(`foxy-profile >>> [data-e2e=fld-old-password]`);
  const newPw = await page.find(`foxy-profile >>> [data-e2e=fld-new-password]`);

  await replaceText(page, email, data.email);
  await replaceText(page, oldPw, data.password_old);
  await replaceText(page, newPw, data.password);

  await page.waitForChanges();
}

async function shouldRenderEmptyState(page: E2EPage) {
  const whenSkeletonsFound = Promise.all([
    page.find("foxy-profile >>> [data-e2e=lbl-email] [data-e2e=skeleton]")
  ]);

  const whenFieldsFound = Promise.all([
    page.find("foxy-profile >>> [data-e2e=fld-email]"),
    page.find("foxy-profile >>> [data-e2e=fld-old-password]"),
    page.find("foxy-profile >>> [data-e2e=fld-new-password]")
  ]);

  await Promise.all([
    whenSkeletonsFound.then(elements => {
      elements.forEach(e => expect(e).not.toBeNull());
    }),
    whenFieldsFound
      .then(elements => elements.map(e => e.getProperty("value")))
      .then(getters => Promise.all(getters))
      .then(values => values.forEach(v => expect(v).toEqualText("")))
  ]);

  expect(await page.find("foxy-profile >>> [data-e2e=cc-number]")).toBeNull();
}

async function shouldRenderProfile(page: E2EPage, profile: Customer) {
  const lblEmail = await page.find("foxy-profile >>> [data-e2e=lbl-email]");
  expect(lblEmail).toEqualText(profile.email);

  for (const type of ["old", "new"]) {
    const selector = `foxy-profile >>> [data-e2e=fld-${type}-password]`;
    const field = await page.find(selector);
    const value = await field.getProperty("value");

    expect(value).toEqualText("");
  }
}

async function shouldRenderCard(page: E2EPage, card: PaymentMethod) {
  const lblCcInfo = await page.find("foxy-profile >>> [data-e2e=lbl-cc-info]");
  const ccNumber = await page.find("foxy-profile >>> [data-e2e=cc-number]");

  const last4Digits = card.cc_number_masked.substring(
    card.cc_number_masked.length - 4
  );

  expect(lblCcInfo.textContent.includes(last4Digits)).toBe(true);
  expect(lblCcInfo.textContent.includes(card.cc_type)).toBe(true);
  expect(ccNumber.textContent.includes(last4Digits)).toBe(true);
}

function remixData(db: DB) {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    password_old: db.password
  };
}
