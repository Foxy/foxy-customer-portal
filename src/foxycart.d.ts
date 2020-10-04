/**
 * This is a `foxycart.js` ambient declaration file.
 * Please note that types described here may be private and partial.
 * For full reference, please @see https://wiki.foxycart.com/v/2.0/javascript
 */

interface FCComplete {
  /** Alternate names */
  alt: ReadonlyArray<string>;

  /** Relevancy boost number */
  boost: number;

  /** True if this location is current and active. */
  active: boolean;
}

interface FCAddressComponent {
  /** Component label */
  lang: string;

  /** True if required */
  req: boolean;
}

interface FCRegion extends FCComplete {
  /** Region name */
  c: string;

  /** Region code */
  n: string;
}

interface FCPostcode extends FCAddressComponent {
  /** If this postcode is integer (no spaces or dashes) */
  int: boolean;

  /** A regular expression for the format of this postcode */
  regex: string;

  /** True if address search is possible by postcode for this country */
  search: boolean;
}

interface FCCountry extends FCComplete {
  /** 2 character country code */
  cc2: string;

  /** 3 character country code */
  cc3: string;

  /** Country numerical code */
  ccnum: string;

  /** Country Name */
  cn: string;

  /** Postcode info */
  pc: Readonly<FCPostcode>;

  /** Regions info */
  r: Readonly<
    FCAddressComponent & {
      /** Regions map */
      options: Readonly<{
        /** Region info */
        [key: string]: Readonly<FCRegion>;
      }>;
    }
  >;
}

interface Window {
  FC?: {
    /** The function that executes once the library is initialized */
    onLoad?: () => any;

    /** Various data */
    readonly json?: {
      readonly config: {
        /** Map of all available locations */
        readonly locations: {
          readonly [key: string]: Readonly<FCCountry>;
        };

        /**
         * Map of locations that are disallowed for use as shipping address.
         * Wildcard disallows the entire country, array disallows just the included regions.
         */
        readonly locations_shipping: {
          readonly [key: string]: "*" | ReadonlyArray<string>;
        };

        /**
         * Map of locations that are disallowed for use as billing address.
         * Wildcard disallows the entire country, array disallows just the included regions.
         */
        readonly locations_billing: {
          readonly [key: string]: "*" | ReadonlyArray<string>;
        };
      };
    };
  };
}
