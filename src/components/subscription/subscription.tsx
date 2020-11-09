import { Method, Element, Component, EventEmitter } from "@stencil/core";
import { h, Prop, Watch, Event, State } from "@stencil/core";

import { GetResponse, FullGetResponse } from "../../api";
import { patch as updateSubscription } from "../../api/subscriptions";
import { get as getCustomer } from "../../api";
import { APIError } from "../../api/utils";

import * as vaadin from "../../mixins/vaadin";
import * as store from "../../mixins/store";
import * as i18n from "../../mixins/i18n";

import { Link } from "../Link";
import { Summary } from "./partials/Summary";
import { CartItem } from "./partials/CartItem";
import { Transactions } from "./partials/Transactions";
import { BillingDetails } from "./partials/BillingDetails";
import { PaymentMethod } from "./partials/PaymentMethod";
import { NextDatePicker } from "./partials/NextDatePicker";
import { FrequencyPicker } from "./partials/FrequencyPicker";

import { getParentPortal } from "../../assets/utils/getParentPortal";
import { ErrorOverlay } from "../ErrorOverlay";
import { getCancelUrl } from "./utils";
import { i18nProvider } from "./i18n";

type StoreMixin = store.Mixin<
  GetResponse<{
    zoom: {
      subscriptions: { transactions: true };
      default_payment_method: true;
    };
  }>
>;

type Mixins = vaadin.Mixin & StoreMixin & i18n.Mixin<typeof i18nProvider>;

@Component({
  tag: "foxy-subscription",
  styleUrl: "../../tailwind.css",
  assetsDirs: ["assets"],
  shadow: true
})
export class Subscription implements Mixins {
  private _nextDateConfirm: VaadinDialog;
  private _nextDateErrorAlert: VaadinNotification;
  private _nextDateSuccessAlert: VaadinNotification;

  private _frequencyConfirm: VaadinDialog;
  private _frequencyErrorAlert: VaadinNotification;
  private _frequencySuccessAlert: VaadinNotification;

  @Element() readonly root: HTMLFoxySubscriptionElement;

  @State() newNextDate?: string;
  @State() newFrequency?: string;

  @State() state = store.defaults.state.call(this) as FullGetResponse;
  @State() i18nProvider = i18nProvider;
  @State() i18n = i18nProvider.en;

  @State() error = "";
  @State() isErrorDismissable = false;

  @State() busy = false;
  @State() open = false;

  /** Subscription URL (value of `(fx:subscription)._links.self.href`). */
  @Prop() link = "";

  /** Foxy Customer Portal API endpoint. */
  @Prop() endpoint = "";

  /**
   * List of additional slots to generate for each transaction
   * in the transactions display. Each entry will create a table cell slot
   * named `transaction-${id}-${entry}` and a corresponding table header
   * slot named `transactions-${entry}`. Accepts array of strings (`["foo", "bar"]`)
   * or a serialized list of values separated by a comma (`"foo,bar"`).
   * Items order is respected.
   */
  @Prop() transactionSlots = [] as string | string[];

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

  componentWillLoad() {
    i18n.componentWillLoad.call(this);
  }

  componentDidRender() {
    vaadin.componentDidRender.call(this);
  }

  async componentDidLoad() {
    await store.componentDidLoad.call(this);
    this.ready.emit();
  }

  /**
   * Resolves with a customer object that's guaranteed to contain
   * the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
   */
  @Method()
  async getRemoteState() {
    const params = {
      zoom: {
        subscriptions: { transactions: true },
        default_payment_method: true
      } as const
    };

    let customer: GetResponse<typeof params> | null = null;

    try {
      customer = await getCustomer(this._resolvedEndpoint, params);
    } catch (e) {
      console.error(e);
      this.error = e instanceof APIError ? e.message : this.i18n.error;
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

    if (this.error.length > 0 && this.state.id !== -1) {
      this.isErrorDismissable = true;
    }
  }

  /** Sets next transaction date. */
  @Method()
  async setNextTransactionDate(newValue: string | Date) {
    const normalizedNewValue = new Date(newValue).toISOString();
    const oldValue = this._subscription.next_transaction_date;

    if (normalizedNewValue !== oldValue) {
      this._subscription.next_transaction_date = normalizedNewValue;
      this.busy = true;

      try {
        await updateSubscription(this._subscription._links.self.href, {
          next_transaction_date: normalizedNewValue
        });

        await this.setState({ ...this.state });
        this.update.emit(this.state);
        this._nextDateSuccessAlert?.open();
      } catch (e) {
        console.error(e);

        this._subscription.next_transaction_date = oldValue;
        this._nextDateErrorAlert?.open();
      } finally {
        this.busy = false;
      }
    }

    this.newNextDate = undefined;
  }

  /** Sets frequency. */
  @Method()
  async setFrequency(newValue: string) {
    const oldValue = this._subscription.frequency;

    if (newValue !== oldValue) {
      this._subscription.frequency = newValue;
      this.busy = true;

      try {
        await updateSubscription(this._subscription._links.self.href, {
          frequency: newValue
        });

        await this.setState({ ...this.state });
        this.update.emit(this.state);
        this._frequencySuccessAlert?.open();
      } catch (e) {
        console.error(e);

        this._subscription.frequency = oldValue;
        this._frequencyErrorAlert?.open();
      } finally {
        this.busy = false;
      }
    }

    this.newFrequency = undefined;
  }

  private get _subscription() {
    const subscriptions = this.state?._embedded["fx:subscriptions"];
    if (!Boolean(subscriptions)) return;
    if (this.link === "") return subscriptions[0];
    return subscriptions.find(v => v._links.self.href === this.link);
  }

  private get _template() {
    return this._subscription._embedded["fx:transaction_template"];
  }

  private get _frequencies() {
    const config = this._subscription?._embedded.template_config;
    const value = config.allow_frequency_modification;
    return value && value.length > 0 ? value : [];
  }

  private get _transactions() {
    return this._subscription._embedded["fx:transactions"].sort((a, b) => {
      return (
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime()
      );
    });
  }

  private get _normalizedTransactionSlots() {
    if (typeof this.transactionSlots === "string") {
      return this.transactionSlots.split(",");
    } else {
      return this.transactionSlots;
    }
  }

  private get _resolvedEndpoint() {
    let path = "/s/customer";
    if (this.endpoint.length > 0) return this.endpoint + path;

    const portal = getParentPortal(this.root);
    return portal === null ? path : portal.endpoint + path;
  }

  private get _isNextDateEditable() {
    return this._subscription?._embedded.template_config
      .allow_next_date_modification;
  }

  render() {
    return (
      <details
        class="relative bg-base font-lumo overflow-hidden leading-s"
        onToggle={() => (this.open = !this.open)}
      >
        {this.error && (
          <ErrorOverlay
            text={this.error}
            action={this.isErrorDismissable ? this.i18n.close : undefined}
            onAction={() => (this.error = "")}
          />
        )}

        <Summary
          i18n={this.i18n}
          open={this.open}
          subscription={this._subscription}
        />

        {this._subscription && [
          <div class="separator hidden bg-contrast-10 ml-auto md:block" />,

          <slot />,

          <div class="z-10 h-80px md:absolute md:w-320px md:top-0 md:right-0">
            <PaymentMethod
              i18n={this.i18n}
              paymentMethod={this.state._embedded["fx:default_payment_method"]}
              subscription={this._subscription}
            />
          </div>,

          <div class="md:flex">
            <div class="px-m relative -mt-s flex-shrink-0 md:hidden">
              <BillingDetails
                i18n={this.i18n}
                subscription={this._subscription}
              />
            </div>

            <div class="w-full flex-shrink md:overflow-auto md:py-s">
              <Transactions
                i18n={this.i18n}
                items={this._transactions}
                slots={this._normalizedTransactionSlots}
                template={this._template}
                subscription={this._subscription}
              />
            </div>

            <div class="flex-shrink-0 md:pt-l md:w-320px">
              <div class="hidden md:block md:m-m" aria-hidden="true">
                <BillingDetails
                  i18n={this.i18n}
                  subscription={this._subscription}
                />
              </div>

              <section>
                <div class="flex items-center justify-between px-m mb-xs">
                  <h1 class="text-s text-secondary">
                    {this.i18n.items(
                      this._template._embedded["fx:items"].length
                    )}
                  </h1>

                  <Link
                    size="s"
                    href="/todo"
                    text={this.i18n.editItems}
                    color="primary"
                  />
                </div>

                {this._template._embedded["fx:items"].map(item => (
                  <CartItem
                    i18n={this.i18n}
                    template={this._template}
                    item={item}
                  />
                ))}
              </section>

              <div class="px-m">
                {this._isNextDateEditable && (
                  <NextDatePicker
                    errorRef={e => (this._nextDateErrorAlert = e)}
                    successRef={e => (this._nextDateSuccessAlert = e)}
                    confirmRef={e => (this._nextDateConfirm = e)}
                    disabled={!this._subscription.is_active || this.busy}
                    newValue={this.newNextDate}
                    value={this._subscription.next_transaction_date}
                    i18n={this.i18n}
                    onChange={e => this.setNextTransactionDate(e)}
                    onChangeRequest={e => {
                      this.newNextDate = e;
                      this._nextDateConfirm.opened = true;
                    }}
                  />
                )}

                {this._frequencies.length > 1 && (
                  <FrequencyPicker
                    errorRef={e => (this._frequencyErrorAlert = e)}
                    successRef={e => (this._frequencySuccessAlert = e)}
                    confirmRef={e => (this._frequencyConfirm = e)}
                    disabled={!this._subscription.is_active || this.busy}
                    options={this._frequencies}
                    newValue={this.newFrequency}
                    value={this._subscription.frequency}
                    i18n={this.i18n}
                    onChange={v => this.setFrequency(v)}
                    onChangeRequest={v => {
                      this.newFrequency = v;
                      this._frequencyConfirm.opened = true;
                    }}
                  />
                )}

                <slot name="actions" />
              </div>

              {this._subscription.is_active && (
                <div class="px-m pb-m pt-m -mt-xs text-right">
                  <slot name="action-cancel">
                    <Link
                      href={getCancelUrl(this._subscription)}
                      text={this.i18n.cancelSubscription}
                      size="s"
                      color="secondary"
                    />
                  </slot>
                </div>
              )}
            </div>
          </div>
        ]}
      </details>
    );
  }
}
