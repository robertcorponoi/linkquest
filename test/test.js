'use strict'

const test = require('ava');
const fs = require('fs-extra');
const Linkquest = require('../build/index');

test('Gather links from a host and write to a JSON file', async t => {

  const linkquest = new Linkquest('http://example.com/', { silent: true });

  await linkquest.start();

  const results = await fs.readJSON('./linkquest.json');

  const expected = {
    valid: ["http://example.com/", "https://www.iana.org/domains/example"],
    invalid: []
  };

  t.deepEqual(results, expected);

});