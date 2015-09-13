var fs = require('fs'),
    isObject = require('is-object'),
    isFunction = require('is-function'),
    path= require('path')
    resolve = require('resolve'),
    trumpet = require('trumpet');

module.exports = function(template, cb) {
    if (!template) {
        return cb(null, {
            render: templateStream()
        });
    }

    if (isFunction(template)) {
        return cb(null, {
            render: template
        })
    }

    if (isObject(template)) {
        const render = isFunction(template.render) ? template.render : templateStream(template.page)
        return cb(null, {
            render: render,
            static: template.static
        })
    }

    // Test if template is an npm module
    return resolve(template, { basedir: path.resolve('.') },  function (err, render) {
        if (err) { // Template is not a node module
            return resolvePageHtml();
        }
        return cb(null, {
            render: require(render),
            static: path.dirname(render) + '/static'
        })
    })

    function resolvePageHtml(){
        return resolve(template + '/page.html', { basedir: path.resolve('.') },  function (err, page) {
            if (err) { // template is not the path to a template  module, assume pagee html path
                return cb(null, {
                    render: templateStream(template)
                })
            }
            return cb(null, {
                render: templateStream(page),
                static: path.dirname(page) + '/static'
            })
        })
    }
}

function templateStream(template) {
    template = template || __dirname + '/../templates/page.html';
    return function (view) {
        if (!view.title) {
            return fs.createReadStream(template);
        }
        var tr = trumpet();
        tr.selectAll('.title', function (el) {
            el.createWriteStream().end(view.title.toString());
        });
        return fs.createReadStream(template).pipe(tr);
    }
}
