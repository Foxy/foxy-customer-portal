import {
  h,
  Component,
  Method,
  Prop,
  State,
  Watch,
  Element
} from "@stencil/core";

import { detector } from "./detector";
import { i18nProvider } from "./i18n";
import { Messages } from "./types";

import * as vaadin from "../../mixins/vaadin";
import * as i18n from "../../mixins/i18n";

@Component({
  tag: "foxy-plugin-warning",
  styleUrl: "../../tailwind.css",
  shadow: true
})
export class PluginWarning
  implements vaadin.Mixin, i18n.Mixin<typeof i18nProvider> {
  private _element: VaadinNotification;

  @Element() readonly root: HTMLFoxyPluginWarningElement;

  @State() i18n: Messages | null = null;
  @State() i18nProvider = i18nProvider;

  /** The language to display element content in. */
  @Prop() locale = i18n.defaults.locale.call(this);

  @Watch("locale")
  onLocaleChange(newValue: string) {
    i18n.onLocaleChange.call(this, newValue);
  }

  componentWillLoad() {
    i18n.componentWillLoad.call(this);
  }

  componentDidLoad() {
    detector.whenTriggered(() => this._element.open());
  }

  componentDidRender() {
    vaadin.componentDidRender.call(this);
  }

  /**
   * Closes the notification and prevents it
   * from appearing again after reload.
   */
  @Method()
  async close() {
    this._element.close();
  }

  render() {
    return (
      <vaadin-notification
        ref={(el: VaadinNotification) => (this._element = el)}
        duration={0}
        data-theme="error"
        renderer={(root: ParentNode) => {
          if (Boolean(root.firstElementChild)) return;

          const message = document.createElement("div");
          const action = document.createElement("vaadin-button");
          const layout = document.createElement("div");

          message.style.fontSize = "var(--foxy-font-size-xs)";
          message.style.padding = "var(--foxy-space-xs) 0 var(--foxy-space-s)";
          message.innerText = (this.i18n ?? this.i18nProvider.en).warning;

          action.innerText = (this.i18n ?? this.i18nProvider.en).close;
          action.setAttribute("theme", "small");
          action.addEventListener("click", () => this.close());

          layout.style.lineHeight = "var(--foxy-line-height-s)";
          layout.append(message, action);

          root.append(layout);
        }}
      />
    );
  }
}
