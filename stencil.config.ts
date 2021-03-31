import { Config } from "@stencil/core";
import { postcss } from "@stencil/postcss";
import nodePolyfills from "rollup-plugin-node-polyfills";
import replace from "rollup-plugin-replace";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import purgecss from "@fullhuman/postcss-purgecss";
import cssnano from "cssnano";

export const config: Config = {
  namespace: "foxy",
  buildEs5: "prod",
  globalScript: "src/preflight.ts",
  testing: {
    browserArgs: ["--no-sandbox"]
  },
  extras: {
    /**
     * The standard Shadow DOM shim included by Stencil
     * doesn't seem to play well with the one in Vaadin components
     * that use Polymer. Disabling and bundling @webcomponents/webcomponentsjs
     * instead (see src/preflight.ts)
     */
    shadowDomShim: false
  },
  plugins: [
    replace({
      lumo: process.env.VAADIN_THEME || "lumo",
      include: "**/preflight.js",
      delimiters: ["", ""]
    }),
    nodePolyfills(),
    postcss({
      plugins: [
        tailwindcss("./tailwind.config.js"),
        ...(process.env.NODE_ENV === "production"
          ? [
              purgecss({
                content: ["./src/**/*.*"],
                defaultExtractor: content =>
                  content.match(/[A-Za-z0-9-_:/]+/g) || []
              }),
              autoprefixer({ cascade: false }),
              cssnano
            ]
          : [])
      ]
    })
  ],
  devServer: {
    port: 8080,
    initialLoadUrl: "index.html"
  },
  outputTargets:
    process.env.NODE_ENV === "production"
      ? [
          {
            type: "dist",
            dir: `dist/${process.env.VAADIN_THEME || "lumo"}`
          },
          {
            type: "docs-readme"
          }
        ]
      : [
          {
            type: "dist"
          },
          {
            type: "www",
            serviceWorker: null,
            copy: [{ src: "demos/*.html" }, { src: "index.e2e.html" }]
          }
        ]
};
