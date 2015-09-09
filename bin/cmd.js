#!/usr/bin/env node

var fs = require('fs-extra'),
    path = require('path'),
    doc = require('../index'),
    args = require('minimist')(process.argv.slice(2)),
    map = require('map-stream'),
    through = require('through2'),
    vfs = require('vinyl-fs'),
    resolve = require('resolve');

if (args._.length) {
    args.dest = args.dest || '.'
    if (args.page) {
        resolve(args.page + '/page.html', { basedir: path.resolve('.') },  function (err, page) {
            if (!err) {
                args.page = page
                copyStatic(path.dirname(page) + '/static', args.dest)
            }
            generate(args)
        })
    } else {
        generate(args)
    }

} else {
    process.stdin
        .pipe(doc(args))
        .pipe(process.stdout);
}

function generate(args) {
    var src = args.src || '.'
    vfs.src(args._, { buffer: false , cwd: src, base: src})
        .pipe(map(function (f, cb) {
            f.path = f.path.replace(/\.js$/,'.html')
            f.contents = f.contents.pipe(doc(args))
                //Why do we have to do this?
                .pipe(through());
            cb(null, f)
        }))
        .pipe(vfs.dest(args.dest))
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
