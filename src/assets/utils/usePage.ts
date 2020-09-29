import { newE2EPage, E2EPage } from "@stencil/core/testing";

type Handler<T> = (context: T) => Promise<any>;

type PageContext = {
  page: E2EPage;
};

const maxRetries = 3;

export async function usePage(cb: Handler<PageContext>) {
  let error: Error;

  for (let i = 0; i < maxRetries; ++i) {
    try {
      const page = await newE2EPage({
        url: "/index.e2e.html",
        context: "new"
      });

      await cb({ page });
      await page.close().catch(() => 0);

      return;
    } catch (e) {
      error = e;
    }
  }

  throw error;
}
