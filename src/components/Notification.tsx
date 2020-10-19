import { FunctionalComponent, h } from "@stencil/core";

interface Props {
  theme: "success" | "error";
  text: string;
  i18n: { close: string } | null;
  ref: (el: VaadinNotification) => any;
}

export const Notification: FunctionalComponent<Props> = props => (
  <vaadin-notification
    ref={props.ref}
    data-theme={props.theme}
    duration={props.theme === "success" ? 5000 : 0}
    renderer={(root: HTMLElement, toast: VaadinNotification) => {
      let span: HTMLSpanElement;

      if (root.firstElementChild === null) {
        span = document.createElement("span");
        const action = document.createElement("vaadin-button");

        action.textContent = props.i18n.close;
        action.addEventListener("click", () => toast.close());

        root.appendChild(span);
        root.appendChild(action);
      } else {
        span = root.querySelector("span");
      }

      span.textContent = props.text;
      span.style.lineHeight = "var(--foxy-line-height-s)";
    }}
  />
);
