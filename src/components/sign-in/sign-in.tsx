import {
  Component,
  Element,
  Watch,
  State,
  Prop,
  h,
  Event,
  EventEmitter
} from "@stencil/core";

import * as vaadin from "../../mixins/vaadin";
import * as i18n from "../../mixins/i18n";
import { i18nProvider } from "./i18n";

import { post as signIn } from "../../api/authenticate";
import { post as resetPassword } from "../../api/forgot_password";
import { getParentPortal } from "../../assets/utils/getParentPortal";
import { Messages, Status } from "./types";
import { Skeleton } from "../Skeleton";

@Component({
  tag: "foxy-sign-in",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class SignIn implements vaadin.Mixin, i18n.Mixin<typeof i18nProvider> {
  private formElement: HTMLFormElement;
  private emailElement: HTMLInputElement;
  private passwordElement: HTMLInputElement;

  @State() i18nProvider = i18nProvider;
  @State() i18n: Messages | null = null;
  @State() status = Status.idle;
  @State() message = "";

  /** Foxy Customer Portal API endpoint. */
  @Prop() endpoint = "";

  /** The language to display element content in. */
  @Prop() locale = i18n.defaults.locale.call(this);

  @Watch("locale")
  onLocaleChange(newValue: string) {
    i18n.onLocaleChange.call(this, newValue);
  }

  @Element() readonly root: HTMLFoxySignInElement;

  /**
   * Emitted after the user signs in and the
   * auth cookie is set.
   */
  @Event({
    eventName: "signin",
    composed: true,
    bubbles: true
  })
  readonly signin: EventEmitter<void>;

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

  componentDidLoad() {
    this.ready.emit();
  }

  componentDidRender() {
    vaadin.componentDidRender.call(this);
  }

  private async handlePasswordReset() {
    if (this.emailElement.checkValidity()) {
      this.status = Status.resettingPassword;
      this.message = "";

      try {
        await resetPassword(`${this.resolvedEndpoint}/forgot_password`, {
          email: this.emailElement.value
        });

        this.status = Status.success;
        this.message =
          this.i18n === null
            ? this.i18nProvider.en.resetPasswordSuccess
            : this.i18n.resetPasswordSuccess;
      } catch (e) {
        console.error(e);
        this.message = e.message;
        this.status = Status.error;
      }
    } else {
      this.status = Status.error;
      this.message = this.i18n.emailRequired;
    }
  }

  private async handleSubmit(event?: Event) {
    event?.preventDefault();

    this.status = Status.signingIn;
    this.message = "";

    try {
      await signIn(`${this.resolvedEndpoint}/authenticate`, {
        email: this.emailElement.value,
        password: this.passwordElement.value
      });

      this.signin.emit();
      this.status = Status.success;
      this.formElement.reset();
    } catch (e) {
      this.message = e.message;
      this.status = Status.error;
    }
  }

  private requestSubmit(e?: Event) {
    if (this.formElement.reportValidity()) {
      this.handleSubmit(e);
    }
  }

  private get resolvedEndpoint() {
    let path = "/s/customer";
    if (this.endpoint.length > 0) return this.endpoint + path;

    const portal = getParentPortal(this.root);
    return portal === null ? path : portal.endpoint + path;
  }

  render() {
    return (
      <form
        ref={el => (this.formElement = el)}
        class="p-m flex flex-col items-center justify-center font-lumo leading-s"
        onSubmit={e => this.handleSubmit(e)}
      >
        <slot />

        <vaadin-email-field
          disabled={
            this.status === Status.signingIn ||
            this.status === Status.resettingPassword
          }
          ref={el => (this.emailElement = el)}
          label={this.i18n === null ? "..." : this.i18n.email}
          autocomplete="email"
          data-e2e="fld-email"
          class="w-narrow"
          required
          onKeyPress={(e: KeyboardEvent) =>
            e.key === "Enter" && this.requestSubmit()
          }
        />

        <slot name="email-append" />

        <vaadin-password-field
          disabled={
            this.status === Status.signingIn ||
            this.status === Status.resettingPassword
          }
          ref={el => (this.passwordElement = el)}
          label={this.i18n === null ? "..." : this.i18n.password}
          autocomplete="current-password"
          data-e2e="fld-password"
          class="w-narrow"
          required
          onKeyPress={(e: KeyboardEvent) =>
            e.key === "Enter" && this.requestSubmit()
          }
        />

        <slot name="password-append" />

        <p
          data-e2e="lbl-status"
          class={{
            "py-m w-narrow text-s leading-s": true,
            "text-error": this.status === Status.error,
            "text-success": this.status === Status.success
          }}
        >
          {this.message}
        </p>

        <vaadin-button
          id="foxy-sign-in-button"
          data-e2e="btn-sign-in"
          data-theme={
            this.status === Status.signingIn
              ? "secondary outlined"
              : "primary contained"
          }
          disabled={
            this.status === Status.signingIn ||
            this.status === Status.resettingPassword
          }
          class="w-narrow mb-s"
          onClick={(e: Event) => this.requestSubmit(e)}
        >
          {this.status === Status.signingIn ? (
            <vaadin-progress-bar class="w-xl" indeterminate />
          ) : (
            <Skeleton
              loaded={this.i18n !== null}
              text={() => this.i18n.submit}
            />
          )}
        </vaadin-button>

        <vaadin-button
          id="foxy-password-reset-button"
          disabled={
            this.status === Status.signingIn ||
            this.status === Status.resettingPassword
          }
          class="w-narrow mb-s"
          data-e2e="btn-reset-pwd"
          data-theme="secondary outlined"
          onClick={() => this.handlePasswordReset()}
        >
          {this.status === Status.resettingPassword ? (
            <vaadin-progress-bar class="w-xl" indeterminate />
          ) : (
            <Skeleton
              loaded={this.i18n !== null}
              text={() => this.i18n.resetPassword}
            />
          )}
        </vaadin-button>

        <slot name="buttons-append" />

        <input type="submit" class="absolute pointer-events-none opacity-0" />
      </form>
    );
  }
}
