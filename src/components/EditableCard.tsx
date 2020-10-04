import { FunctionalComponent, h } from "@stencil/core";
import { Skeleton } from "./Skeleton";

interface Props {
  i18n: { save: string };
  editable: boolean;
  loaded: boolean;
  saving: boolean;
  summary: () => string;
  onToggle: () => any;
  onSave: () => any;
}

export const EditableCard: FunctionalComponent<Props> = (props, children) => (
  <div class="overflow-hidden font-lumo relative">
    <div
      class={{
        "text-body text-xl select-none flex justify-between items-center px-m h-xl": true,
        "opacity-25": props.saving
      }}
    >
      <div class="flex-1 mr-m">
        <Skeleton loaded={props.loaded} text={props.summary} />
      </div>

      <vaadin-button
        data-e2e="toggle"
        data-theme="tertiary icon"
        disabled={!props.loaded}
        onClick={props.onToggle}
      >
        <iron-icon
          class="text-xxs"
          icon={`icons:${props.editable ? "close" : "create"}`}
        />
      </vaadin-button>
    </div>

    <div class={{ "opacity-25": props.saving }}>
      {...children}

      {props.editable && (
        <div class="p-m">
          <vaadin-button
            class="w-full"
            data-e2e="save"
            data-theme="primary contained"
            disabled={!props.loaded}
            onClick={props.onSave}
          >
            <iron-icon slot="prefix" icon="icons:check" />
            {props.i18n.save}
          </vaadin-button>
        </div>
      )}
    </div>

    {props.saving && (
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <vaadin-progress-bar class="w-xl" indeterminate />
      </div>
    )}
  </div>
);
