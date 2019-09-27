'use strict'

import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import puppeteer from 'puppeteer';

import Options from './Options';
import Plugin from './interfaces/Plugin';

/**
 * Linkquest retrieves all links from a host.
 * 
 * @author Robert Corponoi <robertcorponoi@gmail.com>
 */
module.exports = class LinkQuest {

  /**
   * The host to retrieve links from.
   * 
   * @private
   * 
   * @property {string}
   */
  private host: string;

  /**
   * A reference to the options for this instance.
   * 
   * @private
   * 
   * @property {Options}
   */
  private options: Options;

  /**
   * A reference to the puppeteer browser object.
   * 
   * @private
   * 
   * @property {*}
   */
  private browser: any;

  /**
   * A reference to the puppeteer page object.
   * 
   * @private
   * 
   * @property {*}
   */
  private page: any;

  /**
   * Keeps track of the links visited and makes sure that no duplicate/unnecessary links are checked.
   * 
   * @private
   * 
   * @property {Array<string>}
   */
  private links: Array<string> = [];

  /**
   * Keeps track of bad links that could not be evaluated.
   * 
   * @private
   * 
   * @property {Array<string>}
   */
  private badLinks: Array<string> = [];

  /**
   * The host name to stick to.
   * 
   * @private
   * 
   * @property {string}
   */
  private hostname: string;

  /**
   * A reference to the ora terminal spinner.
   * 
   * @private
   * 
   * @property {*}
   */
  private spinner: any = ora({ text: 'Loading unicorns', spinner: 'dots' });

  /**
   * The plugins that have been passed to linkquest.
   * 
   * @private
   * 
   * @property {Array<Plugin>}
   */
  private plugins: Array<Plugin> = [];

  /**
   * @param {string} host The hostname to retrieve links from.
   * @param {Object} [options={}]
   * @param {puppeteer.Browser} [options.browser=null] If you are already using puppeteer you can pass the browser instance so it gets reused.
   * @param {puppeteer.Page} [options.page=null] If you are already using puppeteer you can pass the page instance so it gets reused.
   * @param {string} [options.output=process.cwd()] The path to save the outputted json file to.
   * @param {boolean} [options.host=false] Indicates whether the entire host should be checked or just the single url provided.
   * @param {boolean} [options.silent=false] Indicates whether all output should be muted or not.
   */
  constructor(host: string, options?: Object) {

    this.host = host;

    this.hostname = new URL(this.host).hostname;

    this.options = new Options(options);

  }

  /**
   * Starts the process of gathering links.
   */
  async start() {

    await this.setup();

    if (!this.options.silent) this.spinner.start();

    await this.gatherLinks(this.host, false);

    await this.browser.close();

    await this.save();

    this.spinner.stop();

  }

  /**
   * Registers a Linkquest plugin.
   * 
   * @param {Object} plugin The plugin to register.
   * @param {Object} options The options to pass to the plugin.
   */
  register(plugin: any, options: Object) {

    const pl: Plugin = { instance: plugin, options: options };

    this.plugins.push(pl);

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

    if (this.links.includes(url) || this.badLinks.includes(url)) return;

    this.spinner.text = `Checking ${url}...`;

    try {

      await this.page.goto(url, { waitUtil: 'networkidle2', timeout: 60000 });

      this.links.push(url);

      for (const plugin of this.plugins) await plugin.instance(plugin.options);

      if (stop) return;

      const pageLinks: Array<string> = await this.getUniqueLinks();

      for (const pageLink of pageLinks) {

        const dontCrawl: boolean = !this.hasSameHostname(pageLink) || (url !== this.host && !this.options.host);

        await this.gatherLinks(pageLink, dontCrawl, url);

      }

    } catch (err) {

      this.badLinks.push(url);

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

    if (this.options.browser) this.browser = this.options.browser;
    else this.browser = await puppeteer.launch();

    if (this.options.page) this.page = this.options.page;
    else this.page = await this.browser.newPage();

    for (const plugin of this.plugins) if (!plugin.options.page) plugin.options.page = this.page;

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

    const links: Array<string> = await this.page.$$eval('a', (as: Array<HTMLAnchorElement>) => as.map((a: HTMLAnchorElement) => a.href));

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

    if (urlHost === this.hostname) return true;

    return false;

  }

  /**
   * Saves the results to a JSON file.
   * 
   * @private
   * 
   * @async
   */
  private async save() {

    const outputPath: string = path.resolve(this.options.output) + '/linkquest.json';

    this.spinner.text = `Saving results to ${outputPath}`;

    const output = {

      valid: this.links,

      invalid: this.badLinks,

    };

    await fs.outputJSON(outputPath, output);

  }

}