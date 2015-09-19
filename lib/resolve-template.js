var fs = require('fs'),
    isString = require('is-string'),
    isObject = require('is-object'),
    isFunction = require('is-function'),
    path= require('path')
    resolve = require('resolve'),
    trumpet = require('trumpet');

/*
# render-template

This module exports a function for resolving the template `Object` that encapsulates the .html template for rendering the document,
along with any static assets referenced by the document.

The template param can be the path (`String`) of a page.html template or the name of module
 that encapsulates a custom render `function` and a collection of static assets

A render function is passed a view `Object` and an optional user-provided config `Object, returning a `ReadableStream` of the
[html-template](https://github.com/substack/html-template) template for rendering the final output.

This two-phase approach allows for any custom logic to be applied before the commented code is merged.

## resolveTemplate

calls

```
cb(null, template: Object)
```
where `template` is resolved from the `template` parameter

*/
module.exports = function resolveTemplate(template, cb) {
    /*
A minimilist template is used by default
 */
    if (!template) {
        return cb(null, {
            render: createRenderer()
        });
    }

    /*
A render `function` can be provided.
    */
    if (isFunction(template)) {
        return cb(null, {
            render: template
        })
    }

/*
The path to a html page template or a locally installed `module` can be configured.
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
For precise control a template configuration can be provided.
    */
    if (isObject(template)) {
        return resolveTemplateObj(template, cb);
    }
/*
Bad configuration
*/
    cb("Illegal template configuration: " + template)
}

/*
## helper `function`s

*/
function resolveTemplateObj(template, cb) {
    /*
The `render` `function` is of the form

``` javascript
(view: Object, options: Object) => ReadableStream
```

`render` return a ReadableStream of the page template
    */
    if (isFunction(template.render)) {
        return cb(null, template)
    }
    /*
`module` is an optional NPM module
    */
    if (template.module) {
        return resolveModule(template.module, function (err, moduleTemplate) {
            if (err) {
                return cb(err);
            }
            /*
`template.opts` will be passed as configuration to the `render` function.
            */
            cb(null, Object.assign({}, moduleTemplate, { opts: template.opts }))
        })
    }
    /*
The page template path can be specified directly like this
    */
    return cb(null, {
        render: createRenderer(template.page),
        static: template.static
    })
}

function resolveModule(module, cb) {
    /*
Attempt to resolve `module` as an NPM module that exports a `template` `Object`
    */
    return resolve(module, { basedir: path.resolve('.') },  function (err, modulePath) {
        if (err) {
            /*
Perhaps `module` is an NPM module that contains a `page.html`
            */
            return resolveModulePage(module, cb);
        }
        return cb(null, require(modulePath))
    })
}

function resolveModulePage(module, cb) {
    /*
Attempt to resolve `module` as an NPM module that contains a `page.html`
    */
    return resolve(module + '/page.html', { basedir: path.resolve('.') },  function (err, page) {
        if (err) {
            return cb(err)
        }
        return cb(null, {
            render: createRenderer(page),
            static: path.dirname(page) + '/static'
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
