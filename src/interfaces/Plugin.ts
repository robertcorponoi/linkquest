'use strict'

/**
 * Defines the properties available when registering a plugin with Linkquest.
 */
export default interface Plugin {

  /**
   * The instance of the plugin.
   * 
   * @property {Function}
   */
  instance: Function;

  /**
   * The options for the plugin.
   * 
   * @property {Object}
   */
  options?: any;

};