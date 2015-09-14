var fs = require('fs'),
    isString = require('is-string'),
    isObject = require('is-object'),
    isFunction = require('is-function'),
    path= require('path')
    resolve = require('resolve'),
    trumpet = require('trumpet');

/*
**TODO**
template
If not provided a minimal template is used (see templates/)

If template is a function then it is assumed to be a render function (view :Object) => ReadableStream

If template is a `String` an attempt is made to resolve local npm module (see module resoltion).
If it is not module it is assumed to be the path to a html page template

If template is an Object the render function
*/
module.exports = function(template, cb) {
    if (!template) {
        return cb(null, {
            render: createRenderer()
        });
    }

    if (isFunction(template)) {
        return cb(null, {
            render: template
        })
    }

    if (isObject(template)) {
        return resolveTemplateObj(template, cb);
    }

    if (isString(template)) {
        return resolveModule(template, function (err, moduleTemplate) {
            if (err) { // Template is not a node module, so assume path to page
                return cb(null, {
                    render: createRenderer(template)
                });
            }
            return cb(null, moduleTemplate)
        })
    }

    cb("Bad template " + template)
}

function resolveTemplateObj(template, cb) {
    if (isFunction(template.render)) {
        return cb(null, {
            render: template.render,
            static: template.static
        })
    }
    if (template.module) {
        return resolveModule(template.module, function (err, moduleTemplate) {
            if (err) {
                return cb(err);
            }
            if (template.static) {
                //TODO check if array
                moduleTemplate.static.push(template.static)
            }
            if (template.opts) {
                var render = moduleTemplate.render
                moduleTemplate.render = function (view) {
                    return render(view, template.opts)
                }
            }
            cb(null, moduleTemplate)
        })
    }
    return cb(null, {
        render: createRenderer(template.page),
        static: template.static
    })
}

function resolveModule(name, cb) {
    return resolve(name, { basedir: path.resolve('.') },  function (err, render) {
        if (err) { // Template is not a node module
            return resolveModulePage(name, cb);
        }
        return cb(null, {
            render: require(render),
            static: [path.dirname(render) + '/static/**']
        })
    })
}

function resolveModulePage(name, cb) {
    return resolve(name + '/page.html', { basedir: path.resolve('.') },  function (err, page) {
        if (err) { // `name` is not the path to a template module page, assume path to page instead
            return cb(err)
        }
        return cb(null, {
            render: createRenderer(page),
            static: path.dirname(page) + '/static/**'
        })
    })
}

function createRenderer(page) {
    page = page || __dirname + '/../templates/page.html';
    return function (view) {
        if (!view.title) {
            return fs.createReadStream(page);
        }
        var tr = trumpet();
        tr.selectAll('.title', function (el) {
            el.createWriteStream().end(view.title.toString());
        });
        return fs.createReadStream(page).pipe(tr);
    }
}
