/* eslint-disable new-cap */

/**
 * @param {any} v
 * @returns
 */
function Constant(v) {
  if (!(this instanceof Constant)) {
    return new Constant(v)
  }
  this._value = v
}

const constants = {}
const functions = {}
const getters = {}

constants.ARRAY = new Constant(Array.isArray)

/**
 * Check if the value `v` is equal to (`==`) another value `a`.
 */
functions.eq = function(v, a) { return v == a }

/**
 * Check if the value `v` is *the same as* (`===`) another value `a`, or inspection passed with a `Constant`.
 *
 * - if `a` is `Constant`:
 *   - if Constant underlying is a function, return `a(v)`
 *   - if Constant underlying is a RegExp, return `a.test(v)`
 *   - others, compared with strict equal: `===`
 * - if `a` is others, return `a === v`
 *
 * @template V
 * @param {V} v
 * @param {Constant|Exclude<*, Constant>} a
 * @returns {boolean}
 */
functions.is = function(v, a) {
  if (a instanceof Constant) {
    a = a._value
    // function (including class)
    if (typeof a === 'function') {
      if (getters.Class(a)) {
        return v instanceof a
      } else {
        return a(v)
      }
    }
    // regexp
    else if (a instanceof RegExp) {
      return a.test(v)
    } else {
      return a === v
    }
  } else {
    return v === a
  }
}

/**
 * Check if the value `v` is numerically in the closed range of `a` and `b`. (a <= v <= b)
 */
functions.range = function(v, a, b) { return v >= a && v <= b }

/**
 * Check if the value `v` is numerically in the open range of `a` and `b`. (a < v < b)
 */
functions.between = function(v, a, b) { return v > a && v < b }

/**
 * Get descendant property of some value.
 *
 * @param {any} v - The value.
 * @param {string} chain - Property representation, properties chain list concatenated with dot, e.g. `a.b.c` represents `obj.a.b.c`
 * @returns {any}
 */
functions.get = function(v, chain) {
  for (const e of chain.split('.')) {
    if (v == null) return
    v = v[e]
  }
  return v
}

/**
 * Set descendant property of some value, and return the value.
 *
 * @template V
 * @param {V} v - The value, if `v` is `undefined` or `null`, replaced by empty object `{}`
 * @param {string} chain - Property representation, properties chain list concatenated with dot, e.g. `a.b.c` represents `obj.a.b.c`
 * @param {any} val
 * @returns {V}
 */
functions.set = function(v, chain, val) {
  chain = chain.split('.')

  const r = v == null ? v = getDefault(chain[0]) : v

  for (let i = 0; i < chain.length; i++) {
    v = v[chain[i]] = v[chain[i]] || (i + 1 < chain.length ? getDefault(chain[i + 1]) : val)
  }

  return r

  function getDefault(a) {
    return getters.Decimal(a) ? [] : Object.create(null)
  }
}

/** Check if the value is asserted `true` */
getters.True = function(v) { return !!v }

/** Check if the value is asserted `false` */
getters.False = function(v) { return !v }

/** Check if typeof of the value is string */
getters.String = function(v) { return typeof v === 'string' }

/**
 * Check if the value is a decimal string
 * @param {string} v
 */
getters.Decimal = function(v) { return parseFloat(v).toString() === v }

/** Check if type of the value is number */
getters.Number = function(v) { return typeof v === 'number' }

/** Check if native type of the value is array */
getters.Array = function(v) { return Array.isArray(v) }

/** Check if native type of the value is object */
getters.Object = function(v) { return Object.prototype.toString.call(v) === '[object Object]' }

/** aliasing `typeof` */
getters.Type = function(v) { return typeof v }

/**
 * Get the native (underlying) type of the value, powered by `toString.call()`.
 *
 * Get native type description of the value by using `toString.call()`, likes `[object Xxxx]`, and return the `Xxxx`.
 *
 * For example, `[object Object]` corresponds to `Object`
 *
 * @returns {Capitalize<string>}
 */
getters.NType = function(v) { return Object.prototype.toString.call(v).slice(8, -1) }

/** Check if the value is `null` */
getters.Null = function(v) { return v === null }

/** Check if the value is `undefined` */
getters.Void = function(v) { return v === void 0 }

/** Check if the value is `null` or `undefined` */
getters.None = function(v) { return v == null }

/** Check if the value is a empty value, including `null`, `undefined`, `''`, `[]`, `{}`, `Set(0)`, `Map(0)` etc.*/
getters.Empty = function(v) {
  return v == null || v === '' ||
  typeof v === 'object' && ('length' in v && v.length === 0) || 'size' in v && v.size === 0 || Object.keys(v).length === 0
}

/** Check if the value is a es6 `class` */
getters.Class = function(v) { return typeof v === 'function' && v.toString().indexOf('class ') === 0 }

/** Check if the value is a es5 `class`: function of name started with `A-Z` */
getters.ES5Class = function(v) { return typeof v === 'function' && functions.range(v.name[0], 'A', 'Z') }


// derived constants
constants.DECIMAL = new Constant(getters.Decimal)

constants.CLASS = new Constant(getters.Class)

/** function of name started with uppercase letter is regarded as `es5` class constructor */
constants.CLASS_ES5 = new Constant(getters.ES5Class)

module.exports = {
  Constant, constants, functions, getters
}
