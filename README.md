# doc-u-ment

Streaming APIs for document generation


## CLI

To render a single page do
```
cat input.js | doc-u-ment [opts]
```

The output html wil be written to sdtout

To render a collection of files

```
doc-u-ment GLOB [*GLOB] [--dest DIR] [opts]
```

To create a server that re-generates on each request

```
doc-u-ment --server [--src DIR] [opts]
```

server options include
`server.port`

##API

``` javascript
var doc = require('doc-u-ment')
```

###methods

``` javascript
doc(opts)
```
Returns a duplex stream


``` javascript
var generate = require('doc-u-ment').generate
`
/*
# noop
Does exactly what you might expect
*/
function noop() {
}
`.pipe(generate()).pipe(process.stdout)

```


## install
npm install doc-u-ment

npm install -g doc-u-ment

## license
MIT
