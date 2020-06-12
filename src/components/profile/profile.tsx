import { getParentPortal } from "../../assets/utils/getParentPortal";

import {
  Component,
  Prop,
  State,
  Element,
  Method,
  Event,
  Watch,
  h,
  EventEmitter,
  getAssetPath
} from "@stencil/core";

import {
  FullGetResponse,
  GetRequest,
  get,
  GetResponse,
  patch
} from "../../api";

import * as vaadin from "../../mixins/vaadin";
import * as store from "../../mixins/store";
import * as i18n from "../../mixins/i18n";
import { i18nProvider } from "./i18n";

import { EditableCard } from "../EditableCard";
import { Messages } from "./types";
import { ErrorOverlay } from "../ErrorOverlay";
import { APIError } from "../../api/utils";
import { Skeleton } from "../Skeleton";
import { PaymentMethod } from "../../assets/types/PaymentMethod";
import { ConfirmDialog } from "../ConfirmDialog";

@Component({
  tag: "foxy-profile",
  styleUrl: "../../tailwind.css",
  assetsDir: "assets",
  shadow: true
})
export class Profile
  implements vaadin.Mixin, store.Mixin, i18n.Mixin<typeof i18nProvider> {
  private fields = {} as Record<
    "reset" | "submit" | "email" | "password_old" | "password",
    HTMLInputElement
  >;

  private removeCcDialog: VaadinDialog;

  @Element() readonly root: HTMLFoxyProfileElement;

  @State() state = store.defaults.state.call(this);
  @State() i18n: Messages | null = null;
  @State() i18nProvider = i18nProvider;

  @State() error = "";
  @State() isSaving = false;
  @State() isEditable = false;
  @State() isErrorDismissable = false;

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

    if (!this.isEditable) {
      this.fields.email.value = this.state.email;
    }
  }

  /**
   * Resolves with a fresh customer object that's guaranteed to contain the
   * essential user info such as email, name and id (non-embedded content).
   */
  @Method()
  async getRemoteState() {
    const params: GetRequest = {
      zoom: { default_payment_method: true }
    };

    let customer: GetResponse<typeof params> | null = null;

    try {
      customer = await get(this.resolvedEndpoint, params);
    } catch (e) {
      console.error(e);
      const localMessage = this.i18n?.error || this.i18nProvider.en.error;
      this.error = e instanceof APIError ? e.message : localMessage;
      this.isErrorDismissable = this.state.id !== -1;
    }

    return customer;
  }

  /**
   * Resolves with a customer object that's guaranteed to contain the
   * essential user info such as email, name and id (non-embedded content).
   */
  @Method()
  async getState(forceReload = false) {
    return store.getState.call(this, forceReload);
  }

  /** Sets customer object (the state). */
  @Method()
  async setState(value: Partial<FullGetResponse>) {
    await store.setState.call(this, value);

    if (this.error.length > 0 && this.state.id !== -1) {
      this.isErrorDismissable = true;
    }
  }

  /** Removes the default payment method if present. */
  @Method()
  async removeDefaultPaymentMethod() {
    this.isSaving = true;

    try {
      await patch(this.resolvedEndpoint, {
        _embedded: {
          "fx:default_payment_method": {
            save_cc: false
          }
        }
      });

      this.paymentMethod.cc_number_masked = "";
      this.paymentMethod.cc_exp_month = "";
      this.paymentMethod.cc_exp_year = "";
      this.paymentMethod.save_cc = false;

      await this.setState(this.state);
      this.update.emit();
    } catch (e) {
      console.error(e);
      const localMessage = this.i18n?.error || this.i18nProvider.en.error;
      this.error = e instanceof APIError ? e.message : localMessage;
      this.isErrorDismissable = true;
    }

    this.isSaving = false;
  }

  private get resolvedEndpoint() {
    let path = "/s/customer";
    if (this.endpoint.length > 0) return this.endpoint + path;

    const portal = getParentPortal(this.root);
    return portal === null ? path : portal.endpoint + path;
  }

  private get isContentAvailable() {
    return this.i18n !== null && this.state.id !== -1;
  }

  private get paymentMethod(): PaymentMethod | undefined {
    return this.state._embedded["fx:default_payment_method"];
  }

  private get ccLogo() {
    const type = this.paymentMethod.cc_type.toLowerCase();

    const supported = [
      "amex",
      "diners",
      "discover",
      "jcb",
      "maestro",
      "mastercard",
      "visa"
    ];

    return getAssetPath(
      `./assets/${supported.includes(type) ? type : "unknown"}.svg`
    );
  }

  private async save() {
    this.isSaving = true;

    try {
      await patch(this.resolvedEndpoint, {
        email: this.fields.email.value,
        password: this.fields.password.value || undefined,
        password_old: this.fields.password_old.value || undefined
      });
    } catch (e) {
      console.error(e);
      const localMessage = this.i18n?.error || this.i18nProvider.en.error;
      this.error = e instanceof APIError ? e.message : localMessage;
      this.isErrorDismissable = true;
    }

    const newState = {
      ...this.state,
      email: this.fields.email.value
    };

    await this.setState(newState);
    this.update.emit(this.state);

    this.fields.password.value = "";
    this.fields.password_old.value = "";

    this.isSaving = false;
    this.isEditable = false;
  }

  private toggle() {
    this.fields.email.value = this.state.email;
    this.fields.password.value = "";
    this.fields.password_old.value = "";
    this.isEditable = !this.isEditable;
  }

  render() {
    return (
      <EditableCard
        summary={() => this.i18n.title}
        loaded={this.isContentAvailable}
        saving={this.isSaving}
        editable={this.isEditable}
        onToggle={() => this.toggle()}
        onSave={() => this.save()}
      >
        <form
          class="px-m pb-m"
          hidden={!this.isEditable || !this.isContentAvailable}
          onSubmit={e => this.save() && e.preventDefault()}
        >
          <vaadin-email-field
            class="w-full"
            name="email"
            data-e2e="fld-email"
            ref={(el: HTMLInputElement) => (this.fields.email = el)}
            label={this.i18n === null ? "" : this.i18n.email}
            disabled={this.isSaving}
            autocomplete="email"
            required
          >
            <input slot="input" />
          </vaadin-email-field>

          <h3 class="mt-m mb-xs text-l text-header">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.changePasswordTitle}
            />
          </h3>

          <p class="text-s text-secondary">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.changePasswordHint}
            />
          </p>

          <vaadin-password-field
            class="w-full"
            name="password_old"
            data-e2e="fld-old-password"
            ref={(el: HTMLInputElement) => (this.fields.password_old = el)}
            label={this.i18n === null ? "" : this.i18n.oldPassword}
            disabled={this.isSaving}
            autocomplete="current-password"
          >
            <input slot="input" />
          </vaadin-password-field>

          <vaadin-password-field
            class="w-full"
            name="password"
            data-e2e="fld-new-password"
            ref={(el: HTMLInputElement) => (this.fields.password = el)}
            label={this.i18n === null ? "" : this.i18n.newPassword}
            disabled={this.isSaving}
            autocomplete="new-password"
          >
            <input slot="input" />
          </vaadin-password-field>

          <input
            ref={(el: HTMLInputElement) => (this.fields.submit = el)}
            type="submit"
            hidden
          />

          <input
            ref={(el: HTMLInputElement) => (this.fields.reset = el)}
            type="reset"
            hidden
          />

          {this.paymentMethod.save_cc && [
            <h3 class="mt-m mb-s text-l text-header">
              <Skeleton
                loaded={this.isContentAvailable}
                text={() => this.i18n.ccTitle}
              />
            </h3>,

            <div class="flex justify-between items-center mb-s">
              <figure class="flex items-center" data-e2e="cc-number">
                <img
                  src={this.ccLogo}
                  alt={this.i18n.ccLogoAlt(this.paymentMethod)}
                  class="rounded-s h-s mr-s"
                />

                <figcaption class="leading-none text-body font-tnum">
                  <span class="sr-only">{this.i18n.ccNumber}&nbsp;</span>
                  <span aria-hidden="true">••••&nbsp;</span>
                  {this.paymentMethod.cc_number_masked.substring(
                    this.paymentMethod.cc_number_masked.length - 4
                  )}
                </figcaption>
              </figure>

              <vaadin-button
                class="m-0"
                data-e2e="btn-remove-cc"
                data-theme="error small"
                disabled={this.isSaving}
                onClick={() => (this.removeCcDialog.opened = true)}
              >
                {this.i18n.removeCC}
              </vaadin-button>

              <ConfirmDialog
                ref={v => (this.removeCcDialog = v)}
                text={this.i18n.removeCCWarning}
                i18n={this.i18n}
                onOK={() => {
                  this.removeCcDialog.opened = false;
                  this.removeDefaultPaymentMethod();
                }}
              />
            </div>
          ]}
        </form>

        <div hidden={this.isEditable} class="text-body pb-m px-m">
          <h3 class="font-bold text-tertiary truncate">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.email}
            />
          </h3>

          <div class="truncate mb-m" data-e2e="lbl-email">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.state.email}
            />
          </div>

          <h3 class="font-bold text-tertiary truncate">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.password}
            />
          </h3>

          <div class="truncate mb-m">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => "∗∗∗∗∗∗∗∗∗∗"}
            />
          </div>

          <h3 class="font-bold text-tertiary truncate">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.ccTitle}
            />
          </h3>

          <div class="truncate" data-e2e="lbl-cc-info">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.ccDescription(this.paymentMethod)}
            />
          </div>
        </div>

        <div>
          {this.error && (
            <ErrorOverlay
              text={this.error}
              action={
                this.isErrorDismissable && this.i18n !== null
                  ? this.i18n.close
                  : undefined
              }
              onAction={() => (this.error = "")}
            />
          )}
        </div>
      </EditableCard>
    );
  }
}
