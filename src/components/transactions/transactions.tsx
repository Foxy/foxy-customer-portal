import deepmerge from "deepmerge";

import {
  EventEmitter,
  Component,
  Element,
  Prop,
  State,
  Method,
  Event,
  Watch,
  h
} from "@stencil/core";

import { FullGetResponse, GetResponse, get as getCustomer } from "../../api";

import * as vaadin from "../../mixins/vaadin";
import * as store from "../../mixins/store";
import * as i18n from "../../mixins/i18n";
import { i18nProvider } from "./i18n";

import { getParentPortal } from "../../assets/utils/getParentPortal";
import { get as getTransactions } from "../../api/transactions";
import { TransactionDataTable } from "../DataTable";
import { Messages } from "./types";
import { ErrorOverlay } from "../ErrorOverlay";
import { APIError } from "../../api/utils";
import { Skeleton } from "../Skeleton";
import { LinkButton } from "../LinkButton";

type StoreMixin = store.Mixin<
  GetResponse<{
    zoom: { transactions: { items: true } };
  }>
>;

/**
 * @part id - Targets each cell in the ID column.
 * @part date - Targets each cell in the Date column.
 * @part total - Targets each cell in the Total column.
 * @part receipt - Targets each cell in the Recept column.
 */
@Component({
  tag: "foxy-transactions",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class Transactions
  implements vaadin.Mixin, StoreMixin, i18n.Mixin<typeof i18nProvider> {
  private readonly limit = 4;

  @State() state = store.defaults.state.call(this);
  @State() i18nProvider = i18nProvider;
  @State() i18n: Messages | null = null;

  @State() error = "";
  @State() hasMore = true;
  @State() isLoadingNext = false;
  @State() isErrorDismissable = false;
  @State() start = 0;

  @Element() readonly root: HTMLFoxyTransactionsElement;

  /** Foxy Customer Portal API endpoint. */
  @Prop() endpoint = "";

  /** The language to display element content in. */
  @Prop() locale = i18n.defaults.locale.call(this);

  @Watch("locale")
  onLocaleChange(newValue: string) {
    i18n.onLocaleChange.call(this, newValue);
  }

  /** The number of columns in the table (affects the number of slots). */
  @Prop() cols = 4;

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

  componentWillLoad() {
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
   * the `_embedded["fx:transactions"]` array with downloaded transactions.
   */
  @Method()
  async getRemoteState() {
    const params = {
      zoom: { transactions: { items: true } }
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
   * the `_embedded["fx:transactions"]` array with downloaded transactions.
   */
  @Method()
  async getState(forceReload = false) {
    return store.getState.call(this, forceReload);
  }

  /** Sets customer object. */
  @Method()
  async setState(value: Partial<FullGetResponse>) {
    store.setState.call(this, value);

    if (this.error.length > 0 && this.state.id !== -1) {
      this.isErrorDismissable = true;
    }

    if (this.state._embedded["fx:transactions"].length < this.limit) {
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
    const total = this.state._embedded["fx:transactions"].length;
    let loadedCount = this.start + this.limit * 2;

    if (direction === "forward" && loadedCount > total) {
      this.isLoadingNext = true;

      try {
        const newState = deepmerge({}, this.state) as any;
        const endpoint = `${this.resolvedEndpoint}/transactions`;
        const res = await getTransactions(endpoint, {
          offset: total,
          limit: this.limit - (total % this.limit),
          zoom: { items: true }
        });

        newState._embedded["fx:transactions"].push(
          ...res._embedded["fx:transactions"]
        );

        await this.setState(newState);
        loadedCount = newState._embedded["fx:transactions"].length;

        if (this.start + this.limit < loadedCount) this.start += this.limit;
        this.hasMore = loadedCount < res.total_items;
        this.isLoadingNext = false;
      } catch (e) {
        console.error(e);

        const localMessage = this.i18n?.error || this.i18nProvider.en.error;

        this.error = e instanceof APIError ? e.message : localMessage;
        this.isErrorDismissable = true;
      }
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

  render() {
    return (
      <TransactionDataTable
        cols={this.cols}
        start={this.start}
        limit={this.limit}
        items={this.state._embedded["fx:transactions"]}
        hasMore={this.hasMore}
        messages={this.i18n}
        isLoadingNext={this.isLoadingNext}
        navigate={this.navigate.bind(this)}
        headers={[
          () => this.i18n.id,
          () => this.i18n.date,
          () => this.i18n.total,
          () => this.i18n.receipt
        ]}
        cells={[
          item => (
            <div class="flex items-center font-tnum text-s sm:text-m" part="id">
              <div class="text-contrast-50 mr-s sm:hidden">
                <Skeleton
                  loaded={Boolean(this.i18n)}
                  text={() => this.i18n.id}
                />
              </div>
              {item.id}
            </div>
          ),
          item => (
            <div
              class="flex items-center font-tnum text-s sm:text-m"
              part="date"
            >
              <div class="text-contrast-50 mr-s sm:hidden">
                <Skeleton
                  loaded={Boolean(this.i18n)}
                  text={() => this.i18n.date}
                />
              </div>
              {new Date(item.transaction_date).toLocaleDateString(this.locale, {
                year: "numeric",
                month: "short",
                day: "2-digit"
              })}
            </div>
          ),
          item => (
            <div
              class="font-tnum select-none text-xxl font-thin sm:font-normal sm:text-m"
              part="total"
            >
              {item.total_order.toLocaleString(this.locale, {
                style: "currency",
                currency: item.currency_code
              })}
            </div>
          ),
          item => (
            <div class="-mx-s" part="receipt">
              <LinkButton
                target="_blank"
                href={item._links["fx:receipt"].href}
                loaded={Boolean(this.i18n)}
                text={() => this.i18n.receiptLink}
                icon="receipt"
              />
            </div>
          )
        ]}
      >
        <div hidden={this.error.length === 0}>
          <ErrorOverlay
            text={this.error}
            action={this.isErrorDismissable ? this.i18n.close : undefined}
            onAction={() => (this.error = "")}
          />
        </div>
      </TransactionDataTable>
    );
  }
}
