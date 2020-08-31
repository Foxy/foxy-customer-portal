import { E2EPage } from "@stencil/core/testing";
import faker from "faker";
import jsf from "json-schema-faker";
import path from "path";
import AddressSchema from "../../assets/schema/Address.json";
import { click } from "../../assets/utils/click";
import { replaceText } from "../../assets/utils/replaceText";
import { usePage } from "../../assets/utils/usePage";
import { interceptAPIRequests } from "../../assets/utils/interceptAPIRequests";
import { Address } from "../../assets/types/Address";
import { FC } from "./mocks/fc";

describe("HTMLFoxyAddressElement", () => {
  const templates = [
    "<foxy-address></foxy-address>",
    '<foxy-address locale="ru"></foxy-address>',
    '<foxy-address locale="fr"></foxy-address>',
    '<foxy-address locale="cy"></foxy-address>',
    '<foxy-address type="default_shipping_address"></foxy-address>',
    '<foxy-address endpoint="http://i.dont.exist.local"></foxy-address>'
  ];

  const descriptions = [
    "zero config",
    "custom locale",
    "custom address type",
    "custom endpoint url"
  ];

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

          const error = await page.find("foxy-address >>> [data-e2e=error]");
          expect(error).not.toBeNull();
        });
      });
    });
  });

  describe("authorized: supports billing address", () => {
    it("displays by default", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();

        const html = `<foxy-address endpoint="${url}"></foxy-address>`;
        await page.setContent(html);
        await page.waitForChanges();

        await shouldRenderAddress(page, db.billingAddress);
      });
    });

    it("displays when specified explicitly", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();

        const html = `<foxy-address endpoint="${url}" type="default_billing_address"></foxy-address>`;
        await page.setContent(html);
        await page.waitForChanges();

        await shouldRenderAddress(page, db.billingAddress);
      });
    });

    it("allows undoing edits before saving", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-address endpoint="${url}"></foxy-address>`;

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await click(page, "foxy-address >>> [data-e2e=toggle]");
        await enterAddress(page, await remixAddress(db.billingAddress));
        await click(page, "foxy-address >>> [data-e2e=toggle]");

        await shouldRenderAddress(page, db.billingAddress);
      });
    });

    it("allows editing and saving", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-address endpoint="${url}"></foxy-address>`;
        const newAddress = await remixAddress(db.billingAddress);

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await click(page, "foxy-address >>> [data-e2e=toggle]");
        await enterAddress(page, newAddress);
        await click(page, "foxy-address >>> [data-e2e=save]");

        await shouldRenderAddress(page, newAddress);
        shouldMatch(db.billingAddress, newAddress);
      });
    });
  });

  describe("authorized: supports shipping address", () => {
    it("displays when specified explicitly", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        await signIn();

        const html = `<foxy-address endpoint="${url}" type="default_shipping_address"></foxy-address>`;
        await page.setContent(html);
        await page.waitForChanges();

        await shouldRenderAddress(page, db.shippingAddress);
      });
    });

    it("allows undoing edits before saving", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-address endpoint="${url}" type="default_shipping_address"></foxy-address>`;

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await click(page, "foxy-address >>> [data-e2e=toggle]");
        await enterAddress(page, await remixAddress(db.shippingAddress));
        await click(page, "foxy-address >>> [data-e2e=toggle]");

        await shouldRenderAddress(page, db.shippingAddress);
      });
    });

    it("allows editing and saving", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-address endpoint="${url}" type="default_shipping_address"></foxy-address>`;
        const newAddress = await remixAddress(db.shippingAddress);

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await click(page, "foxy-address >>> [data-e2e=toggle]");
        await enterAddress(page, newAddress);
        await click(page, "foxy-address >>> [data-e2e=save]");

        await shouldRenderAddress(page, newAddress);
        shouldMatch(db.shippingAddress, newAddress);
      });
    });
  });

  describe("authorized: loads data from window.FC", () => {
    it("loads immediately when it's available", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `
          <script>window.FC = JSON.parse(\`${JSON.stringify(FC)}\`)</script>
          <foxy-address endpoint="${url}"></foxy-address>
        `;

        db.billingAddress.country = "US";
        db.billingAddress.region = "TX";

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();
        await click(page, "foxy-address >>> [data-e2e=toggle]");

        const country = await page.find("foxy-address >>> [data-e2e=country]");
        const region = await page.find("foxy-address >>> [data-e2e=region]");

        expect(await country.getProperty("items")).toEqual([
          { value: "US", label: "United States" }
        ]);

        expect(await region.getProperty("items")).toEqual([
          { value: "TX", label: "Texas" }
        ]);
      });
    });

    it("loads whenever it becomes available later if not present immediately", async () => {
      await interceptAPIRequests(async ({ signIn, page, url, db }) => {
        const html = `<foxy-address endpoint="${url}"></foxy-address>`;

        db.billingAddress.country = "US";
        db.billingAddress.region = "TX";

        await signIn();
        await page.setContent(html);
        await page.waitForChanges();

        await page.waitFor(3000);
        await page.evaluate((fcMock: any) => {
          const onLoad = window.FC?.onLoad;
          window.FC = fcMock;
          if (Boolean(onLoad)) onLoad();
        }, FC);

        await click(page, "foxy-address >>> [data-e2e=toggle]");

        const country = await page.find("foxy-address >>> [data-e2e=country]");
        const region = await page.find("foxy-address >>> [data-e2e=region]");

        expect(await country.getProperty("items")).toEqual([
          { value: "US", label: "United States" }
        ]);

        expect(await region.getProperty("items")).toEqual([
          { value: "TX", label: "Texas" }
        ]);
      });
    });
  });
});

jsf.extend("faker", () => faker);
jsf.option("useExamplesValue", true);

const fields = [
  "first_name",
  "last_name",
  "company",
  "phone",
  "address1",
  "address2",
  "city",
  "postal_code"
];

async function remixAddress(oldAddress: Address) {
  const cwd = path.resolve(__dirname, "../../schema/");
  const newAddress = (await jsf.resolve(AddressSchema, cwd)) as Address;

  for (const key in newAddress) {
    if (fields.includes(key)) continue;
    newAddress[key] = oldAddress[key];
  }

  return newAddress;
}

async function enterAddress(page: E2EPage, address: Address) {
  for (const label of fields) {
    const field = await page.find(`foxy-address >>> [data-e2e=${label}]`);
    await replaceText(page, field, address[label]);
  }

  await page.waitForChanges();
}

async function shouldRenderAddress(page: E2EPage, address: Address) {
  const lblPhone = await page.find("foxy-address >>> [data-e2e=lbl-phone]");

  expect(lblPhone).toEqualText(address.phone);

  const lblName = await page.find("foxy-address >>> [data-e2e=lbl-name]");

  expect(lblName.textContent.includes(address.first_name)).toBe(true);
  expect(lblName.textContent.includes(address.last_name)).toBe(true);

  const lblAddress = await page.find("foxy-address >>> [data-e2e=lbl-address]");

  expect(lblAddress.textContent.includes(address.postal_code)).toBe(true);
  expect(lblAddress.textContent.includes(address.address1)).toBe(true);
  expect(lblAddress.textContent.includes(address.city)).toBe(true);

  for (const label of fields) {
    const selector = `foxy-address >>> [data-e2e=${label}]`;
    const field = await page.find(selector);
    const value = await field.getProperty("value");

    expect(value).toEqualText(address[label]);
  }
}

async function shouldRenderEmptyState(page: E2EPage) {
  const whenSkeletonsFound = Promise.all([
    page.find("foxy-address >>> [data-e2e=lbl-name] [data-e2e=skeleton]"),
    page.find("foxy-address >>> [data-e2e=lbl-phone] [data-e2e=skeleton]"),
    page.find("foxy-address >>> [data-e2e=lbl-address] [data-e2e=skeleton]")
  ]);

  const whenFieldsFound = Promise.all([
    page.find("foxy-address >>> [data-e2e=first_name]"),
    page.find("foxy-address >>> [data-e2e=last_name]"),
    page.find("foxy-address >>> [data-e2e=address1]"),
    page.find("foxy-address >>> [data-e2e=address2]"),
    page.find("foxy-address >>> [data-e2e=company]"),
    page.find("foxy-address >>> [data-e2e=phone]"),
    page.find("foxy-address >>> [data-e2e=city]"),
    page.find("foxy-address >>> [data-e2e=postal_code]")
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
}

function shouldMatch(address1: Address, address2: Address) {
  fields.forEach(v => expect(address1[v]).toEqual(address2[v]));
}
