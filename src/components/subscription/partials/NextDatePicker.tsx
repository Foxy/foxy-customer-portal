import { FunctionalComponent, h } from "@stencil/core";
import { formatDate, parseDate } from "../utils";

import { ConfirmDialog } from "../../ConfirmDialog";
import { Messages } from "../types";
import { Notification } from "../../Notification";
import { Subscription } from "../../../assets/types/Subscription";

type NextDateConfig = Subscription["_embedded"]["template_config"]["allow_next_date_modification"];

interface Props {
  subscription: Subscription;
  disabled: boolean;
  newValue: string;
  invalid: boolean;
  value: string | Date;
  i18n: Messages;
  errorRef: (el: VaadinNotification) => any;
  successRef: (el: VaadinNotification) => any;
  validationErrorRef: (el: VaadinNotification) => any;
  confirmRef: (el: VaadinDialog) => any;
  onInvalidChanged: (newValue: boolean) => any;
  onChangeRequest: (newValue: string) => any;
  onChange: (newValue: string) => any;
}

function applyDuration(value: string, date = new Date()) {
  const decimalValue = value === ".5m" ? "15d" : value;
  const offset = parseInt(decimalValue.substring(0, decimalValue.length - 1));
  const unit = decimalValue[decimalValue.length - 1];
  const result = new Date(date);

  if (unit === "y") {
    result.setFullYear(result.getFullYear() + offset);
  } else if (unit === "m") {
    result.setMonth(result.getMonth() + offset);
  } else if (unit === "w") {
    result.setDate(result.getDate() + offset * 7);
  } else if (unit === "d") {
    result.setDate(result.getDate() + offset);
  }

  return result;
}

function getMinDate(config: NextDateConfig) {
  if (config === true) return formatDate(new Date());
  if (config === false) return undefined;
  if (Boolean(config.min)) return formatDate(applyDuration(config.min));
  return formatDate(new Date());
}

function getMaxDate(config: NextDateConfig) {
  if (typeof config === "object" && Boolean(config.max)) {
    return formatDate(applyDuration(config.max));
  }
}

function validate(value: Date, config: NextDateConfig) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  const time = date.getTime();
  if (time < Date.now()) return false;

  const formattedDate = formatDate(date);

  if (config === false) return false;
  if (config === true) return true;

  if (typeof config.min === "string") {
    const min = applyDuration(config.min);
    if (time < min.getTime()) return false;
  }

  if (typeof config.max === "string") {
    const max = applyDuration(config.max);
    if (time > max.getTime()) return false;
  }

  if (Boolean(config.allowed_days_of_week)) {
    const days = config.allowed_days_of_week.map(v => (v === 7 ? 0 : v));
    if (!days.includes(date.getDay())) return false;
  }

  if (Boolean(config.allowed_days_of_month)) {
    if (!config.allowed_days_of_month.includes(date.getDate())) return false;
  }

  if (typeof config.disallowed_dates === "object") {
    return !config.disallowed_dates.some(item => {
      const [min, max] = item.split("..");
      return (
        (typeof max === "undefined" && formattedDate === min) ||
        (typeof max === "string" &&
          time >= parseDate(min).getTime() &&
          time <= parseDate(max).getTime())
      );
    });
  }

  return true;
}

export const NextDatePicker: FunctionalComponent<Props> = (props: Props) => {
  const config = props.subscription._embedded.template_config;
  const nextDateConfig = config.allow_next_date_modification;

  return (
    <div>
      <vaadin-date-picker
        data-e2e="fld-date"
        class="w-full"
        label={props.i18n.selectNextDate}
        min={props.disabled ? undefined : getMinDate(nextDateConfig)}
        max={props.disabled ? undefined : getMaxDate(nextDateConfig)}
        i18n={props.i18n.pickerI18n}
        value={formatDate(new Date(props.value))}
        disabled={props.disabled}
        onChange={(event: Event) => {
          const picker = event.target as HTMLInputElement;
          const oldDate = formatDate(new Date(props.value));

          if (picker.value !== oldDate) {
            const [y, m, d] = picker.value.split("-").map(v => parseInt(v));
            const newDate = new Date(y, m - 1, d);

            if (validate(newDate, nextDateConfig)) {
              props.onInvalidChanged(false);
              props.onChangeRequest(newDate.toISOString());
              setTimeout(() => (picker.value = oldDate));
            } else {
              props.onInvalidChanged(true);
            }
          }
        }}
      />

      {typeof nextDateConfig === "object" &&
        (typeof nextDateConfig.allowed_days_of_month === "object" ||
          typeof nextDateConfig.allowed_days_of_week === "object" ||
          typeof nextDateConfig.disallowed_dates === "object") && (
          <p
            data-e2e="ndm-hint"
            class={{
              "leading-xs text-xs": true,
              "text-error": props.invalid,
              "text-tertiary": !props.invalid && !props.disabled,
              "text-disabled": !props.invalid && props.disabled
            }}
          >
            {props.i18n.nextDateDescription(nextDateConfig)}
          </p>
        )}

      <ConfirmDialog
        i18n={props.i18n}
        ref={props.confirmRef}
        text={props.i18n.nextDateConfirm(props.newValue)}
        onOK={() => props.onChange(props.newValue)}
      />

      <Notification
        theme="success"
        i18n={props.i18n}
        ref={props.successRef}
        text={props.i18n.updateNotification}
      />

      <Notification
        theme="error"
        i18n={props.i18n}
        ref={props.errorRef}
        text={props.i18n.errorNotification}
      />

      <Notification
        theme="error"
        i18n={props.i18n}
        ref={props.validationErrorRef}
        text={
          typeof nextDateConfig === "boolean"
            ? props.i18n.errorNotification
            : props.i18n.nextDateDescription(nextDateConfig)
        }
      />
    </div>
  );
};
