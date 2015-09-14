var fs = require('fs'),
    isString = require('is-string'),
    isObject = require('is-object'),
    isFunction = require('is-function'),
    path= require('path')
    resolve = require('resolve'),
    trumpet = require('trumpet');

/*
# render-template

This module exports a function for resolving the template `Object` that encapsulates the .html template render the document,
along with any static assets referenced by the document.

The template param can be the path (`String`) of a page.html template or the name of module
 that encapsulates a custom render `function` and a collection of static assets

A render function is passed a view `Object` and returns a `ReadableStream` of the
[html-template](https://github.com/substack/html-template) template that will be used to render the final output.

This 2-phase approach allows for any custom logic to be applied before the commented code is merged.


## resolveTemplate

calls

```
cb(null, template: Object)
```
where `template` is resolved from the `template` parameter

*/
module.exports = function resolveTemplate(template, cb) {
    /*
If template is `falsey` then a default miminimist template is used
 */
    if (!template) {
        return cb(null, {
            render: createRenderer()
        });
    }

    /*
Of template is a `function` it is used as the `render` function.
    */
    if (isFunction(template)) {
        return cb(null, {
            render: template
        })
    }

/*
If the template is an object
*/
    if (isObject(template)) {
        return resolveTemplateObj(template, cb);
    }

/*
Is the template a file path to a temlpate, or a module?
*/
    if (isString(template)) {
        return resolveModule(template, function (err, moduleTemplate) {
            if (err) {
/*
`template` was not `resolve`d to an NPM module, so should be the path to `page.html` template.
*/
                return cb(null, {
                    render: createRenderer(template)
                });
            }
            return cb(null, moduleTemplate)
        })
    }
/*
Bad configuration
*/
    cb("Illegal template: " + template)
}

/*
## helper `function`s
*/
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
