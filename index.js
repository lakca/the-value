const { constants, functions, getters, Constant } = require('./utils')
const getterCache = require('getter-cache')()

/**
 * @typedef {import('./utils')} utils
 * @typedef {utils['getters']} getters
 * @typedef {utils['functions']} functions
 * @typedef {utils['constants']} constants
 */
/**
 * @template T, U
 * @typedef {{[K in keyof T]: U extends 'getter' ? Omit<PropertyDescriptor, 'value'> : U extends 'value' ? Omit<PropertyDescriptor, 'get'|'set'> : PropertyDecorator}} Descriptors
 */

/**
 * @returns {Descriptors<getters, 'getter'>}
 */
function getGetters(fns, keys) {
  return Object.fromEntries((keys || Object.keys(fns)).map(name => {
    const getter = fns[name]
    return [name, {
      configurable: true,
      enumerable: true,
      get: function() { return getter.call(this, this._value) }
    }]
  }))
}

/**
 * @returns {Descriptors<functions, 'value'>}
 */
function getMethods(fns, keys) {
  return Object.fromEntries((keys || Object.keys(fns)).map(name => {
    const func = fns[name]
    return [name, {
      configurable: true,
      enumerable: true,
      value: function(...args) { return func.call(this, this._value, ...args) }
    }]
  }))
}

function create() {

  /**
   * @template T
   * @param {T} v
   */
  function _(v) {
    if (!(this instanceof _))
      return new _(v)
    this._value = v
  }

  _.prototype = {
    valueOf() { return this._value }
  }

  Object.defineProperties(_.prototype, getGetters(getters))
  Object.defineProperties(_.prototype, getMethods(functions))

  getterCache.class(_)

  return Object.assign(_, constants, getters, functions, {
    /**
     * Extend current `TheValue` with extension. *all extension functions should have the first parameter to be the value.*
     *
     * @param {object} extension -
     * @param {string[]|{[x: string]: string}} [keys] -
     * @param {'getter'} [type] - if type is 'getter', all `keys` are regarded as getter properties even it is a normal function,
     *                            getter property value will be cached after first call.
     * @returns {this}
     *
     * # Example:
     * ```js
     * _.addon(underscore, ['each', 'map', 'pick', 'omit'])
     * _.addon(underscore, { isMap: 'Map', isSet: 'Set' }, 'getter')
     * // _(new Set()).Set => true
     * // _({a: 1, b: 2, c:3}).omit('b', 'c') => {a: 1}
     * ```
     */
    addon(extension, keys, type, notCacheGetter = false) {
      const args = []

      for (const e of arguments) {
        if (typeof e === 'boolean') {
          notCacheGetter = e
          break
        } else {
          args.push(e)
        }
      }

      [extension, keys, type] = args

      if (!extension) return _

      const descriptors = !keys ? Object.entries(Object.getOwnPropertyDescriptors(extension))
        : Array.isArray(keys) ? keys.map(key => [key, Object.getOwnPropertyDescriptor(extension, key)])
          : Object.entries(keys).map(([fromName, toName]) => [toName, Object.getOwnPropertyDescriptor(extension, fromName)])

      const getterKeys = []

      Object.defineProperties(_.prototype, Object.fromEntries(descriptors.map(([key, desc]) => {
        const newDesc = { configurable: true, enumerable: true }
        if (desc.get) {
          newDesc.get = desc.get
          getterKeys.push(key)
        } else if (typeof desc.value === 'function') {
          const func = desc.value
          if (type === 'getter') {
            newDesc.get = function() { return func.call(this, this._value) }
            getterKeys.push(key)
          } else {
            newDesc.value = function(...moreArgs) { return func.call(this, this._value, ...moreArgs) }
          }
        } else {
          newDesc.value = desc.value
        }
        return [key, newDesc]
      })))

      if (!notCacheGetter) {
        getterCache.class(_, getterKeys)
      }

      return _
    }
  })
}

const TheValue = create()

/**
 * Return a new `TheValue` with extension.
 *
 * @param {Object} extension
 * @returns
 */
TheValue.addon = function(...args) {
  const _ = create()
  _.addon(...args)
  return _
}

TheValue.Constant = Constant

module.exports = TheValue
