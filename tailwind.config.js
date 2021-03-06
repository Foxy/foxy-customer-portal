/**
 * This is a custom TailwindCSS config based on the Vaadin Lumo
 * theme variables. It brings all the benefits of utility CSS for Shadow
 * DOM content while also allowing end users to override specific values
 * in Light DOM using Lumo theme builder.
 *
 * @see https://cdn.vaadin.com/vaadin-lumo-styles/1.6.0/demo/index.html
 * @see https://demo.vaadin.com/lumo-editor/
 *
 * For project-specific internal utilities and extra base styles please
 * refer to the `src/tailwind.css` file.
 */

function cssVar(foxy, fallback) {
  return `var(--foxy-${foxy}, ${fallback})`;
}

const colorsMap = {
  transparent: "transparent",
  base: cssVar("base-color", "#fff"),
  tint: {
    5: cssVar("tint-5pct", "hsla(0, 0%, 100%, 0.3)"),
    10: cssVar("tint-10pct", "hsla(0, 0%, 100%, 0.37)"),
    20: cssVar("tint-20pct", "hsla(0, 0%, 100%, 0.44)"),
    30: cssVar("tint-30pct", "hsla(0, 0%, 100%, 0.5)"),
    40: cssVar("tint-40pct", "hsla(0, 0%, 100%, 0.57)"),
    50: cssVar("tint-50pct", "hsla(0, 0%, 100%, 0.64)"),
    60: cssVar("tint-60pct", "hsla(0, 0%, 100%, 0.7)"),
    70: cssVar("tint-70pct", "hsla(0, 0%, 100%, 0.77)"),
    80: cssVar("tint-80pct", "hsla(0, 0%, 100%, 0.84)"),
    90: cssVar("tint-90pct", "hsla(0, 0%, 100%, 0.9)"),
    default: cssVar("tint", "#fff")
  },
  shade: {
    5: cssVar("shade-5pct", "hsla(214, 61%, 25%, 0.05)"),
    10: cssVar("shade-10pct", "hsla(214, 57%, 24%, 0.1)"),
    20: cssVar("shade-20pct", "hsla(214, 53%, 23%, 0.16)"),
    30: cssVar("shade-30pct", "hsla(214, 50%, 22%, 0.26)"),
    40: cssVar("shade-40pct", "hsla(214, 47%, 21%, 0.38)"),
    50: cssVar("shade-50pct", "hsla(214, 45%, 20%, 0.5)"),
    60: cssVar("shade-60pct", "hsla(214, 43%, 19%, 0.61)"),
    70: cssVar("shade-70pct", "hsla(214, 42%, 18%, 0.72)"),
    80: cssVar("shade-80pct", "hsla(214, 41%, 17%, 0.83)"),
    90: cssVar("shade-90pct", "hsla(214, 40%, 16%, 0.94)"),
    default: cssVar("shade", "hsl(214, 35%, 15%)")
  },
  contrast: {
    5: cssVar("contrast-5pct", "hsla(214, 61%, 25%, 0.05)"),
    10: cssVar("contrast-10pct", "hsla(214, 57%, 24%, 0.1)"),
    20: cssVar("contrast-20pct", "hsla(214, 53%, 23%, 0.16)"),
    30: cssVar("contrast-30pct", "hsla(214, 50%, 22%, 0.26)"),
    40: cssVar("contrast-40pct", "hsla(214, 47%, 21%, 0.38)"),
    50: cssVar("contrast-50pct", "hsla(214, 45%, 20%, 0.5)"),
    60: cssVar("contrast-60pct", "hsla(214, 43%, 19%, 0.61)"),
    70: cssVar("contrast-70pct", "hsla(214, 42%, 18%, 0.72)"),
    80: cssVar("contrast-80pct", "hsla(214, 41%, 17%, 0.83)"),
    90: cssVar("contrast-90pct", "hsla(214, 40%, 16%, 0.94)"),
    default: cssVar("contrast", "hsl(214, 35%, 15%)")
  },
  primary: {
    10: cssVar("primary-color-10pct", "hsla(214, 90%, 52%, 0.1)"),
    50: cssVar("primary-color-50pct", "hsla(214, 90%, 52%, 0.5)"),
    default: cssVar("primary-color", "hsl(214, 90%, 52%)"),
    contrast: cssVar("primary-contrast-color", "#fff")
  },
  error: {
    10: cssVar("error-color-10pct", "hsla(3, 100%, 60%, 0.1)"),
    50: cssVar("error-color-50pct", "hsla(3, 100%, 60%, 0.5)"),
    default: cssVar("error-color", "hsl(3, 100%, 61%)"),
    contrast: cssVar("error-contrast-color", "#fff")
  },
  success: {
    10: cssVar("success-color-10pct", "hsla(145, 76%, 44%, 0.12)"),
    50: cssVar("success-color-50pct", "hsla(145, 76%, 44%, 0.55)"),
    default: cssVar("success-color", "hsl(145, 80%, 42%)"),
    contrast: cssVar("success-contrast-color", "#fff")
  }
};

const spacingMap = {
  0: "0",
  xs: cssVar("space-xs", "0.25rem"),
  s: cssVar("space-s", "0.5rem"),
  m: cssVar("space-m", "1rem"),
  l: cssVar("space-l", "1.5rem"),
  xl: cssVar("space-xl", "2.5rem"),
  default: cssVar("space-m", "1rem")
};

const textColorMap = Object.assign({}, colorsMap, {
  header: cssVar("header-text-color", "hsl(214, 35%, 15%)"),
  body: cssVar("body-text-color", "hsla(214, 40%, 16%, 0.94)"),
  disabled: cssVar("disabled-text-color", "hsla(214, 50%, 22%, 0.26)"),
  secondary: cssVar("secondary-text-color", "hsla(214, 42%, 18%, 0.72)"),
  tertiary: cssVar("tertiary-text-color", "hsla(214, 45%, 20%, 0.5)"),
  primary: Object.assign({}, colorsMap.primary, { default: cssVar("primary-text-color", "hsl(214, 90%, 52%)") }),
  success: Object.assign({}, colorsMap.success, { default: cssVar("success-text-color", "hsl(145, 100%, 32%)") }),
  error: Object.assign({}, colorsMap.error, { default: cssVar("error-text-color", "hsl(3, 92%, 53%)") })
});

const borderRadiusMap = {
  s: cssVar("border-radius-s", "0.25em"),
  m: cssVar("border-radius-m", "0.5em"),
  l: cssVar("border-radius-l", "0.75em"),
  full: "100%",
  default: cssVar("border-radius-m", "0.5em")
};

const boxShadowMap = {
  xxxs: cssVar("box-shadow-xxxs", "0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)"),
  xxs: cssVar("box-shadow-xxs", "0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 3px -2px rgba(0, 0, 0, 0.4)"),
  xs: cssVar("box-shadow-xs", "0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)"),
  s: cssVar("box-shadow-s", "0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.4)"),
  m: cssVar("box-shadow-m", "0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.4)"),
  l: cssVar("box-shadow-l", "0 12px 16px 1px rgba(0, 0, 0, 0.14), 0 4px 22px 3px rgba(0, 0, 0, 0.12), 0 6px 7px -4px rgba(0, 0, 0, 0.4)"),
  xl: cssVar("box-shadow-xl", "0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.4)"),
  xxl: cssVar("box-shadow-xxl", "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px -7px rgba(0, 0, 0, 0.4)"),
  outline: `0 0 0 2px ${cssVar("primary-color-50pct", "hsla(214, 90%, 52%, 0.5)")};`,
  "outline-base": `0 0 0 2px ${cssVar("base-color", "#fff")};`
};

const fontFamilyMap = {
  lumo: cssVar("font-family", '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"')
};

const fontSizeMap = {
  xxs: cssVar("font-size-xxs", "0.75rem"),
  xs: cssVar("font-size-xs", "0.8125rem"),
  s: cssVar("font-size-s", "0.875rem"),
  m: cssVar("font-size-m", "1rem"),
  l: cssVar("font-size-l", "1.125rem"),
  xl: cssVar("font-size-xl", "1.375rem"),
  xxl: cssVar("font-size-xxl", "1.75rem"),
  xxxl: cssVar("font-size-xxxl", "2.5rem"),
  xxxxl: cssVar("font-size-xxxxl", "3.75rem"),
  xxxxxl: cssVar("font-size-xxxxxl", "6rem")
};

const lineHeightMap = {
  none: "1",
  xs: cssVar("line-height-xs", "1.25"),
  s: cssVar("line-height-s", "1.375"),
  m: cssVar("line-height-m", "1.625")
};

const sizeMap = {
  xs: cssVar("line-size-xs", "1.625rem"),
  s: cssVar("line-size-s", "1.825rem"),
  m: cssVar("line-size-m", "2.25rem"),
  l: cssVar("line-size-l", "2.75rem"),
  xl: cssVar("line-size-xl", "3.5rem")
};

module.exports = {
  variants: [
    "responsive",
    "group-hover",
    "group-focus",
    "hover",
    "focus",
    "disabled"
  ],
  theme: {
    colors: colorsMap,
    spacing: spacingMap,
    textColor: textColorMap,
    borderRadius: borderRadiusMap,
    boxShadow: boxShadowMap,
    fontFamily: fontFamilyMap,
    fontSize: fontSizeMap,
    lineHeight: lineHeightMap,
    extend: {
      height: sizeMap,
      width: sizeMap
    }
  }
};
