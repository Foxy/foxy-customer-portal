import { formatDate, getUpdateUrl } from "./utils";

import { Subscription } from "../../assets/types/Subscription";
import { click } from "../../assets/utils/click";
import { interceptAPIRequests } from "../../assets/utils/interceptAPIRequests";
import { messages } from "./i18n/en";
import { usePage } from "../../assets/utils/usePage";

const WEEK = 604800000;
const tag = "foxy-subscription";
const SUB_MODIFY_URL = "https://store.foxy.test/modify";

describe("HTMLFoxySubscriptionElement", () => {
  it("is collapsed by default", async () => {
    await usePage(async ({ page }) => {
      await page.setContent(`<${tag}></${tag}>`);
      await page.waitForEvent("ready");
      await page.waitForChanges();

      const details = await page.find(`${tag} >>> details`);
      const element = await page.find(tag);

      expect(details).not.toHaveAttribute("open");
      expect(element).not.toHaveAttribute("open");
    });
  });

  it("can be toggled via API", async () => {
    await usePage(async ({ page }) => {
      await page.setContent(`<${tag}></${tag}>`);
      await page.waitForEvent("ready");
      await page.waitForChanges();

      const details = await page.find(`${tag} >>> details`);
      const element = await page.find(tag);

      element.setAttribute("open", "open");
      await page.waitForChanges();

      expect(details).toHaveAttribute("open");
      expect(element).toHaveAttribute("open");

      element.removeAttribute("open");
      await page.waitForChanges();

      expect(details).not.toHaveAttribute("open");
      expect(element).not.toHaveAttribute("open");
    });
  });

  it("can be expanded via UI", async () => {
    await usePage(async ({ page }) => {
      await page.setContent(`<${tag}></${tag}>`);
      await page.waitForEvent("ready");
      await page.waitForChanges();

      const details = await page.find(`${tag} >>> details`);
      const element = await page.find(tag);

      details.click();
      await page.waitForChanges();

      expect(details).toHaveAttribute("open");
      expect(element).toHaveAttribute("open");

      details.click();
      await page.waitForChanges();

      expect(details).not.toHaveAttribute("open");
      expect(element).not.toHaveAttribute("open");
    });
  });

  const templates = [
    `<${tag}></${tag}>`,
    `<${tag} link="https://i.dont.exist.local"></${tag}>`,
    `<${tag} locale="ru"></${tag}>`,
    `<${tag} locale="fr"></${tag}>`,
    `<${tag} locale="cy"></${tag}>`,
    `<${tag} endpoint="https://i.dont.exist.local"></${tag}>`
  ];

  const descriptions = [
    "zero config",
    "custom link",
    "custom locale",
    "custom endpoint url"
  ];

  describe("logged out: displays empty state", () => {
    descriptions.forEach((testDescription, templateIndex) => {
      it(testDescription, async () => {
        await usePage(async ({ page }) => {
          await page.setContent(templates[templateIndex]);
          await page.waitForEvent("ready");
          await page.waitForChanges();

          const root = await page.find(`${tag} >>> details`);
          expect(root.innerText.trim()).toEqual("");
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

          const error = await page.find(`${tag} >>> [data-e2e=error]`);
          expect(error).not.toBeNull();
        });
      });
    });
  });

  describe("authorized: displays first subscription info by default", () => {
    it("displays subscription summary", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const subscription = db.subscriptions[0];
        const template = subscription._embedded["fx:transaction_template"];
        const products = template._embedded["fx:items"];
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;

        activateSubscription(subscription);

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const titleText = messages.summary(products);
        const subtitleText = messages.statusDescription(subscription);
        const frequency = messages.frequencyDescription(subscription.frequency);

        const price = messages.price(
          template.total_order,
          template.currency_code
        );

        const summary = await page.find(`${tag} >>> summary`);

        expect(summary.textContent.includes(titleText)).toBe(true);
        expect(summary.textContent.includes(subtitleText)).toBe(true);
        expect(summary.textContent.includes(frequency)).toBe(true);
        expect(summary.textContent.includes(price)).toBe(true);
      });
    });

    it("displays editable payment method info", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const subscription = db.subscriptions[0];
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;
        const ccNumber = db.paymentMethod.cc_number_masked;
        const last4Digits = ccNumber.substring(ccNumber.length - 4);
        const editLink = getUpdateUrl(db.subscriptions[0]);

        activateSubscription(subscription);

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const ccNumberEl = await page.find(`${tag} >>> [data-e2e=cc-number]`);
        const ccEditLink = await page.find(`${tag} >>> [data-e2e=cc-link]`);

        expect(ccNumberEl).toEqualText(last4Digits);
        expect(ccEditLink.getAttribute("href")).toBe(editLink);
      });
    });

    it("displays a list of products", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const subscription = db.subscriptions[0];
        const template = subscription._embedded["fx:transaction_template"];
        const products = template._embedded["fx:items"];
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;

        activateSubscription(subscription);

        await signIn();
        await Promise.all([
          page.waitForEvent("ready"),
          page.setContent(content)
        ]);

        const subModifySelector = `${tag} >>> a[href="${SUB_MODIFY_URL}"]`;
        const subModifyLink = await page.find(subModifySelector);
        const productEls = await page.findAll(`${tag} >>> [data-e2e=product]`);

        expect(subModifyLink).toBeNull();

        for (let i = 0; i < productEls.length; ++i) {
          const element = productEls[i];
          const product = products[i];

          const description = messages.productDescription(
            product.price,
            template.currency_code,
            product.quantity
          );

          expect(element.textContent.includes(product.name));
          expect(element.textContent.includes(description)).toBe(true);
        }
      });
    });

    it("displays edit link when active subscription has a modification link", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const subscription = db.subscriptions[0];
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;

        activateSubscription(subscription);
        enableSubModifyLink(subscription);

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const subModifySelector = `${tag} >>> a[href="${SUB_MODIFY_URL}"]`;
        const subModifyLink = await page.find(subModifySelector);

        expect(subModifyLink).not.toBeNull();
      });
    });

    it("displays a list of transactions", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;
        const subscription = db.subscriptions[0];

        const transactions = subscription._embedded["fx:transactions"].sort(
          (a, b) => {
            return (
              new Date(b.transaction_date).getTime() -
              new Date(a.transaction_date).getTime()
            );
          }
        );

        activateSubscription(subscription);

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const rows = await page.findAll(`${tag} >>> [data-e2e=transaction]`);
        const links = await page.findAll(`${tag} >>> [data-e2e=transaction] a`);

        for (let i = 0; i < rows.length; ++i) {
          const textContent = rows[i].textContent;
          const { total_order, currency_code } = transactions[i];
          const price = messages.price(total_order, currency_code);
          const date = messages.date(transactions[i].transaction_date);
          const id = String(transactions[i].display_id);

          expect(textContent.includes(price)).toBe(true);
          expect(textContent.includes(date)).toBe(true);
          expect(textContent.includes(id)).toBe(true);

          const receipt = transactions[i]._links["fx:receipt"].href;
          expect(links[i].getAttribute("href")).toEqualText(receipt);
        }
      });
    });

    it("allows changing next transaction date", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const subscription = db.subscriptions[0];
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;

        activateSubscription(subscription);
        enableNextDateModification(subscription);

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const picker = await page.find(`${tag} >>> [data-e2e=fld-date]`);
        const value: string = await picker.getProperty("value");
        const [year, month, day] = value.split("-").map(v => parseInt(v));

        const newDate = new Date(year, month - 1, day);
        newDate.setDate(newDate.getDate() + 7);
        const newValue = formatDate(newDate);

        await page.evaluate(
          (tag, newValue) => {
            const root = document.querySelector(tag);
            const picker = root.shadowRoot.querySelector("[data-e2e=fld-date]");
            picker.value = newValue;
            picker.dispatchEvent(new Event("change"));
          },
          tag,
          newValue
        );

        await page.waitForSelector("[data-e2e=btn-ok]");
        await page.waitFor(1000);
        await click(page, "[data-e2e=btn-ok]");
        await page.waitFor(1000);

        expect(await picker.getProperty("value")).toBe(newValue);
        expect(subscription.next_transaction_date).toBe(newDate.toISOString());
      });
    });

    it("allows changing frequency", async () => {
      await interceptAPIRequests(async ({ db, url, page, signIn }) => {
        const subscription = db.subscriptions[0];
        const template = subscription._embedded.template_config;
        const content = `<${tag} locale="en" endpoint="${url}"></${tag}>`;

        activateSubscription(subscription);
        enableFrequencyModification(subscription);

        await signIn();
        await page.setContent(content);
        await page.waitForEvent("ready");

        const select = await page.find(`${tag} >>> [data-e2e=fld-freq]`);
        const newValue = template.allow_frequency_modification[0];

        await page.evaluate(
          (tag, newValue) => {
            const root = document.querySelector(tag);
            const select = root.shadowRoot.querySelector("[data-e2e=fld-freq]");
            select.value = newValue;
            select.dispatchEvent(new Event("change"));
          },
          tag,
          newValue
        );

        await page.waitForSelector("[data-e2e=btn-ok]");
        await page.waitFor(1000);
        await click(page, "[data-e2e=btn-ok]");
        await page.waitFor(1000);

        expect(await select.getProperty("value")).toBe(newValue);
        expect(subscription.frequency).toBe(newValue);
      });
    });
  });
});

function activateSubscription(subscription: Subscription) {
  subscription.first_failed_transaction_date = null;
  subscription.is_active = true;
  subscription.past_due_amount = 0;
  subscription.error_message = "";
  subscription.next_transaction_date = new Date(
    Date.now() + WEEK
  ).toISOString();
}

function enableSubModifyLink(subscription: Subscription) {
  subscription._links["fx:sub_modification_url"] = {
    href: SUB_MODIFY_URL,
    title: "Modify this subscription"
  };
}

function enableNextDateModification(subscription: Subscription) {
  subscription._embedded.template_config.allow_next_date_modification = true;
}

function enableFrequencyModification(subscription: Subscription) {
  subscription._embedded.template_config.allow_frequency_modification = [
    "1y",
    "2w",
    "3d"
  ];
}
