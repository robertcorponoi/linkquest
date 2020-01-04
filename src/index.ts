'use strict'

import puppeteer from 'puppeteer';
import Hypergiant from 'hypergiant';

import Options from './options/Options';
import Plugin from './interfaces/Plugin';

/**
 * Linkquest is an easy way to get all of the valid and invalid links on a single page or an entire site.
 */
module.exports = class LinkQuest {

  /**
   * The host to retrieve links from.
   * 
   * @private
   * 
   * @property {string}
   */
  private _host: string;

  /**
   * A reference to the options for this instance.
   * 
   * @private
   * 
   * @property {Options}
   */
  private _options: Options;

  /**
   * A reference to the puppeteer browser object.
   * 
   * @private
   * 
   * @property {*}
   */
  private _browser: any;

  /**
   * A reference to the puppeteer page object.
   * 
   * @private
   * 
   * @property {*}
   */
  private _page: any;

  /**
   * Keeps track of the links visited and makes sure that no duplicate/unnecessary links are checked.
   * 
   * @private
   * 
   * @property {Array<string>}
   */
  private _links: Array<string> = [];

  /**
   * Keeps track of bad links that could not be evaluated.
   * 
   * @private
   * 
   * @property {Array<string>}
   */
  private _badLinks: Array<string> = [];

  /**
   * The host name to stick to.
   * 
   * @private
   * 
   * @property {string}
   */
  private _hostname: string;

  /**
   * The plugins that have been passed to linkquest.
   * 
   * @private
   * 
   * @property {Array<Plugin>}
   */
  private _plugins: Array<Plugin> = [];

  /**
   * A reference to the signal that gets dispatched when a link is navigated to.
   * 
   * This data contained in this signal is the url that was navigated to and whether or not it is a valid link.
   * 
   * @private
   * 
   * @property {Hypergiant}
   */
  private _onNavigateToLink: Hypergiant = new Hypergiant();

  /**
   * A reference to the signal that gets dispatched when all of the links on a page are gathered.
   * 
   * The data contained in this signal is the page that the links were gathered from and an array of the links that have been gathered from that page.
   * 
   * @private
   * 
   * @property {Hypergiant}
   */
  private _onLinksGathered: Hypergiant = new Hypergiant();

  /**
   * A reference to the signal that gets dispatched when Linkquest is done gathering links.
   * 
   * The data contained in this signal is the list of valid and invalid urls.
   * 
   * @private
   * 
   * @property {Hypergiant}
   */
  private _onComplete: Hypergiant = new Hypergiant();

  /**
   * @param {string} host The hostname to retrieve links from.
   * @param {Object} [options={}]
   * @param {puppeteer.Browser} [options.browser=null] If you are already using puppeteer you can pass the browser instance so it gets reused.
   * @param {puppeteer.Page} [options.page=null] If you are already using puppeteer you can pass the page instance so it gets reused.
   * @param {boolean} [options.host=false] Indicates whether the entire host should be checked or just the single url provided.
   */
  constructor(host: string, options?: Object) {
    this._host = host;

    this._hostname = new URL(this._host).hostname;

    this._options = new Options(options);
  }

  /**
   * Returns the onNavigateToLink signal.
   * 
   * @returns {Hypergiant}
   */
  get onNavigateToLink(): Hypergiant { return this._onNavigateToLink; }

  /**
   * Returns the onLinksGathered signal.
   * 
   * @returns {Hypergiant}
   */
  get onLinksGathered(): Hypergiant { return this._onLinksGathered; }

  /**
   * Returns the onComplete signal.
   * 
   * @returns {Hypergiant}
   */
  get onComplete(): Hypergiant { return this._onComplete; }

  /**
   * Starts the process of gathering links.
   */
  async start() {
    await this.setup();

    await this.gatherLinks(this._host, false);

    await this._browser.close();
  }

  /**
   * Registers a Linkquest plugin.
   * 
   * @param {Object} plugin The plugin to register.
   * @param {Object} options The options to pass to the plugin.
   */
  register(plugin: any, options: Object) {
    const pl: Plugin = { instance: plugin, options: options };

    this._plugins.push(pl);
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
  private async gatherLinks(url: string, stop: boolean, referredBy?: string) {
    // If the link has already been checked, we can skip it.
    if (this._links.includes(url) || this._badLinks.includes(url)) return;

    // Since we are not sure that we can navigate to every link, we have to try/catch.
    try {
      // Navigate to the link with a long timeout.
      await this._page.goto(url, { waitUtil: 'networkidle2', timeout: 60000 });

      // Push it to the links array so that it won't be checked again.
      this._links.push(url);

      // Dispatch the onNavigateToLink signal with a valid link.
      this.onNavigateToLink.dispatch(url, true);

      // At this point we can let plugins do their thing.
      for (const plugin of this._plugins) await plugin.instance(plugin.options);

      // If we are supposed to stop checking for links we stop now.
      if (stop) {
        // Dispatch the onComplete signal since we are done.
        this.onComplete.dispatch(this._links, this._badLinks);
        
        return;
      }

      // Otherwise, we get the unique links from the current page that we are on.
      const pageLinks: Array<string> = await this.getUniqueLinks();

      // Dispatch the onLinksGathered signal.
      this.onLinksGathered.dispatch(url, pageLinks);

      // For each link we find, we check to see if it's from the same host or not and recursively check each link we find.
      for (const pageLink of pageLinks) {
        const dontCrawl: boolean = !this.hasSameHostname(pageLink) || (url !== this._host && !this._options.host);

        await this.gatherLinks(pageLink, dontCrawl, url);
      }
    } catch (err) {
      // The url could not be navigated to so we 
      this._badLinks.push(url);

      // Dispatch the onNavigateToLink signal with an invalid link.
      this.onNavigateToLink.dispatch(url, false);

      return;
    }
  }

  /**
   * Setup Puppeteer by either reusing instances from the options if they were provided or creating new
   * instances of the Browser and Page objects.
   * 
   * @private
   * 
   * @async
   */
  private async setup() {
    if (this._options.browser) this._browser = this._options.browser;
    else this._browser = await puppeteer.launch();

    if (this._options.page) this._page = this._options.page;
    else this._page = await this._browser.newPage();

    for (const plugin of this._plugins) if (!plugin.options.page) plugin.options.page = this._page;
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
  private async getUniqueLinks(): Promise<Array<string>> {
    const links: Array<string> = await this._page.$$eval('a', (as: Array<HTMLAnchorElement>) => as.map((a: HTMLAnchorElement) => a.href));

    return links.filter((v, i, a) => a.indexOf(v) === i);
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
  private hasSameHostname(url: string): boolean {
    const urlHost: string = new URL(url).hostname;

    if (urlHost === this._hostname) return true;

    return false;
  }
}