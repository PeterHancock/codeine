#!/usr/bin/env node

var generateAll = require('../index'),
    generate = require('../lib/generate'),
    args = require('minimist')(process.argv.slice(2)),
    map = require('map-stream'),
    vfs = require('vinyl-fs'),
    resolveTemplate = require('../lib/resolve-template');

if (args._.length) {
    var dest = args.dest || '.'
    var src = args.src || '.'
    vfs.src(args._, { buffer: false , base: src })
        .pipe(generateAll(args))
        .pipe(vfs.dest(dest))
        .on('end', function () {
            //console.error('doc-u-ment: end');
        })
        .on('close', function () {
            //console.error('doc-u-ment: close');
        })
        .on('error', function (err) {
            console.error('doc-u-ment: error', err);
        })

} else {
    resolveTemplate(args.template, function(err, template) {
        args.page = template.page
        process.stdin
            .pipe(generate(args))
            .pipe(process.stdout);
    })
}
