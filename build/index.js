'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ora_1 = __importDefault(require("ora"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const Options_1 = __importDefault(require("./Options"));
/**
 * Linkquest retrieves all links from a host.
 *
 * @author Robert Corponoi <robertcorponoi@gmail.com>
 */
module.exports = class LinkQuest {
    /**
     * @param {string} host The hostname to retrieve links from.
     * @param {Object} [options={}]
     * @param {puppeteer.Browser} [options.browser=null] If you are already using puppeteer you can pass the browser instance so it gets reused.
     * @param {puppeteer.Page} [options.page=null] If you are already using puppeteer you can pass the page instance so it gets reused.
     * @param {string} [options.output=process.cwd()] The path to save the outputted json file to.
     * @param {boolean} [options.host=false] Indicates whether the entire host should be checked or just the single url provided.
     * @param {boolean} [options.silent=false] Indicates whether all output should be muted or not.
     */
    constructor(host, options) {
        /**
         * Keeps track of the links visited and makes sure that no duplicate/unnecessary links are checked.
         *
         * @private
         *
         * @property {Array<string>}
         */
        this.links = [];
        /**
         * Keeps track of bad links that could not be evaluated.
         *
         * @private
         *
         * @property {Array<string>}
         */
        this.badLinks = [];
        /**
         * A reference to the ora terminal spinner.
         *
         * @private
         *
         * @property {*}
         */
        this.spinner = ora_1.default({ text: 'Loading unicorns', spinner: 'dots' });
        this.host = host;
        this.hostname = new URL(this.host).hostname;
        this.options = new Options_1.default(options);
    }
    /**
     * Starts the process of gathering links.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setup();
            if (!this.options.silent)
                this.spinner.start();
            yield this.gatherLinks(this.host, false);
            yield this.browser.close();
            yield this.save();
            this.spinner.stop();
        });
    }
    /**
     * Calls itself recursively to gather and test all of the links of a domain.
     *
     * If a link cannot be navigated to it will push it to the `badLinks` array and otherwise it will push it to
     * the `links` array.
     *
     * If a link is from a different domain it will be navigated to to see if it is valid but it will not go any
     * further than that to avoid endless crawling.
     *
     * @private
     *
     * @async
     *
     * @param {string} url The page url to navigate to.
     */
    gatherLinks(url, stop, referredBy) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.links.includes(url) || this.badLinks.includes(url))
                return;
            this.spinner.text = `Checking ${url}...`;
            try {
                yield this.page.goto(url, { waitUtil: 'networkidle2', timeout: 60000 });
                this.links.push(url);
                if (stop)
                    return;
                const pageLinks = yield this.getUniqueLinks();
                for (const pageLink of pageLinks) {
                    const dontCrawl = !this.hasSameHostname(pageLink) || (url !== this.host && !this.options.host);
                    yield this.gatherLinks(pageLink, dontCrawl, url);
                }
            }
            catch (err) {
                this.badLinks.push(url);
                return;
            }
        });
    }
    /**
     * Setup Puppeteer by either reusing instances from the options if they were provided or creating new
     * instances of the Browser and Page objects.
     *
     * @private
     *
     * @async
     */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.browser)
                this.browser = this.options.browser;
            else
                this.browser = yield puppeteer_1.default.launch();
            if (this.options.page)
                this.page = this.options.page;
            else
                this.page = yield this.browser.newPage();
        });
    }
    /**
     * Gets all of the unique links on the current page.
     *
     * Unique means that it won't be a link that's already been checked or existed.
     *
     * @private
     *
     * @async
     *
     * @returns {Promise<Array<string>>}
     */
    getUniqueLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            const links = yield this.page.$$eval('a', (as) => as.map((a) => a.href));
            return links.filter((v, i, a) => a.indexOf(v) === i);
        });
    }
    /**
     * Checks whether the link is under the same domain as the host or not.
     *
     * @private
     *
     * @param {string} url The URL to check.
     *
     * @returns {boolean} Returns true if the link is under the same domain as the host or false otherwise.
     */
    hasSameHostname(url) {
        const urlHost = new URL(url).hostname;
        if (urlHost === this.hostname)
            return true;
        return false;
    }
    /**
     * Saves the results to a JSON file.
     *
     * @private
     *
     * @async
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const outputPath = path_1.default.resolve(this.options.output) + '/linkquest.json';
            this.spinner.text = `Saving results to ${outputPath}`;
            const output = {
                valid: this.links,
                invalid: this.badLinks,
            };
            yield fs_extra_1.default.outputJSON(outputPath, output);
        });
    }
};
