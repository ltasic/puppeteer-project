"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
class PriceScraper {
    constructor(url) {
        this.url = url;
        this.browser = null;
        this.page = null;
    }
    async startScraping() {
        let scrapedData = [];
        try {
            await this.launchBrowser();
            await this.openPage();
            scrapedData = await this.scrapePrices();
        }
        catch (error) {
            console.error("Error occurred during scraping:", error);
        }
        finally {
            await this.closeBrowser();
        }
        return scrapedData;
    }
    async storeDataAsJson(data, filePath) {
        try {
            await fs_1.default.promises.writeFile(filePath, JSON.stringify(data, null, 2));
            console.log("Data has been stored as JSON successfully.");
        }
        catch (error) {
            console.error("Error occurred while storing data as JSON:", error);
        }
    }
    validateMappedObject(mappedObject) {
        if (typeof mappedObject !== "object" || mappedObject === null) {
            return false;
        }
        for (const key in mappedObject) {
            if (!mappedObject.hasOwnProperty(key))
                continue;
            const item = mappedObject[key];
            if (typeof item !== "object" ||
                !item.hasOwnProperty("price") ||
                !item.hasOwnProperty("shopName") ||
                !item.hasOwnProperty("position")) {
                return false;
            }
        }
        return true;
    }
    async launchBrowser() {
        this.browser = await puppeteer_1.default.launch({
            headless: false,
            defaultViewport: null,
        });
    }
    async openPage() {
        if (!this.browser)
            return;
        this.page = await this.browser.newPage();
        await this.page.goto(this.url, {
            waitUntil: "domcontentloaded",
        });
        await this.page.waitForSelector(".productOffers-listItem");
    }
    async scrapePrices() {
        let scrapedData = [];
        if (!this.page)
            return scrapedData;
        scrapedData = await this.page.evaluate(() => {
            const offers = document.querySelectorAll(".productOffers-listItem");
            const payload = [];
            offers.forEach((offer) => {
                const priceElement = offer.querySelector(".productOffers-listItemOfferPrice");
                const shopNameElement = offer.querySelector(".productOffers-listItemOfferShopV2LogoLink");
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
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
const url = "https://www.idealo.de/preisvergleich/OffersOfProduct/201846460_-aspirin-plus-c-forte-800-mg-480-mg-brausetabletten-bayer.html";
const scraper = new PriceScraper(url);
scraper.startScraping().then((scrapedData) => {
    const mappedObject = scrapedData.reduce((result, element, index) => {
        result[(index + 1).toString()] = element;
        return result;
    }, {});
    if (scraper.validateMappedObject(mappedObject)) {
        scraper.storeDataAsJson(mappedObject, "scraped_data.json");
    }
    else {
        console.error("Mapped object does not match the required format.");
    }
});
//# sourceMappingURL=index.js.map