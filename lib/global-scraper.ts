import { Page } from "puppeteer-core";

interface ScraperOptions {
  keyword: string;
  url: string;
  contextLength: number;
}

async function Scraper(
  page: Page,
  options: ScraperOptions
): Promise<{ [key: string]: string[] }> {
  const { keyword, url, contextLength } = options;

  //   set a timeout of 30 seconds
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  const html = await page.content();
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedKeyword, "gi");

  const matches = [...html.matchAll(regex)];

  if (matches.length === 0) {
    return { [url]: [] };
  }

  //   return the html near the context of the found element
  const contextWindows = matches.map((match) => {
    const foundIndex = match.index!;
    const start = Math.max(0, foundIndex - contextLength);
    const end = Math.min(
      html.length,
      foundIndex + keyword.length + contextLength
    );
    return html.slice(start, end).trim();
  });

  //   extract the links from the context
  const links = contextWindows.map((text) => {
    const index = text.indexOf("href");
    if (index === -1) return null;

    const startQuote = text.indexOf('"', index + 4);
    if (startQuote === -1) return null;

    const endQuote = text.indexOf('"', startQuote + 1);
    if (endQuote === -1) return null;

    const hrefValue = text.slice(startQuote + 1, endQuote);
    if (hrefValue[0] !== "h") {
      return url + hrefValue;
    }
    return hrefValue;
  });

  return { [url]: links.filter((link): link is string => link !== null) };
}

export default Scraper;
