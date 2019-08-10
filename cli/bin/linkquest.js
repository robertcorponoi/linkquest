#!/usr/bin/env node

const program = require('commander');
const pkg = require('../../package.json');
const Linkquest = require('../../build/index');

program.version(pkg.version);

program.option('-o, --output <dest>', 'The path to the directory to output the resulting linkquest.json file', process.cwd());
program.option('-h, --host', 'Tells linkquest to the entire host and not just the page', false);
program.option('-s, --silent', 'Hides all console  output', false);

program.parse(process.argv);

const url = program.args[0];

const options = {
  output: program.opts().output,
  host: program.host,
  silent: program.silent
};

const linkquest = new Linkquest(url, options);

linkquest.start();