<div align="center">

# Linkquest

Linkquest is an easy way to get all of the valid and invalid links on a single page or an entire site.

</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/linkquest.svg?style=flat)](https://www.npmjs.com/package/stringops)
[![Known Vulnerabilities](https://snyk.io/test/github/robertcorponoi/linkquest/badge.svg)](https://snyk.io/test/github/robertcorponoi/stringops)
[![NPM downloads](https://img.shields.io/npm/dm/linkquest.svg?style=flat)](https://www.npmjs.com/package/stringops)
<a href="https://badge.fury.io/js/linkquest"><img src="https://img.shields.io/github/issues/robertcorponoi/linkquest.svg" alt="issues" height="18"></a>
<a href="https://badge.fury.io/js/linkquest"><img src="https://img.shields.io/github/license/robertcorponoi/linkquest.svg" alt="license" height="18"></a>
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/robertcorponoi)

</div>

## **Table of contents**

- [Install](#install)
- [Usage](#usage)
- [Flags](#flags)
- [Examples](#examples)
- [Programmatic Usage](#programmatic-usage)

## **Install**

To install it as a global command to use anywhere you can use:

```shell
$ npm install -g linkquest
```

Otherwise, if you just want to use it programmatically inside of a project, you can install it at a project level:

```shell
$ npm install linkquest
```

## **Usage**

To use linkquest, all you need is the name of the page or site to crawl:

```shell
$ linkquest https://example.com/
```

This will crawl the page and save the output to the current working directory. If you want to instead crawl the whole host, you want to use:

```shell
$ linkquest https://example.com/ -h
```

which uses the host flag to tell linkquest to crawl every page it finds.

## **Flags**

To customize linkquest, you can use a combination of the flags below:

```
linkquest [options] <url>

-o, --output        Specify the directory to save the the "linkquest.json" file that contains the results of the crawl.
-n, --no-follow     Tells linkquest to crawl only the provided url and not the entire host.
-s, --silent        Hides all console output.
```

## **Examples**

Crawling a host and saving the output to a Downloads folder:

```shell
linkquest -o /c/Users/Me/Downloads/ https://example.com/
```

Crawling a single page:

```shell
linkquest -n https://example.com/example
```

## Programmatic Usage

Linkquest can be used programmatically in a similar way with the flags just replacing options:

```js
const Linkquest = require('linkquest');

const options = {
  output: path.resolve(__dirname, 'data'),
  silent: true
};

const linkquest = new Linkquest('https://example.com');

linkquest.start();
```

### Options

The options that can be passed to a new instance of linkquest are the same that can be used as flags along with a couple of puppeteer ones that can be used if you already have instances of the browser and page object you want to reuse.

| param           	| type              	| description                                                                            	| default       	|
|-----------------	|-------------------	|----------------------------------------------------------------------------------------	|---------------	|
| options         	| Object            	|                                                                                        	| {}            	|
| options.browser 	| puppeteer.Browser 	| If you are already using puppeteer you can pass the browser instance so it gets reused 	| null          	|
| options.page    	| puppeteer.Page    	| If you are already using puppeteer you can pass the page instance so it gets reused    	| null          	|
| output          	| string            	| The directory to save the output to                                                    	| process.cwd() 	|
| noFollow        	| boolean           	| If set to true, linkquest will not check the entire host and just the url provided     	| false         	|
| silent          	| boolean           	| If set to true, all console output will be muted                                       	| false         	|

### API

#### **start()**

Starts the crawling of the host or url for links.

## License

MIT