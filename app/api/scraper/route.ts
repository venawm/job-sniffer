import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer, { Page } from "puppeteer-core";

// Disable WebGL (optional)
chromium.setGraphicsMode = false;

export async function GET() {
  let data = [];
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
  };

  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: viewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath("")),
    headless: "shell",
  });

  const page = await browser.newPage();

  //   [
  //     { url: "http://ebpearls.com.au/careers", keyword: "frontend" },
  //     {
  //       url: "https://www.lftechnology.com/careers",
  //       keyword: "lead ai engineer",
  //     },
  //   ].map((index, item) => {
  //     console.log(index, item);
  //   });
  // ✅ Call scraper with options
  await Scraper(page, {
    url: "https://www.lftechnology.com/careers",
    keyword: "lead ai engineer",
    contextLength: 200,
  });
  await browser.close();

  return NextResponse.json({ message: "Scraping completed." });
}

interface ScraperOptions {
  keyword: string;
  url: string;
  contextLength?: number;
}

async function Scraper(page: Page, options: ScraperOptions): Promise<void> {
  const { keyword, url, contextLength = 200 } = options;

  await page.goto(url, { waitUntil: "networkidle2" });

  let indexes = [];

  const html: string = await page.content();
  const lowerKeyword = keyword.toLowerCase();
  const lowerHtml: string = html.toLowerCase();
  let index: number = 0;

  while (true) {
    const foundIndex = lowerHtml.indexOf(lowerKeyword, index);
    if (foundIndex === -1) break;

    indexes.push(foundIndex);

    // Move index forward to continue searching
    index = foundIndex + lowerKeyword.length;
  }
  console.log(indexes);

  if (index !== -1) {
    const contextStart: number = Math.max(index - contextLength, 0);
    const contextEnd: number = Math.min(
      index + keyword.length + contextLength,
      html.length
    );
    const context: string = html.slice(contextStart, contextEnd);

    const link = context.indexOf("href");
    const linkEnd = context.slice(link, context.length).indexOf(`"`);
    const hrefIndex = context.indexOf('href="');
    if (hrefIndex !== -1) {
      const start = hrefIndex + 6; // length of 'href="'
      const end = context.indexOf('"', start); // find closing quote
      const extractedUrl = context.slice(start, end);
      console.log("🔗 Found link:", extractedUrl);
    } else {
      console.log("❌ No href found in context.");
    }
    console.log(link, linkEnd);

    console.log("✅ Found keyword with context:\n");
  } else {
    console.log("❌ Keyword not found.");
  }
}
