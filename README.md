<div align="center">

# Linkquest

Linkquest is an easy way to get all of the valid and invalid links on a single page or an entire site.

</div>

<div align="center">

  [![NPM version](https://img.shields.io/npm/v/linkquest.svg?style=flat)](https://www.npmjs.com/package/linkquest)
  [![Known Vulnerabilities](https://snyk.io/test/github/robertcorponoi/linkquest/badge.svg)](https://snyk.io/test/github/robertcorponoi/linkquest)
  ![npm](https://img.shields.io/npm/dt/linkquest)
  [![NPM downloads](https://img.shields.io/npm/dm/linkquest.svg?style=flat)](https://www.npmjs.com/package/linkquest)
  <a href="https://badge.fury.io/js/linkquest"><img src="https://img.shields.io/github/issues/robertcorponoi/linkquest.svg" alt="issues" height="18"></a>
  <a href="https://badge.fury.io/js/linkquest"><img src="https://img.shields.io/github/license/robertcorponoi/linkquest.svg" alt="license" height="18"></a>
  [![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/robertcorponoi)

</div>

## **Install**

To install Linkquest, simply use:

```bash
$ npm install linkquest
```

## Usage

**Note:** There have been major changes in how Linkquest works in v1.0.0. If you are looking for the old functionality, you might be looking for [linkquest-cli](https://github.com/robertcorponoi/linkquest-cli).

To use Linkquest in your project, simply create a new instance of it passing the url of the site to gather links from and then calling the start method:

```js
const Linkquest = require('linkquest');

const linkquest = new Linkquest('https://example.com');

await linkquest.start();
```

The options that can be passed to a new instance of linkquest are as follows:

| param           	| type              	| description                                                                            	| default       	|
|-----------------	|-------------------	|----------------------------------------------------------------------------------------	|---------------	|
| options         	| Object            	|                                                                                        	| {}            	|
| options.browser 	| puppeteer.Browser 	| If you are already using puppeteer you can pass the browser instance so it gets reused 	| null          	|
| options.page    	| puppeteer.Page    	| If you are already using puppeteer you can pass the page instance so it gets reused    	| null          	|
| noFollow        	| boolean           	| If set to true, linkquest will not check the entire host and just the url provided     	| false         	|

## **API**

#### **start**

Starts the crawling of the host or url for links. Note that this is an async method.

**example:**

```js
const Linkquest = require('linkquest');

const linkquest = new Linkquest('https://example.com');

await linkquest.start();
```

### **register**

Linkquest supports a plugin infrastructure that allows you to hook into each page that's processed by Linkquest and complete a task. The register method registers a linkquest-plugin with linkquest so it can be used.

| param   	| type   	| description                                                                                                   	| default 	|
|---------	|--------	|---------------------------------------------------------------------------------------------------------------	|---------	|
| plugin  	| Plugin 	| The plugin to register                                                                                        	|         	|
| options 	| Object 	| The options to pass to the plugin. See the documentation on the plugin's page for what options are available. 	|         	|

**Example**

Below is an example of registering the `linquest-screenshot` plugin:

```js
const linkquest = new Linkquest('http://example.com/', { silent: true });

linkquest.register(require('linkquest-screenshot'), {
  output: path.resolve(__dirname, 'screenshots'),
  sizes: {
    mobile: {
      pixel: [411, 731],
      iphone: [375, 812]
    },
    tablet: {
      ipad: [768, 1024],
      galaxy: [360, 640]
    },
    desktop: {
      hdr: [1920, 1080]
    }
  }
});

await linkquest.start();
```

## **Signals**

Linkquest offers the ability to respond to certain events using signals.

The following signals are dispatched by Linkquest:

### **onNavigateToLink**

This signal is dispatched when a link is navigated to.

This data contained in this signal is the url that was navigated to and whether or not it is a valid link.

**example:**

```js
const linkquest = new Linkquest('http://example.com/');

linkquest.onNavigateToLink.add((link, isValid) => {
  console.log(link, isValid);
});

await linkquest.start();
```

### **onLinksGathered**

This signal is dispatched when all of the links on a page are gathered.

The data contained in this signal is the page that the links were gathered from and an array of the links that have been gathered from that page.

**example:**

```js
const linkquest = new Linkquest('http://example.com/');

linkquest.onLinksGathered.add((url, links) => {
  console.log(url, links);
});

await linkquest.start();
```

### **onComplete**

This signal is dispatched when Linkquest is done gathering links.

The data contained in this signal is the list of valid and invalid urls.

**example:**

```js
const linkquest = new Linkquest('http://example.com/');

linkquest.onComplete.add((validLinks, invalidLinks) => {
  console.log(validLinks, invalidLinks);
});

await linkquest.start();
```

## **Tests**

To run the tests available for Linkquest, use:

```bash
$ npm run test
```

## **License**

MIT