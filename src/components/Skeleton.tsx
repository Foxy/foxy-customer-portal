import { FunctionalComponent, h } from "@stencil/core";

interface Props {
  loaded: boolean;
  text: () => string;
}

export const Skeleton: FunctionalComponent<Props> = props => (
  <div class="relative leading-s" aria-busy={!props.loaded} role="alert">
    {props.loaded
      ? props.text()
      : [
          <div
            class="bg-contrast-5 rounded my-xs absolute inset-0"
            data-e2e="skeleton"
          />,
          <span>&nbsp;</span>
        ]}
  </div>
);
