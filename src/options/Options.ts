'use strict'

import puppeteer from 'puppeteer';

/**
 * The options available for Linkquest along with their default values.
 */
export default class Options {
  /**
   * If you are already using puppeteer you can pass the browser instance so it gets reused.
   * 
   * @property {puppeteer.Browser|null}
   * 
   * @default null
   */
  browser: (puppeteer.Browser | null) = null;

  /**
   * If you are already using puppeteer you can pass the page instance so it gets reused.
   * 
   * @property {puppeteer.Page|null}
   * 
   * @default null
   */
  page: (puppeteer.Page | null) = null;

  /**
   * Indicates whether the entire host should be checked or just the single url provided.
   * 
   * @property {boolean}
   * 
   * @default false
   */
  host: boolean = false;

  /**
   * @param {Object} options The initialization options passed to LinkQuest.
   */
  constructor(options: Object = {}) {
    Object.assign(this, options);
  }
}