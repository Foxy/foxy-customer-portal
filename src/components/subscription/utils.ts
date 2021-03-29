import { Subscription } from "../../assets/types/Subscription";
import groupNumbers from "group-numbers";

export function toLocaleList(items: string[], lastSeparator = "and") {
  let result = "";

  if (items.length <= 2) {
    result += items.join(` ${lastSeparator} `);
  } else {
    result += items.slice(0, items.length - 1).join(", ");
    result += ` ${lastSeparator} ${items[items.length - 1]}`;
  }

  return result;
}

export function parseDate(yyyyMmDd: string) {
  const [yyyy, mm, dd] = yyyyMmDd.split("-");
  return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
}

export function formatDate(date: Date) {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function getCancelUrl(subscription: Subscription) {
  const subTokenUrl = subscription._links["fx:sub_token_url"].href;
  const subTokenUrlInstance = new URL(subTokenUrl);

  subTokenUrlInstance.searchParams.set("sub_cancel", "true");

  return subTokenUrlInstance.toString();
}

export function getUpdateUrl(subscription: Subscription) {
  const subTokenUrl = subscription._links["fx:sub_token_url"].href;
  const subTokenUrlInstance = new URL(subTokenUrl);

  subTokenUrlInstance.searchParams.set("cart", "checkout");
  subTokenUrlInstance.searchParams.set("sub_restart", "auto");

  return subTokenUrlInstance.toString();
}

export function getRanges(numbers: number[]): number[][] {
  return groupNumbers(numbers, false)
    .map(group => [group[0], group[group.length - 1]])
    .map(group => group.filter((v, i, a) => a.indexOf(v) === i));
}
