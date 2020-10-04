import deepmerge from "deepmerge";
import { EventEmitter } from "@stencil/core";
import { check as isSignedIn } from "../api/authenticate";
import { getParentPortal } from "../assets/utils/getParentPortal";
import { customer } from "../assets/defaults";

type StateConsumer =
  | HTMLFoxyAddressElement
  | HTMLFoxyProfileElement
  | HTMLFoxySubscriptionElement
  | HTMLFoxySubscriptionsElement
  | HTMLFoxyTransactionsElement;

export interface Mixin<TGetResponse> {
  root: HTMLElement;
  state: TGetResponse;
  update: EventEmitter<TGetResponse>;
  getRemoteState: () => Promise<TGetResponse | null>;
  getState: (forceReload: boolean) => Promise<TGetResponse>;
  setState: (value: Partial<TGetResponse>) => Promise<void>;
  componentDidLoad: () => any;
}

export const defaults = {
  state<TGetResponse>(this: Mixin<TGetResponse>) {
    return customer();
  }
};

export async function getState<TGetResponse>(
  this: Mixin<TGetResponse>,
  forceReload = false
) {
  if (forceReload && isSignedIn()) {
    const state = await this.getRemoteState();

    if (state !== null) {
      await this.setState(state);
      this.update.emit(this.state);
    }
  }

  return this.state;
}

export async function setState<TGetResponse>(
  this: Mixin<TGetResponse>,
  value: Partial<TGetResponse>
) {
  this.state = deepmerge(this.state, value, {
    arrayMerge: (_, source) => source
  });

  const selector = [
    "foxy-address",
    "foxy-profile",
    "foxy-transactions",
    "foxy-subscription",
    "foxy-subscriptions"
  ].join();

  const consumers = [
    ...Array.from(this.root.shadowRoot.querySelectorAll(selector)),
    ...Array.from(this.root.querySelectorAll(selector))
  ] as StateConsumer[];

  await Promise.all(consumers.map(c => c.setState(value)));
}

export async function componentDidLoad<TGetResponse>(
  this: Mixin<TGetResponse>
) {
  const portal = getParentPortal(this.root);

  if (portal === null || portal === this.root) {
    await this.getState(true);
  } else {
    await this.setState(await portal.getState());
  }
}
