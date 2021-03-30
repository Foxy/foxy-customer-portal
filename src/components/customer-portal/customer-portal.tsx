import * as i18n from "../../mixins/i18n";
import * as store from "../../mixins/store";
import * as vaadin from "../../mixins/vaadin";

import {
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Method,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";
import { FullGetResponse, get as getCustomer } from "../../api";
import { Messages, Tab } from "./types";
import {
  check as isSignedIn,
  reset as resetAuthCookie
} from "../../api/authenticate";

import { APIError } from "../../api/utils";
import { Details } from "../Details";
import { Skeleton } from "../Skeleton";
import { i18nProvider } from "./i18n";

/**
 * @part transaction-id - Targets each cell in the ID column of the nested `foxy-transactions` element.
 * @part transaction-date - Targets each cell in the Date column of the nested `foxy-transactions` element.
 * @part transaction-total - Targets each cell in the Total column of the nested `foxy-transactions` element.
 * @part transaction-receipt - Targets each cell in the Recept column of the nested `foxy-transactions` element.
 */
@Component({
  tag: "foxy-customer-portal",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class CustomerPortal
  implements
    vaadin.Mixin,
    store.Mixin<FullGetResponse>,
    i18n.Mixin<typeof i18nProvider> {
  private defaultPathAlias: string | null = null;

  @State() state = store.defaults.state.call(this);
  @State() i18n: Messages | null = null;
  @State() i18nProvider = i18nProvider;

  @State() areTransactionsOpen = true;
  @State() areSubscriptionsOpen = true;
  @State() areDownloadsOpen = false;
  @State() isSignedIn = isSignedIn();
  @State() tabIndex = 0;

  /** Foxy Customer Portal API endpoint. */
  @Prop() endpoint = "";

  /** The language to display element content in. */
  @Prop() locale = i18n.defaults.locale.call(this);

  /** Enables hash-based routing. */
  @Prop() router = false;

  /** Prefix for routes and other top-level identifiers. */
  @Prop() scope = "foxy-customer-portal";

  /**
   * List of links to add to the top nav. You can either use Markdown
   * (`[Foo](https://example.com/foo) [Bar](https://example.com/bar)`)
   * to avoid writing extra JS or assign this property an array where each item
   * is an object with properties `href` for URL and `text` for the display text (both string).
   *
   * To enable slot generation and routing, use the following URI scheme: `portal://tab-name`.
   * This will create a slot for your tab content that will be displayed only when the
   * appropriate tab link is clicked (works with hash-based routing too).
   */
  @Prop() tabs: string | Tab[] = [];

  @Watch("locale")
  onLocaleChange(newValue: string) {
    i18n.onLocaleChange.call(this, newValue);
  }

  @Element() readonly root: HTMLFoxyCustomerPortalElement;

  /** Fired after the user signs in. */
  @Event({
    eventName: "signin",
    composed: true,
    bubbles: true
  })
  readonly signin: EventEmitter<void>;

  /** Fired after each update of the customer object (the state). */
  @Event({
    eventName: "update",
    composed: true,
    bubbles: true
  })
  readonly update: EventEmitter<FullGetResponse>;

  /** Fired after the user signs out. */
  @Event({
    eventName: "signout",
    composed: true,
    bubbles: true
  })
  readonly signout: EventEmitter<void>;

  /** Fired when component becomes ready to be interacted with. */
  @Event({
    eventName: "ready",
    composed: true,
    bubbles: true
  })
  readonly ready: EventEmitter<void>;

  componentWillLoad() {
    this.initRouter();
    this.handleHashChange();
    i18n.componentWillLoad.call(this);
  }

  async componentDidLoad() {
    await store.componentDidLoad.call(this);
    this.ready.emit();
  }

  componentDidRender() {
    vaadin.componentDidRender.call(this);
  }

  @Listen("update")
  handleUpdate(e: CustomEvent<store.Mixin<FullGetResponse>["update"]>) {
    store.setState.call(this, e.detail);
  }

  @Listen("signin")
  async handleSignIn() {
    this.isSignedIn = true;
    await this.getState(true);
  }

  @Listen("signout")
  async handleSignOut() {
    this.isSignedIn = false;
    await this.setState(store.defaults.state.call(this));
  }

  @Listen("hashchange", { target: "window" })
  handleHashChange() {
    if (this.router) {
      if (location.hash === this.defaultPathAlias) {
        this.tabIndex = 0;
      } else {
        const path = this.parseHash(location.hash);
        const index = this.extendedTabs.findIndex(tab => {
          return tab.isPortalLink && tab.path === path;
        });

        if (index !== -1) this.tabIndex = index;
      }
    }
  }

  /** Resolves with a customer object (the state). */
  @Method()
  async getRemoteState() {
    let customer: FullGetResponse | null = null;

    try {
      customer = await getCustomer(`${this.endpoint}/s/customer`, {
        sso: true,
        zoom: {
          default_billing_address: true,
          default_shipping_address: true,
          default_payment_method: true,
          subscriptions: { transactions: true },
          transactions: { items: true }
        }
      });
    } catch (e) {
      if (e instanceof APIError && String(e.code) === "401") {
        await this.signOut();
      } else {
        console.error(e);
      }
    }

    return customer;
  }

  /** Resolves with a customer object (the state). */
  @Method()
  async getState(forceReload = false) {
    return store.getState.call(this, forceReload);
  }

  /** Updates the customer object, or the state. */
  @Method()
  async setState(value: Partial<FullGetResponse>) {
    store.setState.call(this, value);
  }

  private initRouter() {
    if (this.router) {
      const path = this.parseHash(location.hash);
      const index = this.extendedTabs.findIndex(tab => {
        return tab.isPortalLink && tab.path === path;
      });

      if (index === -1) this.defaultPathAlias = location.hash;
    }
  }

  private createHash(path: string) {
    return this.scope === "" ? `#${path}` : `#${this.scope}--${path}`;
  }

  private parseHash(hash: string) {
    if (hash[0] === "#") hash = hash.replace("#", "");

    const scope = `${this.scope}--`;
    if (hash.substr(0, scope.length) === scope) hash = hash.replace(scope, "");

    return hash;
  }

  private async signOut() {
    resetAuthCookie();
    this.isSignedIn = false;
    await this.setState(store.defaults.state.call(this));
    this.signout.emit();
  }

  private get defaultTabs() {
    return [
      {
        href: "portal://activity",
        text: this.i18n?.activity ?? ""
      },
      {
        href: "portal://account",
        text: this.i18n?.account ?? ""
      }
    ];
  }

  private get extendedTabs() {
    const tabs = this.defaultTabs;

    if (typeof this.tabs === "string") {
      const mdLink = /(?:__|[*#])|\[(.+?)]\((.+?)\)/gm;
      let match: RegExpMatchArray | null = null;

      while ((match = mdLink.exec(this.tabs)) !== null) {
        if (match.index === mdLink.lastIndex) mdLink.lastIndex++;
        const [, text, href] = match;
        tabs.push({ href, text });
      }
    } else {
      tabs.push(...this.tabs);
    }

    return tabs.map(v => {
      const isPortalLink = v.href.startsWith("portal://");
      const text = v.text;
      const path = isPortalLink ? v.href.replace("portal://", "") : v.href;
      const href = this.router && isPortalLink ? this.createHash(path) : v.href;

      return { isPortalLink, text, path, href };
    });
  }

  render() {
    return (
      <article class="font-lumo leading-s">
        <header
          hidden={!this.isSignedIn}
          class="pt-xl pb-s flex flex-wrap sm:py-l sm:flex-no-wrap"
        >
          <h1 class="text-header text-xxl px-m text-center flex-1 sm:flex sm:items-center sm:text-left">
            <Skeleton
              loaded={this.i18n && this.state.id !== -1}
              text={() => this.i18n.greeting(this.state.first_name)}
            />
          </h1>

          <nav role="navigation" class="w-full sm:w-auto">
            <vaadin-tabs selected={this.tabIndex} data-theme="minimal centered">
              {this.extendedTabs.map((tab, index) => (
                <vaadin-tab
                  class="p-0"
                  data-e2e={`lnk-${tab.path}`}
                  onClick={() => !this.router && (this.tabIndex = index)}
                >
                  <a
                    tabIndex={-1}
                    target={tab.isPortalLink ? "_self" : "_blank"}
                    class="m-0"
                    href={this.router ? tab.href : undefined}
                    rel="nofollow noopener noreferrer"
                  >
                    {tab.text}
                  </a>
                </vaadin-tab>
              ))}

              <vaadin-tab
                data-e2e="btn-sign-out"
                onClick={() => this.signOut()}
              >
                <Skeleton
                  loaded={Boolean(this.i18n)}
                  text={() => this.i18n.logout}
                />
              </vaadin-tab>
            </vaadin-tabs>
          </nav>
        </header>

        <slot />

        <section hidden={this.isSignedIn}>
          <slot name="sign-in">
            <foxy-sign-in locale={this.locale} endpoint={this.endpoint} />
          </slot>
        </section>

        {this.extendedTabs.map((tab, index) => {
          if (!tab.isPortalLink) return;

          return (
            <section hidden={!this.isSignedIn || this.tabIndex !== index}>
              <slot name={tab.path}>
                {index === 0 && [
                  <div class="mb-s sm:mb-m">
                    <slot name="subscriptions-container">
                      <Details
                        open={this.areSubscriptionsOpen}
                        summary={() => this.i18n.subscriptions}
                        loaded={this.i18n && this.state.id !== -1}
                        onToggle={v => (this.areSubscriptionsOpen = v)}
                      >
                        <slot name="subscriptions">
                          <foxy-subscriptions
                            locale={this.locale}
                            endpoint={this.endpoint}
                          />
                        </slot>
                      </Details>
                    </slot>
                  </div>,

                  <div class="mb-s sm:mb-m">
                    <slot name="transactions-container">
                      <Details
                        open={this.areTransactionsOpen}
                        summary={() => this.i18n.transactions}
                        loaded={this.i18n && this.state.id !== -1}
                        onToggle={v => (this.areTransactionsOpen = v)}
                      >
                        <slot name="transactions">
                          <foxy-transactions
                            locale={this.locale}
                            endpoint={this.endpoint}
                            exportparts="id:transaction-id,date:transaction-date,total:transaction-total,receipt:transaction-receipt"
                          />
                        </slot>
                      </Details>
                    </slot>
                  </div>,

                  <div class="mb-s sm:mb-m">
                    <slot name="downloadables-container">
                      {/* <Details
                        open={this.areDownloadsOpen}
                        summary={() => this.i18n.downloads}
                        loaded={this.i18n && this.state.id !== -1}
                        onToggle={v => (this.areDownloadsOpen = v)}
                      >
                        <slot name="downloadables">
                          <div class="p-m text-body">
                            <Skeleton
                              loaded={Boolean(this.i18n)}
                              text={() => this.i18n.comingSoon}
                            />
                          </div>
                        </slot>
                      </Details> */}
                    </slot>
                  </div>
                ]}

                {index === 1 && (
                  <div class="flex flex-wrap sm:-m-s">
                    <div class="w-full pb-s sm:w-1/2 sm:p-s">
                      <div class="bg-base sm:rounded-m sm:shadow-xs">
                        <slot name="billing-address">
                          <foxy-address
                            type="default_billing_address"
                            endpoint={this.endpoint}
                            locale={this.locale}
                          />
                        </slot>
                      </div>
                    </div>

                    <div class="w-full pb-s sm:w-1/2 sm:p-s">
                      <div class="bg-base sm:rounded-m sm:shadow-xs">
                        <slot name="shipping-address">
                          <foxy-address
                            type="default_shipping_address"
                            endpoint={this.endpoint}
                            locale={this.locale}
                          />
                        </slot>
                      </div>
                    </div>

                    <div class="w-full sm:w-1/2 sm:p-s">
                      <div class="bg-base sm:rounded-m sm:shadow-xs">
                        <slot name="profile">
                          <foxy-profile
                            endpoint={this.endpoint}
                            locale={this.locale}
                          />
                        </slot>
                      </div>
                    </div>
                  </div>
                )}
              </slot>
            </section>
          );
        })}
      </article>
    );
  }
}
