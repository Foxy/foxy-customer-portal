import deepmerge from "deepmerge";

import * as i18n from "../../mixins/i18n";
import * as store from "../../mixins/store";
import * as vaadin from "../../mixins/vaadin";

import { Component, Element, Method, Prop, State } from "@stencil/core";
import { Event, EventEmitter, Watch, h } from "@stencil/core";
import { FullGetResponse, GetResponse } from "../../api";

import { APIError } from "../../api/utils";
import { ErrorOverlay } from "../ErrorOverlay";
import { get as getCustomer } from "../../api";
import { getParentPortal } from "../../assets/utils/getParentPortal";
import { get as getSubscriptions } from "../../api/subscriptions";
import { i18nProvider } from "./i18n";

type StoreMixin = store.Mixin<
  GetResponse<{
    zoom: {
      subscriptions: { transactions: true };
    };
  }>
>;

@Component({
  tag: "foxy-subscriptions",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class Subscriptions
  implements vaadin.Mixin, StoreMixin, i18n.Mixin<typeof i18nProvider> {
  private readonly limit = 4;

  @State() state = store.defaults.state.call(this) as FullGetResponse;
  @State() i18nProvider = i18nProvider;
  @State() i18n = i18nProvider.en;

  @State() error = "";
  @State() isErrorDismissable = false;

  @State() start = 0;
  @State() hasMore = true;
  @State() isLoadingNext = false;

  @State() openItems = [];

  @State() confirmText = "";
  @State() toastTheme = "error" as "success" | "error";
  @State() toastText = "";

  @Element() readonly root: HTMLFoxySubscriptionsElement;

  /** Foxy Customer Portal API endpoint. */
  @Prop() endpoint = "";

  /** The language to display element content in. */
  @Prop() locale = i18n.defaults.locale.call(this);

  @Watch("locale")
  onLocaleChange(newValue: string) {
    i18n.onLocaleChange.call(this, newValue);
  }

  /**
   * Emitted after the component makes changes to the
   * state, containing the changed data in its payload.
   */
  @Event({
    eventName: "update",
    composed: true,
    bubbles: true
  })
  readonly update: EventEmitter<FullGetResponse>;

  /** Fired when component becomes ready to be interacted with. */
  @Event({
    eventName: "ready",
    composed: true,
    bubbles: true
  })
  readonly ready: EventEmitter<void>;

  async componentWillLoad() {
    i18n.componentWillLoad.call(this);
  }

  async componentDidLoad() {
    await store.componentDidLoad.call(this);
    this.ready.emit();
  }

  componentDidRender() {
    vaadin.componentDidRender.call(this);
  }

  /**
   * Resolves with a customer object that's guaranteed to contain
   * the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
   */
  @Method()
  async getRemoteState() {
    const params = {
      zoom: { subscriptions: { transactions: true } }
    };

    let customer: GetResponse<typeof params> | null = null;

    try {
      customer = await getCustomer(this.resolvedEndpoint, params);
    } catch (e) {
      console.error(e);
      const localMessage = this.i18n?.error || this.i18nProvider.en.error;
      this.error = e instanceof APIError ? e.message : localMessage;
      this.isErrorDismissable = this.state.id !== -1;
    }

    return customer;
  }

  /**
   * Resolves with a customer object that's guaranteed to contain
   * the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
   */
  @Method()
  async getState(forceReload = false) {
    return store.getState.call(this, forceReload);
  }

  /** Sets customer object. */
  @Method()
  async setState(value: Partial<FullGetResponse>) {
    store.setState.call(this, value);

    const itemsLength = this.state._embedded["fx:subscriptions"].length;
    const newOpenItems = this.openItems.filter(index => index < itemsLength);

    if (itemsLength === 1 && !this.openItems.includes(0)) newOpenItems.push(0);
    this.openItems = newOpenItems;

    if (this.error.length > 0 && this.state.id !== -1) {
      this.isErrorDismissable = true;
    }

    if (itemsLength < this.limit) {
      this.hasMore = false;
      this.start = 0;
    } else {
      this.hasMore = true;
    }
  }

  private scrollIntoView() {
    if (this.root.getBoundingClientRect().top < 0) {
      this.root.scrollIntoView({ behavior: "smooth" });
    }
  }

  private async navigate(direction: "back" | "forward" = "forward") {
    const total = this.state._embedded["fx:subscriptions"].length;
    const newOffset = this.start + this.limit * 2;

    if (direction === "forward" && newOffset > total) {
      this.isLoadingNext = true;
      const newState = deepmerge({}, this.state);

      try {
        const endpoint = `${this.resolvedEndpoint}/subscriptions`;
        const res = await getSubscriptions(endpoint, {
          offset: total,
          limit: this.limit - (total % this.limit)
        });

        newState._embedded["fx:subscriptions"].push(
          ...res._embedded["fx:subscriptions"]
        );

        this.start += res.returned_items > 0 ? this.limit : 0;
        this.hasMore = res.returned_items + res.offset < res.total_items;
        this.isLoadingNext = false;
      } catch (e) {
        console.error(e);

        const localMessage = this.i18n?.error || this.i18nProvider.en.error;
        this.error = e instanceof APIError ? e.message : localMessage;
        this.isErrorDismissable = true;
      }

      await this.setState(newState);
    } else {
      this.start += (direction === "back" ? -1 : 1) * this.limit;
    }

    this.scrollIntoView();
  }

  private get resolvedEndpoint() {
    let path = "/s/customer";
    if (this.endpoint.length > 0) return this.endpoint + path;

    const portal = getParentPortal(this.root);
    return portal === null ? path : portal.endpoint + path;
  }

  private get subscriptions() {
    return this.state._embedded["fx:subscriptions"];
  }

  private get displayedSubscriptions() {
    return this.subscriptions.slice(this.start, this.start + this.limit);
  }

  render() {
    return (
      <div class="flex flex-wrap justify-between leading-s font-lumo">
        {this.displayedSubscriptions.map((value, index) => [
          <div
            class={{
              "w-full bg-contrast-10": true,
              "h-1px": index !== 0
            }}
          />,
          <div class="w-full bg-base min-h-64px md:min-h-72px">
            <slot name={index.toString()}>
              <foxy-subscription
                endpoint={this.endpoint}
                locale={this.locale}
                link={value._links.self.href}
                open={this.openItems.includes(index)}
                onToggle={({ target }) => {
                  const isOpen = (target as HTMLFoxySubscriptionElement).open;
                  const newOpenItems = this.openItems.filter(v => v !== index);
                  if (isOpen) newOpenItems.push(index);
                  this.openItems = newOpenItems;
                }}
              />
            </slot>
          </div>
        ])}

        <vaadin-button
          class="m-m"
          data-e2e="btn-prev"
          disabled={this.start === 0 || this.isLoadingNext}
          onClick={() => this.navigate("back")}
        >
          <iron-icon icon="icons:chevron-left" slot="prefix" />
          {this.i18n.previous}
        </vaadin-button>

        <vaadin-button
          disabled={
            this.start + this.limit > this.subscriptions.length ||
            this.isLoadingNext ||
            this.hasMore === false
          }
          class="m-m"
          data-e2e="btn-next"
          data-theme={this.isLoadingNext ? "tertiary" : "secondary"}
          onClick={() => this.navigate("forward")}
        >
          {this.isLoadingNext ? (
            <vaadin-progress-bar class="w-xl" indeterminate />
          ) : (
            this.i18n.next
          )}
          <iron-icon icon="icons:chevron-right" slot="suffix" />
        </vaadin-button>

        <div hidden={this.error.length === 0}>
          <ErrorOverlay
            text={this.error}
            action={this.isErrorDismissable ? this.i18n.close : undefined}
            onAction={() => (this.error = "")}
          />
        </div>
      </div>
    );
  }
}
