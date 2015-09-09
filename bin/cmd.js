#!/usr/bin/env node

var fs = require('fs-extra'),
    path = require('path'),
    generateAll = require('../index'),
    generate = require('../lib/generate'),
    args = require('minimist')(process.argv.slice(2)),
    map = require('map-stream'),
    through = require('through2'),
    vfs = require('vinyl-fs'),
    resolveTemplate = require('../lib/resolve-template');

if (args._.length) {
    var dest = args.dest || '.'
    var src = args.src || '.'
    vfs.src(args._, { buffer: false , cwd: src, base: src})
        .pipe(generateAll(args))
        .pipe(vfs.dest(dest))
        .pipe(map(function (f, cb) {
            //console.error('doc-u-ment: processed', f.path);
            cb(null, f);
        }))
        .on('end', function () {
            console.error('doc-u-ment: end');
        })
        .on('close', function () {
            console.error('doc-u-ment: close');
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
    
function copyStatic(src, dest) {
    fs.exists(src, function (exists) {
        if (exists) {
            fs.copy(src, dest, function (err) {
                if (err) {
                    console.error(err)
                }
            })
        }
    })
}
