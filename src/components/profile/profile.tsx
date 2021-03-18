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
  EventEmitter
} from "@stencil/core";

import { FullGetResponse, get, GetResponse, patch } from "../../api";

import * as vaadin from "../../mixins/vaadin";
import * as store from "../../mixins/store";
import * as i18n from "../../mixins/i18n";
import { i18nProvider } from "./i18n";

import { EditableCard } from "../EditableCard";
import { Messages } from "./types";
import { ErrorOverlay } from "../ErrorOverlay";
import { APIError } from "../../api/utils";
import { Skeleton } from "../Skeleton";

type StoreMixin = store.Mixin<GetResponse<{}>>;

@Component({
  tag: "foxy-profile",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class Profile
  implements vaadin.Mixin, StoreMixin, i18n.Mixin<typeof i18nProvider> {
  private fields = {} as Record<
    "reset" | "submit" | "email" | "password_old" | "password",
    HTMLInputElement
  >;

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
    const params = {};
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

  private get resolvedEndpoint() {
    let path = "/s/customer";
    if (this.endpoint.length > 0) return this.endpoint + path;

    const portal = getParentPortal(this.root);
    return portal === null ? path : portal.endpoint + path;
  }

  private get isContentAvailable() {
    return this.i18n !== null && this.state.id !== -1;
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

    await this.setState({
      ...this.state,
      email: this.fields.email.value
    });

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
        i18n={this.i18n}
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
        </form>

        <div hidden={this.isEditable} class="text-body pb-m px-m">
          <h3 class="font-bold text-tertiary">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.email}
            />
          </h3>

          <div class="mb-m" data-e2e="lbl-email">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.state.email}
            />
          </div>

          <h3 class="font-bold text-tertiary">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.password}
            />
          </h3>

          <div>
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => "∗∗∗∗∗∗∗∗∗∗"}
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
