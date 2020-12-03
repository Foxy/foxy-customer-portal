import { FunctionalComponent, h, getAssetPath } from "@stencil/core";
import { Subscription } from "../../../assets/types/Subscription";
import { getUpdateUrl } from "../utils";
import { Messages } from "../types";
import { PaymentMethod as DefaultPaymentMethod } from "../../../assets/types/PaymentMethod";

export type System =
  | "unknown"
  | "amex"
  | "diners"
  | "discover"
  | "jcb"
  | "maestro"
  | "mastercard"
  | "unionpay"
  | "visa";

interface Props {
  i18n: Messages;
  subscription: Subscription;
  paymentMethod: DefaultPaymentMethod;
}

const cover: Record<System, string> = {
  unknown: "bg-unknown",
  amex: "bg-amex",
  diners: "bg-diners",
  discover: "bg-discover",
  jcb: "bg-jcb",
  maestro: "bg-maestro",
  mastercard: "bg-mastercard",
  unionpay: "bg-unionpay",
  visa: "bg-visa"
};

function getLast4Digits(paymentMethod: DefaultPaymentMethod) {
  return paymentMethod.cc_number_masked.substring(
    paymentMethod.cc_number_masked.length - 4
  );
}

function getSystem(paymentMethod: DefaultPaymentMethod) {
  const system = paymentMethod.cc_type.toLowerCase();
  return system in cover ? (system as System) : "unknown";
}

export const PaymentMethod: FunctionalComponent<Props> = ({
  i18n,
  subscription,
  paymentMethod
}) => (
  <section
    class="h-80px pointer-events-none md:h-64px"
    aria-region={i18n.ccRegion}
  >
    <div class="relative overflow-y-hidden pt-64px -top-64px md:px-48px md:-mx-48px md:pt-m md:top-0">
      <div
        class={`${
          cover[getSystem(paymentMethod)]
        } h-80px mx-m rounded-t-m shadow-m pointer-events-auto`}
      >
        <div class="h-40px pt-s flex items-end justify-between">
          <p class="text-white ml-m text-s font-tnum leading-none">
            <span class="sr-only">{i18n.ccNumber}&nbsp;</span>
            <span aria-hidden="true">••••&nbsp;</span>
            <span data-e2e="cc-number">{getLast4Digits(paymentMethod)}</span>
          </p>

          <img
            alt={i18n[getSystem(paymentMethod)]}
            class="h-full rounded-m mr-s"
            style={{ boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05)" }}
            src={getAssetPath(`./assets/${getSystem(paymentMethod)}.svg`)}
          />
        </div>
      </div>

      <div class="absolute bottom-0 inset-x-0">
        <a
          data-e2e="cc-link"
          href={getUpdateUrl(subscription)}
          aria-label={i18n.ccEdit}
          target="_blank"
          rel="nofollow noreferrer noopener"
          class="mb-6px text-white transition duration-150 pointer-events-auto block w-m h-m flex items-center justify-center rounded-full bg-tint-5 mx-auto hover:bg-tint-10 focus:outline-none focus:shadow-outline-base"
        >
          <iron-icon
            icon="editor:mode-edit"
            class="relative iron-icon-18px"
            aria-hidden="true"
          />
        </a>
      </div>

      <div class="flex absolute inset-x-0 bottom-0" aria-hidden="true">
        <div class="flex-1 bg-base"></div>

        <svg
          width="72"
          height="24"
          viewBox="0 0 72 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M67.018 0C62.6674 0 59.2695 3.67913 57.8536 7.85691C54.7028 17.1546 46.1163 23.8248 36.018 23.8248C25.9196 23.8248 17.3332 17.1546 14.1823 7.8569C12.7665 3.67912 9.36863 0 5.018 0H0V24H72V0H67.018Z"
            class="fill-base"
          />
        </svg>

        <div class="flex-1 bg-base"></div>
      </div>
    </div>
  </section>
);
