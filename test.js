/* eslint-disable new-cap */

const TheValue = require('./index')
const test = require('ava')

/**
 * @param {import('ava').ExecutionContext} t
 * @param {TheValue} _
 */
function utilTest(t, _) {
  t.true(_.eq(1, '1'))
  t.true(_(1).eq('1'))

  t.false(_.is(1, '1'))
  t.false(_(1).is('1'))

  t.true(_.range(2, 2, 3))
  t.true(_(2).range(2, 3))
  t.true(_.range(3, 2, 3))
  t.true(_(3).range(2, 3))
  t.true(_.range('a', 'a', 'c'))
  t.true(_('a').range('a', 'c'))

  t.false(_.between(2, 2, 3))
  t.false(_(2).between(2, 3))
  t.false(_.between(3, 2, 3))
  t.false(_(3).between(2, 3))
  t.false(_.between('a', 'a', 'c'))
  t.false(_('a').between('a', 'c'))

  t.is(_.get({a: { b: { c: 1 } } }, 'a.b.c'), 1)
  t.is(_({a: { b: { c: 1 } } }).get('a.b.c'), 1)
  t.is(_.get({a: [{ c: 1 }] }, 'a.0.c'), 1)
  t.is(_({a: [{ c: 1 }] }).get('a.0.c'), 1)

  t.deepEqual(_.set(null, 'a.b.c', 1), {a: { b: { c: 1 } } })
  t.deepEqual(_(null).set('a.b.c', 1), {a: { b: { c: 1 } } })
  t.deepEqual(_.set(null, 'a.1.c', 1), {a: [, { c: 1 }] })
  t.deepEqual(_(null).set('a.1.c', 1), {a: [, { c: 1 }] })

  t.true(_.True({}))
  t.true(_({}).True)

  t.true(_.False(0))
  t.true(_(0).False)

  t.true(_.False(''))
  t.true(_('').False)

  t.true(_.String(''))
  t.true(_('').String)

  t.true(_.Number(102))
  t.true(_(102).Number)

  t.true(_.Array([]))
  t.true(_([]).Array)

  t.true(_.Object({}))
  t.true(_({}).Object)

  t.true(_.Object(Object.create(null)))
  t.true(_(Object.create(null)).Object)

  t.true(_.Null(null))
  t.true(_(null).Null)

  t.true(_.Void(void 0))
  t.true(_(void 0).Void)

  t.true(_.None(null))
  t.true(_(null).None)

  t.true(_.None(void 0))
  t.true(_(void 0).None)

  t.true(_.Empty(null))
  t.true(_(null).Empty)

  t.true(_.Empty(void 0))
  t.true(_(void 0).Empty)

  t.true(_.Empty(''))
  t.true(_('').Empty)

  t.true(_.Empty([]))
  t.true(_([]).Empty)

  t.true(_.Empty({}))
  t.true(_({}).Empty)

  t.true(_.Empty(Object.create(null)))
  t.true(_(Object.create(null)).Empty)

  t.true(_.Empty(new Set()))
  t.true(_(new Set()).Empty)

  t.true(_.Empty(new Map()))
  t.true(_(new Map()).Empty)

  t.true(_.Class(class C {}))
  t.true(_(class C {}).Class)

  t.true(_.is(function A() {}, _.CLASS_ES5))
  t.true(_(function A() {}).is(_.CLASS_ES5))

  t.is(_.Type(), typeof void 0)
  t.is(_().Type, typeof void 0)

  t.is(_.Type(null), typeof null)
  t.is(_(null).Type, typeof null)

  t.is(_.Type([]), typeof [])
  t.is(_([]).Type, typeof [])

  t.is(_.NType(), 'Undefined')
  t.is(_().NType, 'Undefined')

  t.is(_.NType(/./), 'RegExp')
  t.is(_(/./).NType, 'RegExp')
}

test.serial('Top level `addon` will create new `TheValue`', t => {
  t.not(TheValue.addon(), TheValue)
})

test.serial('`addon` of new created `TheValue` will only effect on itself', t => {
  const _ = TheValue.addon()
  t.is(_.addon(), _)
})

test.serial('Basic test on top level `TheValue`', t => { utilTest(t, TheValue) })

test.serial('Basic test on new created `TheValue`', t => { utilTest(t, TheValue.addon()) })

test.serial('valueOf() is the value', t => {
  for (const v of [1, '', [], {}]) {
    t.is(TheValue(v).valueOf(), v)
  }
})

const addon = {
  demo: true,
  get ver() {
    return '1.0'
  },
  isInteger(v) {
    return Number.isInteger(v)
  },
  pow(v, n) {
    return Math.pow(v, n)
  }
}

test.serial('Addon test (addon will only be attached to the prototype): depending on original descriptors of own enumerable properties without specific properties.', t => {
  const _ = TheValue.addon(addon)
  const v = _(2)
  t.is(v.ver, '1.0')
  t.is(v.pow(2), 4)
  t.is(v.isInteger(), true)
  t.is(v.demo, true)
})

test.serial('Addon test (addon will only be attached to the prototype): specific properties with/without specific description.', t => {
  const _ = TheValue
    .addon(addon, ['ver', 'isInteger'], 'getter')
    .addon(addon, {'isInteger': 'Int'}, 'getter')
    .addon(addon, ['pow'])

  const v = _(2)
  t.is(v.ver, '1.0') // getter
  t.is(v.pow(2), 4)
  t.is(v.Int, true) // renamed
  t.is(v.isInteger, true) // getter
})

test.serial('cache getter is on (default)', t => {
  let count = 0
  const v = TheValue.addon({ get Noop() { count++ } })()
  v.Noop
  t.is(count, 1)
  v.Noop
  t.is(count, 1)
  v.Noop
  t.is(count, 1)
})

test.serial('cache getter is off', t => {
  let count = 0
  const v = TheValue.addon({ get Noop() { count++ } }, true)()
  v.Noop
  t.is(count, 1)
  v.Noop
  t.is(count, 2)
  v.Noop
  t.is(count, 3)
})

test.serial('Constant is regular expression`', t => {
  const Number = TheValue.Constant(/^\d+$/)
  t.true(TheValue.is('1563', Number))
  t.false(TheValue.is('156x3', Number))
})

test.serial('Constant is normal function`', t => {
  const None = TheValue.Constant(v => v == null)
  t.true(TheValue.is(void 0, None))
  t.true(TheValue.is(null, None))
})

test.serial('Constant is class constructor`', t => {
  class A {}
  t.true(TheValue.is(new A(), TheValue.Constant(A)))
})

test.serial('Constant is others`', t => {
  const OK = TheValue.Constant(200)
  t.true(TheValue.is(200, OK))
})
