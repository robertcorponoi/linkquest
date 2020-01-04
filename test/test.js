'use strict'

const test = require('ava');
const Linkquest = require('../build/index');

test('getting a link from the onNavigateToLink signal', async t => {
  const linkquest = new Linkquest('http://example.com/');

  let count = 0;

  linkquest.onNavigateToLink.add((link, isValid) => {
    count++;

    if (count == 2) t.is(link, 'https://www.iana.org/domains/example');
  });

  await linkquest.start();
});

test('getting a valid link from the onNavigateToLink signal', async t => {
  const linkquest = new Linkquest('http://example.com/');

  let count = 0;

  linkquest.onNavigateToLink.add((link, isValid) => {
    count++;

    if (count == 2) t.is(isValid, true);
  });

  await linkquest.start();
});

test('getting the url where linkquest gathered links from the onLinksGathered signal', async t => {
  const linkquest = new Linkquest('http://example.com/');

  linkquest.onLinksGathered.add((url, links) => t.is(url, 'http://example.com/'));

  await linkquest.start();
});

test('getting gathered links from the onLinksGathered signal', async t => {
  const linkquest = new Linkquest('http://example.com/');

  linkquest.onLinksGathered.add((url, links) => t.deepEqual(links, ['https://www.iana.org/domains/example']));

  await linkquest.start();
});

test('getting the correct valid links in the onComplete signal', async t => {
  const linkquest = new Linkquest('http://example.com/');

  const expected = {
    valid: ["http://example.com/", "https://www.iana.org/domains/example"],
    invalid: []
  };

  linkquest.onComplete.add((validLinks, invalidLinks) => t.deepEqual(validLinks, expected.valid));

  await linkquest.start();
});

test('getting the correct invalid links in the onComplete signal', async t => {
  const linkquest = new Linkquest('http://example.com/');

  const expected = {
    valid: ["http://example.com/", "https://www.iana.org/domains/example"],
    invalid: []
  };

  linkquest.onComplete.add((validLinks, invalidLinks) => t.deepEqual(invalidLinks, expected.invalid));

  await linkquest.start();
});