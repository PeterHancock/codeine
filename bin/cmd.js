#!/usr/bin/env node

var generateAll = require('../index'),
    generate = require('../lib/generate'),
    args = require('minimist')(process.argv.slice(2)),
    map = require('map-stream'),
    vfs = require('vinyl-fs'),
    resolveTemplate = require('../lib/resolve-template'),
    isObject = require('is-object');

if (args._.length) {
    var dest = args.dest || '.'
    var src = args.src || '.'
    vfs.src(args._, { buffer: false , base: src })
        .pipe(generateAll(args))
        .pipe(vfs.dest(dest))
        .on('end', function () {
            //console.error('codeine: end');
        })
        .on('close', function () {
            //console.error('codeine: close');
        })
        .on('error', function (err) {
            console.error('codeine: error', err);
        })

} else {
    if (args.server) {
        args.server = isObject(args.server) ? args.server : {}
        require('../lib/server')(args)
    } else {
        process.stdin
            .pipe(generate(args))
            .pipe(process.stdout);
    }

}
