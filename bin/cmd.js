#!/usr/bin/env node

var doc = require('../index'),
    args = require('minimist')(process.argv.slice(2));

process.stdin
    .pipe(doc(args))
    .pipe(process.stdout);
