import { Link } from "../assets/types/Link";
import { GetResponse } from ".";

export type Fields<T> = Omit<T, "_links" | "_embedded">;

export type Zoom = {
  [key: string]: boolean | Zoom;
};

export type DeepEmbed<
  RequestType,
  ZoomType,
  EmbedType
> = RequestType extends Record<"zoom", ZoomType>
  ? { _embedded: EmbedType }
  : {};

export type Embed<
  RequestType,
  ZoomKey extends string,
  EmbedKey extends string,
  EmbedType
> = DeepEmbed<
  RequestType,
  Record<ZoomKey, boolean | Zoom>,
  Record<EmbedKey, EmbedType>
>;

export type LinkEmbed<
  RequestType,
  TriggerKey extends string,
  EmbedKey extends string
> = RequestType extends Record<TriggerKey, boolean>
  ? Record<"_links", Record<EmbedKey, Link>>
  : {};

export type QueryParams<T, Zoom = {}> = {
  order?: keyof T | Partial<Record<keyof Fields<T>, "asc" | "desc">>;
  offset?: number;
  limit?: number;
  zoom?: Zoom;
};

export function hasSSOLink(res: any): res is GetResponse<{ sso: true }> {
  return res && res._links && res._links["fx:checkout"];
}

export function serializeZoom<T extends Zoom>(zoom: T, prefix = ""): string[] {
  const path = prefix === "" ? "" : `${prefix}:`;

  return Object.entries(zoom).reduce((result, [key, value]) => {
    if (typeof value === "boolean") return [...result, `${path}${key}`];
    return [...result, key, ...serializeZoom(value, key)];
  }, [] as string[]);
}

export function serializeQuery<T extends {}>(query: QueryParams<T>) {
  const params = new URLSearchParams();

  if (typeof query.limit !== "undefined") {
    params.set("limit", String(query.limit));
  }

  if (typeof query.offset !== "undefined") {
    params.set("offset", String(query.offset));
  }

  if (typeof query.order === "string") {
    params.set("order", query.order);
  } else if (typeof query.order === "object") {
    const value = Object.entries(query.order)
      .map(entry => entry.join(" "))
      .join();

    params.set("order", value);
  }

  return params;
}

export type JSONError = {
  /** One of the predefined error types. */
  type: string;

  /** HTTP status code as string. */
  code: string;

  /** Human-readable error message in English. */
  message: string;
};

export class APIError extends Error implements JSONError {
  type: string;
  code: string;

  constructor(response: JSONError) {
    super(response.message);

    this.type = response.type;
    this.code = response.code;
  }
}
