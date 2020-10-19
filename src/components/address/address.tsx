import {
  Component,
  Element,
  Method,
  Event,
  State,
  Prop,
  h,
  EventEmitter,
  Watch
} from "@stencil/core";

import {
  get,
  patch,
  FullGetResponse,
  GetResponse,
  EditableAddress
} from "../../api";

import * as vaadin from "../../mixins/vaadin";
import * as store from "../../mixins/store";
import * as i18n from "../../mixins/i18n";
import { i18nProvider } from "./i18n";

import { getParentPortal } from "../../assets/utils/getParentPortal";
import { EditableCard } from "../EditableCard";
import { AddressType, Messages } from "./types";
import { ErrorOverlay } from "../ErrorOverlay";
import { APIError } from "../../api/utils";
import { Skeleton } from "../Skeleton";

interface ComboBoxItem {
  label: string;
  value: string;
}

const fields: Partial<EditableAddress> = {
  first_name: "given_name",
  last_name: "family-name",
  company: "organization",
  phone: "tel",
  address1: "address-line1",
  address2: "address-line2",
  city: "address-level2",
  postal_code: "postal-code"
};

type StoreMixin = store.Mixin<
  GetResponse<{
    zoom: Record<AddressType, true>;
    sso: true;
  }>
>;

@Component({
  tag: "foxy-address",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class Address
  implements vaadin.Mixin, StoreMixin, i18n.Mixin<typeof i18nProvider> {
  @Element() readonly root: HTMLFoxyAddressElement;

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

  /** The type of address to display. */
  @Prop() type: AddressType = "default_billing_address";

  @State() countries: ComboBoxItem[] = [];
  @State() regions: Record<string, ComboBoxItem[]> = {};
  @State() address = { ...this.state._embedded[`fx:${this.type}`] };

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
    this.loadLocations();
    this.ready.emit();
  }

  componentDidRender() {
    vaadin.componentDidRender.call(this);
  }

  /**
   * Resolves with a customer object containing address
   * of the default or specified `HTMLFoxyAddressElement.type`.
   */
  @Method()
  async getRemoteState() {
    const params = {
      zoom: { [this.type]: true },
      sso: true
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

    return customer as StoreMixin["state"];
  }

  /**
   * Resolves with a customer object containing address
   * of the default or specified `HTMLFoxyAddressElement.type`.
   */
  @Method()
  async getState(forceReload = false) {
    return store.getState.call(this, forceReload);
  }

  /** Sets customer object. */
  @Method()
  async setState(value: Partial<FullGetResponse>) {
    await store.setState.call(this, value);

    if (value._embedded && value._embedded[`fx:${this.type}`]) {
      this.address = { ...value._embedded[`fx:${this.type}`] };
    }

    if (this.error.length > 0 && this.state.id !== -1) {
      this.isErrorDismissable = true;
    }
  }

  /** Clears address form values and resets the component state. */
  @Method()
  async reset() {
    this.address = { ...this.state._embedded[`fx:${this.type}`] };
    this.isEditable = false;
    this.isSaving = false;
  }

  /** Submits the address form, saving changes in the cloud. */
  @Method()
  async submit() {
    this.isSaving = true;

    try {
      await patch(this.resolvedEndpoint, {
        _embedded: { [`fx:${this.type}`]: this.address }
      });
    } catch (e) {
      console.error(e);
      const localMessage = this.i18n?.error || this.i18nProvider.en.error;
      this.error = e instanceof APIError ? e.message : localMessage;
    }

    await this.setState(
      Object.assign({}, this.state, {
        _embedded: Object.assign({}, this.state._embedded, {
          [`fx:${this.type}`]: this.address
        })
      })
    );

    this.update.emit(this.state);
    this.isSaving = false;
    this.isEditable = false;
  }

  private get isContentAvailable() {
    return this.i18n !== null && this.address.address_name !== "";
  }

  private get isLocationDataAvailable() {
    return Object.keys(this.countries).length > 0;
  }

  private get resolvedEndpoint() {
    let path = "/s/customer";
    if (this.endpoint.length > 0) return this.endpoint + path;

    const portal = getParentPortal(this.root);
    return portal === null ? path : portal.endpoint + path;
  }

  private loadLocations() {
    if (!("FC" in window) || !("json" in window.FC)) {
      const originalCallback = window.FC?.onLoad;

      window.FC = window.FC || {};
      window.FC.onLoad = () => {
        if (Boolean(originalCallback)) originalCallback();
        this.loadLocations();
      };

      return;
    }

    const disallowedLocations =
      window.FC.json.config[
        this.type === "default_billing_address"
          ? "locations_billing"
          : "locations_shipping"
      ];

    for (const country in window.FC.json.config.locations) {
      if (disallowedLocations[country] === "*") continue;

      const { cn, r } = window.FC.json.config.locations[country];

      this.countries.push({ value: country, label: cn });
      this.regions[country] = this.regions[country] || [];

      for (const region in r.options) {
        const filter = disallowedLocations[country];
        if (Array.isArray(filter) && filter.includes(region)) continue;

        this.regions[country].push({
          value: region,
          label: r.options[region].n
        });
      }
    }

    // trigger re-render

    this.countries = [...this.countries];
    this.regions = { ...this.regions };
  }

  private toggle() {
    this.address = { ...this.state._embedded[`fx:${this.type}`] };
    this.isEditable = !this.isEditable;
  }

  render() {
    return (
      <EditableCard
        i18n={{ save: this.i18n?.save(this.type) ?? "" }}
        saving={this.isSaving}
        editable={this.isEditable}
        summary={() => this.i18n.title(this.type)}
        loaded={this.isContentAvailable}
        onToggle={() => this.toggle()}
        onSave={() => this.submit()}
      >
        <form
          class="px-s pb-m flex flex-wrap"
          hidden={!this.isEditable || !this.isContentAvailable}
          onSubmit={e => this.submit() && e.preventDefault()}
        >
          {Object.entries(fields).map(([name, autocomplete]) => (
            <div class="w-full sm:w-1/2 px-s">
              <vaadin-text-field
                class="w-full"
                data-e2e={name}
                disabled={this.isSaving}
                autocomplete={autocomplete}
                value={this.address[name]}
                label={this.i18n === null ? name : this.i18n.label(name as any)}
                onInput={(e: Event) => {
                  this.address = Object.assign({}, this.address, {
                    [name]: (e.target as HTMLInputElement).value
                  });
                }}
              >
                <input slot="input" />
              </vaadin-text-field>
            </div>
          ))}

          <div class="w-full sm:w-1/2 px-s">
            <vaadin-combo-box
              data-e2e="country"
              class="w-full"
              value={this.address.country}
              items={this.countries}
              readonly={this.isSaving}
              disabled={!this.isLocationDataAvailable}
              label={this.i18n === null ? "..." : this.i18n.label("country")}
              onChange={(e: Event) => {
                this.address = Object.assign({}, this.address, {
                  country: (e.target as HTMLInputElement).value,
                  region: ""
                });
              }}
            />
          </div>

          <div class="w-full sm:w-1/2 px-s">
            <vaadin-combo-box
              class="w-full"
              data-e2e="region"
              value={this.address.region}
              items={this.regions[this.address.country]}
              label={this.i18n === null ? "..." : this.i18n.label("region")}
              readonly={this.isSaving}
              disabled={
                this.isLocationDataAvailable === false ||
                this.regions[this.address.country] === undefined ||
                this.regions[this.address.country].length === 0
              }
              onChange={(e: Event) => {
                this.address = Object.assign({}, this.address, {
                  region: (e.target as HTMLInputElement).value
                });
              }}
            />
          </div>
        </form>

        <div hidden={this.isEditable} class="text-body pb-m px-m">
          <h3 class="font-bold text-tertiary">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.address}
            />
          </h3>

          <div data-e2e="lbl-name">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.getFullName(this.address)}
            />
          </div>

          <div class="mb-m" data-e2e="lbl-address">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.getAddress(this.address)}
            />
          </div>

          <h3 class="font-bold text-tertiary">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.i18n.phone}
            />
          </h3>

          <div data-e2e="lbl-phone">
            <Skeleton
              loaded={this.isContentAvailable}
              text={() => this.address.phone}
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
