'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The options available for Linkquest along with their default values.
 */
class Options {
    /**
     * @param {Object} options The initialization options passed to LinkQuest.
     */
    constructor(options = {}) {
        /**
         * If you are already using puppeteer you can pass the browser instance so it gets reused.
         *
         * @property {puppeteer.Browser|null}
         *
         * @default null
         */
        this.browser = null;
        /**
         * If you are already using puppeteer you can pass the page instance so it gets reused.
         *
         * @property {puppeteer.Page|null}
         *
         * @default null
         */
        this.page = null;
        /**
         * Indicates whether the entire host should be checked or just the single url provided.
         *
         * @property {boolean}
         *
         * @default false
         */
        this.host = false;
        Object.assign(this, options);
    }
}
exports.default = Options;
