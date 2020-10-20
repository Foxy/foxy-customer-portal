import { FunctionalComponent, VNode, h } from "@stencil/core";
import { Transaction } from "../assets/types/Transaction";
import { Subscription } from "../assets/types/Subscription";
import { Skeleton } from "./Skeleton";

interface Props<T> {
  items: any[];
  cols: number;
  start: number;
  limit: number;
  hasMore: boolean;
  isLoadingNext: boolean;
  headers: (() => string)[];
  cells: ((item: T) => void | string | VNode | VNode[])[];
  navigate: (direction: "forward" | "back") => any;
  messages?: {
    next: string;
    previous: string;
  };
}

function createDataTable<T>(): FunctionalComponent<Props<T>> {
  return (props, children = []) => (
    <div class="relative flex flex-wrap justify-between font-lumo whitespace-no-wrap leading-s">
      <div class="w-full overflow-auto">
        <table class="block w-full text-left text-body border-collapse sm:table">
          <thead class="hidden sm:table-header-group">
            <tr>
              {new Array(props.cols).fill(0).map((_, i) => (
                <th class="px-m text-s font-medium sm:h-l text-left">
                  <slot name={`header-${i}`}>
                    <Skeleton
                      loaded={Boolean(props.messages)}
                      text={props.headers[i] || (() => "")}
                    />
                  </slot>
                </th>
              ))}
            </tr>
          </thead>

          <tbody class="block sm:table-row-group">
            {new Array(props.limit).fill(0).map((_, row) => (
              <tr
                class={{
                  "py-m sm:py-0 sm:table-row": true,
                  "border-t-4 sm:border-t border-shade-10": row > 0,
                  block: row + props.start < props.items.length,
                  hidden: row + props.start >= props.items.length
                }}
              >
                {new Array(props.cols).fill(0).map((_, cell) => (
                  <td
                    class="block px-m sm:h-l sm:table-cell"
                    key={`row-${row + props.start}-cell-${cell}`}
                  >
                    <slot name={`row-${row + props.start}-cell-${cell}`}>
                      {row + props.start < props.items.length &&
                        props.cells[cell] &&
                        props.cells[cell](props.items[row + props.start])}
                    </slot>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <vaadin-button
        class="m-m"
        data-e2e="btn-prev"
        disabled={props.start === 0 || props.isLoadingNext}
        onClick={() => props.navigate("back")}
      >
        <iron-icon icon="icons:chevron-left" slot="prefix" />
        <Skeleton
          loaded={Boolean(props.messages)}
          text={() => props.messages.previous}
        />
      </vaadin-button>

      <vaadin-button
        disabled={
          props.start + props.limit >= props.items.length ||
          props.items.length < props.limit ||
          props.isLoadingNext ||
          !props.hasMore
        }
        class="m-m"
        data-e2e="btn-next"
        data-theme={props.isLoadingNext ? "tertiary" : "secondary"}
        onClick={() => props.navigate("forward")}
      >
        {props.isLoadingNext ? (
          <vaadin-progress-bar class="w-xl" indeterminate />
        ) : (
          <Skeleton
            loaded={Boolean(props.messages)}
            text={() => props.messages.next}
          />
        )}
        <iron-icon icon="icons:chevron-right" slot="suffix" />
      </vaadin-button>

      {...children}
    </div>
  );
}

export const TransactionDataTable = createDataTable<Transaction>();
export const SubscriptionDataTable = createDataTable<Subscription>();
