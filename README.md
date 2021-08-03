# The Value

> functional, semantic and neat.

```
npm i -S the-value
```

- [The Value](#the-value)
  - [Usage](#usage)
  - [Addon](#addon)
  - [Add utils from lodash/underscore/...](#add-utils-from-lodashunderscore)

## Usage

```js
const Value = require('the-value')
```

```js
Value(1).Number // true
Value(1).range(0, 1) // true
Value('b').between('a', 'c') // true
```

```js
Value.is(200, Value.Constant(200)) // true
Value(200).is(Value.Constant(200)) // true
```

> All original provided functions in [here](./utils.js)

## Addon

> ! All functions should have the first parameter to be the target value (to conduct operations).

`addon(utilsObject: object, keys?: string[]|Record<string, string>, type?: 'getter', notCacheGetter?: boolean=false)`
  - `utilsObject`, properties owner.
  - `keys`, list properties should be added. If ignored, all own enumerable properties will added. Properties will be renamed with the option is not an array.
  - `type`, if set to be `getter`, indicate the function type properties should be converted to getter properties.
  - `notCacheGetter`, if set to be `true`, indicate the getter properties should not be cached.

All of own enumerable properties:

```js
// * addon() of the top level `Value` will return a new `Value`, to avoid pollute the package source when it's imported in other files.
const NewValue = Value.addon({
  pow(v, n) { return v ** n },
  get Square(v) { return v ** 2 },
  VERSION: '1.0',
})

NewValue(2).pow(2) // 4
NewValue(2).Square // 4
NewValue(2).VERSION // 1.0

// addon() of new `Value` will addon itself (instead of returning a new one).
const NewValue2 = NewValue.addon({})

newValue2 === newValue // true
```

Specific properties (even non-enumerable or inherited):

```js
const NewValue = Value.addon({
  pow(v, n) { return v ** n },
  get Square(v) { return v ** 2 },
  VERSION: '1.0',
}, ['pow'])
```

Make function to be getter:

```js
const NewValue = Value.addon({
  square(v) { return v ** 2 },
}, ['square'], 'getter')

NewValue(2).square // 4
```

Rename:

```js
const NewValue = Value.addon({
  square(v) { return v ** 2 },
}, { square: 'Square' }, 'getter')

NewValue(2).Square // 4
```

Disable cache of getter properties when add on (cache getter properties is default option of `addon()`, see [declaration](./index.d.ts#L44)):

```js
let count = 0
const NewValue = Value.addon({
  square(v) { count++; return v ** 2 },
}, { square: 'Square' }, 'getter', true)

const v = NewValue(2)
v.Square // count is 1
v.Square // count is 2
v.Square // count is 3
v.Square // count is 4
```

## Add utils from lodash/underscore/...

```js
const underscore = require('underscore')
const Value = require('the-value')
  .addon(underscore, ['pick', 'omit', 'shuffle'])
  .addon(underscore, { isElement: 'Element' }, 'getter')
```
