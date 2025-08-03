import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import Scraper from "@/lib/global-scraper";

chromium.setGraphicsMode = false;

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log(data);
  // load local instance of chromium
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: {
      deviceScaleFactor: 1,
      hasTouch: false,
      height: 1080,
      isLandscape: true,
      isMobile: false,
      width: 1920,
    },
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath("")),
    headless: "shell",
  });

  const inputs = [
    {
      url: "https://bajratechnologies.com/jobs",
      keyword: "Technical Content Writer",
    },
    {
      url: "https://www.lftechnology.com/careers",
      keyword: "lead ai engineer",
    },
    {
      url: "https://progressivelabs.tech/vacancy",
      keyword: "software Engineer",
    },
  ];

  const returnData = await Promise.all(
    inputs.map(async (item) => {
      const page = await browser.newPage();
      const result = await Scraper(page, {
        url: item.url,
        keyword: item.keyword,
        contextLength: 800,
      });
      await page.close();
      return result;
    })
  );

  await browser.close();

  // Combine all results into a single object
  const combined = Object.assign({}, ...returnData);

  return NextResponse.json({ message: combined });
}
