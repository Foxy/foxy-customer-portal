import { FunctionalComponent, h } from "@stencil/core";

interface Props {
  text: string;
  action?: string;
  onAction?: () => any;
}

export const ErrorOverlay: FunctionalComponent<Props> = props => (
  <div
    class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base leading-s"
    role="alert"
    aria-live="assertive"
    data-e2e="error"
  >
    <p class="m-m relative font-lumo text-contrast text-center">{props.text}</p>

    {props.action && (
      <vaadin-button onClick={() => props.onAction && props.onAction()}>
        {props.action}
      </vaadin-button>
    )}
  </div>
);
