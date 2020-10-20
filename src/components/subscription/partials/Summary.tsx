import { FunctionalComponent, h } from "@stencil/core";
import { Skeleton } from "../../Skeleton";
import { Subscription } from "../../../assets/types/Subscription";
import { Messages } from "../types";

interface Props {
  i18n: Messages;
  open?: boolean;
  subscription?: Subscription;
}

const iconMap = {
  open: "expand-less",
  active: "done",
  failed: "error-outline",
  loading: "",
  cancelled: "done-all"
} as const;

function getStatus(open: boolean, subscription?: Subscription) {
  if (open) return "open";
  if (Boolean(subscription?.first_failed_transaction_date)) return "failed";
  if (Boolean(subscription?.end_date)) return "cancelled";
  return Boolean(subscription) ? "active" : "loading";
}

function getPrice(i18n: Messages, subscription: Subscription) {
  const template = subscription._embedded["fx:transaction_template"];
  const price = i18n.price(template.total_order, template.currency_code);
  const frequency = i18n.frequencyDescription(subscription.frequency);

  return `${price}/${frequency}`;
}

function getTitle(i18n: Messages, subscription: Subscription) {
  const template = subscription._embedded["fx:transaction_template"];
  const items = template._embedded["fx:items"];

  return items.length > 0 ? i18n.summary(items) : "";
}

export const Summary: FunctionalComponent<Props> = ({
  subscription,
  open,
  i18n
}) => {
  const status = getStatus(open, subscription);

  return (
    <summary class="p-s group relative focus:outline-none">
      <div class="select-none flex items-center rounded transition duration-150 ease-in-out group-hover:bg-contrast-5 group-focus:shadow-outline">
        <div class="p-s min-w-0 flex-shrink-0">
          <div class="rounded-full overflow-hidden bg-base shadow-outline-base">
            <div
              class={{
                "relative flex items-center justify-center p-xs md:p-s": true,
                "text-success bg-success-10": status === "active",
                "text-error bg-error-10": status === "failed",
                "text-body bg-contrast-5": !["active", "failed"].includes(
                  status
                )
              }}
            >
              <iron-icon
                class={{ "opacity-0": status === "loading" }}
                icon={iconMap[status]}
              />
            </div>
          </div>
        </div>

        <div class="px-s flex-1 min-w-0">
          <div class="min-w-0">
            <p class="leading-xs text-body text-m font-medium origin-top-left md:text-l">
              <Skeleton
                loaded={Boolean(subscription)}
                text={() => getTitle(i18n, subscription)}
              />
            </p>

            <p
              class={{
                "leading-xs text-xs md:text-m": true,
                "text-tertiary": open || status === "cancelled",
                "text-success": status === "active",
                "text-error": status === "failed"
              }}
            >
              <Skeleton
                loaded={Boolean(subscription)}
                text={() => i18n.statusDescription(subscription)}
              />
            </p>
          </div>
        </div>

        <p class="flex-1 text-right hidden text-body text-xl px-s md:block">
          <Skeleton
            loaded={Boolean(subscription)}
            text={() => getPrice(i18n, subscription)}
          />
        </p>
      </div>
    </summary>
  );
};
