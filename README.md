Serializes (dirty) objects into arrays using a known schema

- <a href="api_docs">API docs</a> 

## Installation

Vanilla HTML:
```html
<script src="./path/to/packifier.min.js"></script>
<script>
  const packer = new Packifier(...);
</script>
```

CommonJS:
```js
const Quadtree = require("./path/to/packifier.min.js");

const quadtree = new Quadtree(...);
```

ESM:
```html
<script type="module">
  import { Quadtree } from "./path/to/packifier.min.mjs";

  const quadtree = new Quadtree(...);
</script>
```

> Ensure you are using the correct build; The ESM build uses the `.mjs` extension

<br><hr><br>

## Schema <a name="packifier_schema" href="#packifier_schema"></a>

The schema is an object that describes the (de)serialization pattern.

Example:
```js
{
  "id": 0,
  "req": ["name"],
  "pre": ["x", "y"],
  "segmentationThreshold": 8
}
```

- `id` - a unique identifier for the schema.
- `req` - array of properties that are added to the final packet no matter what
-  `pre` - array of properties that are only added to final packet if they are dirty (have changed)
- `segmentationThreshold` - number of bits before the bitflag splits (max 32)

<br><hr><br>

## Tuning

Packifier performance and memory efficiency of packets can be improved by tuning the schema.

1) *segmentationThreshold*

Describes the number of bits before the bitflag is split. Generally, the value should be a multiple of 8 to maximize the number of flags per byte. 

The ideal value must be measured empirically. However for the majority of cases, a segmentationThreshold of 8 is fine.

2) *Order of preconditions*

Preconditions in the schema should be ordered first to last from most frequently dirty to least frequently dirty.

Example with a player object, where their position changes often but their health does not:

```js
// bad
new Packifier({
  ...
  pre: ["health", "x", "y", ...]
});

// good
new Packifier({
  ...
  pre: ["x", "y", "health", ...]
});
```

> Note: This doesn't matter when the total items are less than the segmentationThreshold, but you should still conform to this structure regardless.

<br><hr><br>

## Security

Packifier offers minimal protection against malicious data, so error handling is up to the user.

The recommended approach is to wrap all packifier code in a `try-catch` block.

<br><hr><br>

## Using IDs

In many cases, you will have more than one type of pattern to serialize. The `id` of a schema is appended as the first element in a packet. It is up to the user to match the id to their respective packifier object.

Example implementation:

```js
const packerOne = new Packifier({ id: 1, ... });
const packerTwo = new Packifier({ id: 2, ... });
const packerThree = new Packifier({ id: 3, ... });
```

```js
switch (data[0]) {
  case 1: {
    packerOne.unpack(data);
    break;
  }
  case 2: {
    packerTwo.unpack(data);
    break;
  }
  case 3: {
    packerThree.unpack(data);
    break;
  }
}
```

<br><hr><br>

## API Docs <a name="api_docs"></a> 

<a name="packifier_constructor" href="#packifier_constructor">></a> *Packifier*(*schema*)

Constructor.

- `@param {Object} schema` - configuration object containing parameters for serialization <a href="#packifier_schema">see here</a>

```js
const packer = new Packifier({
  id: 0,
  req: ["name"],
  pre: ["x", "y"],
  segmentationThreshold: 8
});
```

<hr>

<a name="packifier_pack" href="#packifier_pack">></a> *packer*.**pack**(*data*, *flags*)

Serialize data.

- `@param {Object} data` - data to serialize
- `@param {Object} flags` - dirty flags; object structured as `property: true | false`, where `true` means the property is dirty

```js
const data = {
  foo: 1,
  bar: 2
};

const flags = {
  foo: false,
  bar: true
}

const packet = packer.pack(data, flags);
```

<hr>

<a name="packifier_unpack" href="#packifier_unpack">></a> *packer*.**unpack**(*packet*)

Deserialize packet.

- `@param {Array} packet` - item to remove; Item must currently be in a quadtree

**!Important:** packet must be packed using the identical schema.

```js
const data = packer.unpack(packet);
```

<br><hr>

## Build

```
$ npm run build
```