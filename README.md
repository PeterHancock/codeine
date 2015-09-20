# codeine

Generate documentaiton from JavaScript


## CLI

To render a single page do
```
cat input.js | codeine [opts]
```

The output html wil be written to sdtout

To render a collection of files

```
codeine GLOB [*GLOB] [--dest DIR] [opts]
```

To create a server that re-generates on each request

```
codeine --server [--src DIR] [opts]
```

server options include
`server.port`

##API

``` javascript
var doc = require('codeine')
```

###methods

``` javascript
doc(opts)
```
Returns a duplex stream


``` javascript
var generate = require('codeine').generate
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
npm install codeine

npm install -g codeine

## license
MIT
