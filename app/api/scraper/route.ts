import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// Optional: If you'd like to disable webgl, true is the default.
chromium.setGraphicsMode = false;

export async function GET() {
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
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://bc-nepal.t3.storageapi.dev/chromium-v138.0.2-pack.x64.tar"
      )),
    headless: "shell",
  });
  const page = await browser.newPage();
  await page.goto("https://www.pandey-samir.com.np");
  const pageTitle = await page.title();
  await browser.close();
  return NextResponse.json({ message: pageTitle });
}
