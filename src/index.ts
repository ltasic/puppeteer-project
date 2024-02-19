import puppeteer from "puppeteer";
import fs from "fs";

class PriceScraper {
  private url: string;
  private browser: any;
  private page: any;

  constructor(url: string) {
    this.url = url;
    this.browser = null;
    this.page = null;
  }

  public async startScraping(): Promise<any[]> {
    let scrapedData: any[] = [];
    try {
      await this.launchBrowser();
      await this.openPage();
      scrapedData = await this.scrapePrices();
    } catch (error) {
      console.error("Error occurred during scraping:", error);
    } finally {
      await this.closeBrowser();
    }
    return scrapedData;
  }

  public async storeDataAsJson(data: any, filePath: string): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log("Data has been stored as JSON successfully.");
    } catch (error) {
      console.error("Error occurred while storing data as JSON:", error);
    }
  }

  public validateMappedObject(mappedObject: any): boolean {
    if (typeof mappedObject !== "object" || mappedObject === null) {
      return false;
    }

    for (const key in mappedObject) {
      if (!mappedObject.hasOwnProperty(key)) continue;

      const item = mappedObject[key];

      if (
        typeof item !== "object" ||
        !item.hasOwnProperty("price") ||
        !item.hasOwnProperty("shopName") ||
        !item.hasOwnProperty("position")
      ) {
        return false;
      }
    }

    return true;
  }

  private async launchBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  }

  private async openPage(): Promise<void> {
    if (!this.browser) return;

    this.page = await this.browser.newPage();
    await this.page.goto(this.url, {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForSelector(".productOffers-listItem");
  }

  private async scrapePrices(): Promise<any[]> {
    let scrapedData: any[] = [];
    if (!this.page) return scrapedData;

    scrapedData = await this.page.evaluate(() => {
      const offers = document.querySelectorAll(".productOffers-listItem");
      const payload: any[] = [];

      offers.forEach((offer: any) => {
        const priceElement = offer.querySelector(
          ".productOffers-listItemOfferPrice"
        );
        const shopNameElement = offer.querySelector(
          ".productOffers-listItemOfferShopV2LogoLink"
        );
        const position = shopNameElement.getAttribute("data-gtm-payload")
          ? JSON.parse(shopNameElement.getAttribute("data-gtm-payload"))
              .position
          : null;
        const shopName = shopNameElement.getAttribute("data-shop-name");

        if (priceElement) {
          const price = priceElement.innerText.trim().split("\n")[0];
          payload.push({ price, shopName, position });
        }
      });

      return payload;
    });

    return scrapedData;
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const url =
  "https://www.idealo.de/preisvergleich/OffersOfProduct/201846460_-aspirin-plus-c-forte-800-mg-480-mg-brausetabletten-bayer.html";
const scraper = new PriceScraper(url);
scraper.startScraping().then((scrapedData) => {
  const mappedObject = scrapedData.reduce((result, element, index) => {
    result[(index + 1).toString()] = element;
    return result;
  }, {});

  if (scraper.validateMappedObject(mappedObject)) {
    scraper.storeDataAsJson(mappedObject, "scraped_data.json");
  } else {
    console.error("Mapped object does not match the required format.");
  }
});
