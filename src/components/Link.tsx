import { FunctionalComponent, h } from "@stencil/core";

interface Props {
  title?: string;
  href?: string;
  text?: string;
  size?: "m" | "s";
  color?: "secondary" | "primary" | "body";
}

export const Link: FunctionalComponent<Props> = props => (
  <a
    {...(Boolean(props.href) ? { href: props.href } : {})}
    title={props.title}
    target="_blank"
    rel="nofollow noreferrer noopener"
    class={{
      "text-s": props.size === "s",
      "text-m": !Boolean(props.size) || props.size === "m",
      "text-body": !Boolean(props.color) || props.color === "body",
      "text-primary": props.color === "primary",
      "text-secondary": props.color === "secondary",
      "px-xs -mx-xs inline-block rounded-m leading-s font-medium hover:no-underline focus:outline-none": true,
      "transition duration-150 hover:text-primary focus:shadow-outline": Boolean(
        props?.href
      )
    }}
  >
    {props?.text ?? ""}

    {Boolean(props?.href) && (
      <iron-icon class="iron-icon-14px ml-xs" icon="open-in-new" />
    )}
  </a>
);
