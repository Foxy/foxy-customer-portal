/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { AddressType } from "./components/address/types";
import { FullGetResponse, GetResponse } from "./api";
import { Tab } from "./components/customer-portal/types";
export namespace Components {
    interface FoxyAddress {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * Resolves with a customer object containing address of the default or specified `HTMLFoxyAddressElement.type`.
         */
        "getRemoteState": () => Promise<GetResponse<{ zoom: Record<AddressType, true>; sso: true; }>>;
        /**
          * Resolves with a customer object containing address of the default or specified `HTMLFoxyAddressElement.type`.
         */
        "getState": (forceReload?: boolean) => Promise<any>;
        /**
          * The language to display element content in.
         */
        "locale": any;
        /**
          * Clears address form values and resets the component state.
         */
        "reset": () => Promise<void>;
        /**
          * Sets customer object.
         */
        "setState": (value: Partial<FullGetResponse>) => Promise<void>;
        /**
          * Submits the address form, saving changes in the cloud.
         */
        "submit": () => Promise<void>;
        /**
          * The type of address to display.
         */
        "type": AddressType;
    }
    interface FoxyCustomerPortal {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * Resolves with a customer object (the state).
         */
        "getRemoteState": () => Promise<import("/Users/pheekus/FoxyCart/foxy-customer-portal/src/api/index").GetResponse<{ zoom: { default_billing_address: true; default_shipping_address: true; default_payment_method: true; subscriptions: { transactions: true; }; transactions: { items: true; }; }; sso: true; }>>;
        /**
          * Resolves with a customer object (the state).
         */
        "getState": (forceReload?: boolean) => Promise<any>;
        /**
          * The language to display element content in.
         */
        "locale": any;
        /**
          * Enables hash-based routing.
         */
        "router": boolean;
        /**
          * Prefix for routes and other top-level identifiers.
         */
        "scope": string;
        /**
          * Updates the customer object, or the state.
         */
        "setState": (value: Partial<FullGetResponse>) => Promise<void>;
        /**
          * List of links to add to the top nav. You can either use Markdown (`[Foo](https://example.com/foo) [Bar](https://example.com/bar)`) to avoid writing extra JS or assign this property an array where each item is an object with properties `href` for URL and `text` for the display text (both string).  To enable slot generation and routing, use the following URI scheme: `portal://tab-name`. This will create a slot for your tab content that will be displayed only when the appropriate tab link is clicked (works with hash-based routing too).
         */
        "tabs": string | Tab[];
    }
    interface FoxyPluginWarning {
        /**
          * Closes the notification and prevents it from appearing again after reload.
         */
        "close": () => Promise<void>;
        /**
          * The language to display element content in.
         */
        "locale": any;
    }
    interface FoxyProfile {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * Resolves with a fresh customer object that's guaranteed to contain the essential user info such as email, name and id (non-embedded content).
         */
        "getRemoteState": () => Promise<GetResponse<{}>>;
        /**
          * Resolves with a customer object that's guaranteed to contain the essential user info such as email, name and id (non-embedded content).
         */
        "getState": (forceReload?: boolean) => Promise<any>;
        /**
          * The language to display element content in.
         */
        "locale": any;
        /**
          * Sets customer object (the state).
         */
        "setState": (value: Partial<FullGetResponse>) => Promise<void>;
    }
    interface FoxySignIn {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * The language to display element content in.
         */
        "locale": any;
    }
    interface FoxySubscription {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * Resolves with a customer object that's guaranteed to contain the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
         */
        "getRemoteState": () => Promise<GetResponse<{ zoom: { readonly subscriptions: { readonly transactions: true; }; readonly default_payment_method: true; }; }>>;
        /**
          * Resolves with a customer object that's guaranteed to contain the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
         */
        "getState": (forceReload?: boolean) => Promise<any>;
        /**
          * Subscription URL (value of `(fx:subscription)._links.self.href`).
         */
        "link": string;
        /**
          * The language to display element content in.
         */
        "locale": any;
        /**
          * True if expanded, false otherwise. Set to toggle.
         */
        "open": boolean;
        /**
          * Sets frequency.
         */
        "setFrequency": (newValue: string) => Promise<void>;
        /**
          * Sets next transaction date.
         */
        "setNextTransactionDate": (newValue: string | Date) => Promise<void>;
        /**
          * Sets customer object.
         */
        "setState": (value: Partial<FullGetResponse>) => Promise<void>;
        /**
          * List of additional slots to generate for each transaction in the transactions display. Each entry will create a table cell slot named `transaction-${id}-${entry}` and a corresponding table header slot named `transactions-${entry}`. Accepts array of strings (`["foo", "bar"]`) or a serialized list of values separated by a comma (`"foo,bar"`). Items order is respected.
         */
        "transactionSlots": string | string[];
    }
    interface FoxySubscriptions {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * Resolves with a customer object that's guaranteed to contain the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
         */
        "getRemoteState": () => Promise<GetResponse<{ zoom: { subscriptions: { transactions: boolean; }; }; }>>;
        /**
          * Resolves with a customer object that's guaranteed to contain the `_embedded["fx:subscriptions"]` array with downloaded subscriptions.
         */
        "getState": (forceReload?: boolean) => Promise<any>;
        /**
          * Max number of displayed items.
         */
        "limit": number;
        /**
          * The language to display element content in.
         */
        "locale": any;
        /**
          * Current offset.
         */
        "offset": number;
        /**
          * Sets customer object.
         */
        "setState": (value: Partial<FullGetResponse>) => Promise<void>;
    }
    interface FoxyTransactions {
        /**
          * The number of columns in the table (affects the number of slots).
         */
        "cols": number;
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint": string;
        /**
          * Resolves with a customer object that's guaranteed to contain the `_embedded["fx:transactions"]` array with downloaded transactions.
         */
        "getRemoteState": () => Promise<GetResponse<{ zoom: { transactions: { items: boolean; }; }; }>>;
        /**
          * Resolves with a customer object that's guaranteed to contain the `_embedded["fx:transactions"]` array with downloaded transactions.
         */
        "getState": (forceReload?: boolean) => Promise<any>;
        /**
          * The language to display element content in.
         */
        "locale": any;
        /**
          * Sets customer object.
         */
        "setState": (value: Partial<FullGetResponse>) => Promise<void>;
    }
}
declare global {
    interface HTMLFoxyAddressElement extends Components.FoxyAddress, HTMLStencilElement {
    }
    var HTMLFoxyAddressElement: {
        prototype: HTMLFoxyAddressElement;
        new (): HTMLFoxyAddressElement;
    };
    interface HTMLFoxyCustomerPortalElement extends Components.FoxyCustomerPortal, HTMLStencilElement {
    }
    var HTMLFoxyCustomerPortalElement: {
        prototype: HTMLFoxyCustomerPortalElement;
        new (): HTMLFoxyCustomerPortalElement;
    };
    interface HTMLFoxyPluginWarningElement extends Components.FoxyPluginWarning, HTMLStencilElement {
    }
    var HTMLFoxyPluginWarningElement: {
        prototype: HTMLFoxyPluginWarningElement;
        new (): HTMLFoxyPluginWarningElement;
    };
    interface HTMLFoxyProfileElement extends Components.FoxyProfile, HTMLStencilElement {
    }
    var HTMLFoxyProfileElement: {
        prototype: HTMLFoxyProfileElement;
        new (): HTMLFoxyProfileElement;
    };
    interface HTMLFoxySignInElement extends Components.FoxySignIn, HTMLStencilElement {
    }
    var HTMLFoxySignInElement: {
        prototype: HTMLFoxySignInElement;
        new (): HTMLFoxySignInElement;
    };
    interface HTMLFoxySubscriptionElement extends Components.FoxySubscription, HTMLStencilElement {
    }
    var HTMLFoxySubscriptionElement: {
        prototype: HTMLFoxySubscriptionElement;
        new (): HTMLFoxySubscriptionElement;
    };
    interface HTMLFoxySubscriptionsElement extends Components.FoxySubscriptions, HTMLStencilElement {
    }
    var HTMLFoxySubscriptionsElement: {
        prototype: HTMLFoxySubscriptionsElement;
        new (): HTMLFoxySubscriptionsElement;
    };
    interface HTMLFoxyTransactionsElement extends Components.FoxyTransactions, HTMLStencilElement {
    }
    var HTMLFoxyTransactionsElement: {
        prototype: HTMLFoxyTransactionsElement;
        new (): HTMLFoxyTransactionsElement;
    };
    interface HTMLElementTagNameMap {
        "foxy-address": HTMLFoxyAddressElement;
        "foxy-customer-portal": HTMLFoxyCustomerPortalElement;
        "foxy-plugin-warning": HTMLFoxyPluginWarningElement;
        "foxy-profile": HTMLFoxyProfileElement;
        "foxy-sign-in": HTMLFoxySignInElement;
        "foxy-subscription": HTMLFoxySubscriptionElement;
        "foxy-subscriptions": HTMLFoxySubscriptionsElement;
        "foxy-transactions": HTMLFoxyTransactionsElement;
    }
}
declare namespace LocalJSX {
    interface FoxyAddress {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Emitted after the component makes changes to the state, containing the changed data in its payload.
         */
        "onUpdate"?: (event: CustomEvent<FullGetResponse>) => void;
        /**
          * The type of address to display.
         */
        "type"?: AddressType;
    }
    interface FoxyCustomerPortal {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Fired after the user signs in.
         */
        "onSignin"?: (event: CustomEvent<void>) => void;
        /**
          * Fired after the user signs out.
         */
        "onSignout"?: (event: CustomEvent<void>) => void;
        /**
          * Fired after each update of the customer object (the state).
         */
        "onUpdate"?: (event: CustomEvent<FullGetResponse>) => void;
        /**
          * Enables hash-based routing.
         */
        "router"?: boolean;
        /**
          * Prefix for routes and other top-level identifiers.
         */
        "scope"?: string;
        /**
          * List of links to add to the top nav. You can either use Markdown (`[Foo](https://example.com/foo) [Bar](https://example.com/bar)`) to avoid writing extra JS or assign this property an array where each item is an object with properties `href` for URL and `text` for the display text (both string).  To enable slot generation and routing, use the following URI scheme: `portal://tab-name`. This will create a slot for your tab content that will be displayed only when the appropriate tab link is clicked (works with hash-based routing too).
         */
        "tabs"?: string | Tab[];
    }
    interface FoxyPluginWarning {
        /**
          * The language to display element content in.
         */
        "locale"?: any;
    }
    interface FoxyProfile {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Emitted after the component makes changes to the state, containing the changed data in its payload.
         */
        "onUpdate"?: (event: CustomEvent<FullGetResponse>) => void;
    }
    interface FoxySignIn {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Emitted after the user signs in and the auth cookie is set.
         */
        "onSignin"?: (event: CustomEvent<void>) => void;
    }
    interface FoxySubscription {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * Subscription URL (value of `(fx:subscription)._links.self.href`).
         */
        "link"?: string;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Emitted when subscription details are expanded or collapsed.
         */
        "onToggle"?: (event: CustomEvent<FullGetResponse>) => void;
        /**
          * Emitted after the component makes changes to the state, containing the changed data in its payload.
         */
        "onUpdate"?: (event: CustomEvent<FullGetResponse>) => void;
        /**
          * True if expanded, false otherwise. Set to toggle.
         */
        "open"?: boolean;
        /**
          * List of additional slots to generate for each transaction in the transactions display. Each entry will create a table cell slot named `transaction-${id}-${entry}` and a corresponding table header slot named `transactions-${entry}`. Accepts array of strings (`["foo", "bar"]`) or a serialized list of values separated by a comma (`"foo,bar"`). Items order is respected.
         */
        "transactionSlots"?: string | string[];
    }
    interface FoxySubscriptions {
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * Max number of displayed items.
         */
        "limit"?: number;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Current offset.
         */
        "offset"?: number;
        /**
          * Fired when offset or limit change. Current state is available from `event.detail`, limit and offset from the respective properties on `event.currentTarget`.
         */
        "onNavigation"?: (event: CustomEvent<FullGetResponse>) => void;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Emitted after the component makes changes to the state, containing the changed data in its payload.
         */
        "onUpdate"?: (event: CustomEvent<FullGetResponse>) => void;
    }
    interface FoxyTransactions {
        /**
          * The number of columns in the table (affects the number of slots).
         */
        "cols"?: number;
        /**
          * Foxy Customer Portal API endpoint.
         */
        "endpoint"?: string;
        /**
          * The language to display element content in.
         */
        "locale"?: any;
        /**
          * Fired when component becomes ready to be interacted with.
         */
        "onReady"?: (event: CustomEvent<void>) => void;
        /**
          * Emitted after the component makes changes to the state, containing the changed data in its payload.
         */
        "onUpdate"?: (event: CustomEvent<FullGetResponse>) => void;
    }
    interface IntrinsicElements {
        "foxy-address": FoxyAddress;
        "foxy-customer-portal": FoxyCustomerPortal;
        "foxy-plugin-warning": FoxyPluginWarning;
        "foxy-profile": FoxyProfile;
        "foxy-sign-in": FoxySignIn;
        "foxy-subscription": FoxySubscription;
        "foxy-subscriptions": FoxySubscriptions;
        "foxy-transactions": FoxyTransactions;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "foxy-address": LocalJSX.FoxyAddress & JSXBase.HTMLAttributes<HTMLFoxyAddressElement>;
            "foxy-customer-portal": LocalJSX.FoxyCustomerPortal & JSXBase.HTMLAttributes<HTMLFoxyCustomerPortalElement>;
            "foxy-plugin-warning": LocalJSX.FoxyPluginWarning & JSXBase.HTMLAttributes<HTMLFoxyPluginWarningElement>;
            "foxy-profile": LocalJSX.FoxyProfile & JSXBase.HTMLAttributes<HTMLFoxyProfileElement>;
            "foxy-sign-in": LocalJSX.FoxySignIn & JSXBase.HTMLAttributes<HTMLFoxySignInElement>;
            "foxy-subscription": LocalJSX.FoxySubscription & JSXBase.HTMLAttributes<HTMLFoxySubscriptionElement>;
            "foxy-subscriptions": LocalJSX.FoxySubscriptions & JSXBase.HTMLAttributes<HTMLFoxySubscriptionsElement>;
            "foxy-transactions": LocalJSX.FoxyTransactions & JSXBase.HTMLAttributes<HTMLFoxyTransactionsElement>;
        }
    }
}
