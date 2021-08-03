import { getters, constants, functions } from './utils'

type Copy<O> = { [K in keyof O]: O[K] }

type ObjectKeyMapped<O, KM> = { [K in keyof KM as KM[K]]: O[K] }

type ObjectLiteralWithMethodProvideFirstParameter<O> = { [K in keyof O]: O[K] extends (v: unknown, arg1: infer A1) => infer R ?
  (arg1: A1) => R : O[K] extends (v: unknown, arg1: infer A1, arg2: infer A2) => infer R ?
  (arg1: A1, arg2: A2) => R : O[K] extends (v: unknown, ...args: infer A) => infer R ?
  (...args: A) => R :
  O[K]
}

type ObjectLiteralWithMethod2Getter<O> = { readonly [K in keyof O]: O[K] extends (...args: any) => any ? ReturnType<O[K]> : O[K] }

type Constants = Copy<typeof constants>

type Getters = Copy<typeof getters>

type Functions = Copy<typeof functions>

type FunctionsAsProto = ObjectLiteralWithMethodProvideFirstParameter<typeof functions>

type GettersAsProto = ObjectLiteralWithMethod2Getter<typeof getters>

type TheValueProto<O> = GettersAsProto & FunctionsAsProto & O

type TheValue<V, O> = TheValueProto<O> & {

  readonly _value: V

  valueOf(): V
}

type Constant<T> = {
  _value: T
}

type ConstantConstructor = {
  new <T>(v: T): Constant<T>
  <T>(v: T): Constant<T>
}

type TheValueConstructor<O> = Constants & Getters & Functions & {

  new <V>(v: V): TheValue<V, O>

  <V>(v: V): TheValue<V, O>

  prototype: TheValueProto<O>

  addon():
  TheValueConstructor<O>

  addon<E extends Record<PropertyKey, any>>(extension: E, notCacheGetter?: false):
  TheValueConstructor<O & ObjectLiteralWithMethodProvideFirstParameter<E>>

  addon<E extends Record<PropertyKey, any>, KM extends Partial<Record<keyof E, PropertyKey>>>(extension: E, keys: KM, notCacheGetter?: false):
  TheValueConstructor<O & ObjectLiteralWithMethodProvideFirstParameter<ObjectKeyMapped<E, KM>>>

  addon<E extends Record<PropertyKey, any>, K extends keyof E, KL extends K[]>(extension: E, keys: KL, notCacheGetter?: false):
  TheValueConstructor<O & ObjectLiteralWithMethodProvideFirstParameter<Pick<E, KL[number]>>>

  addon<E extends Record<PropertyKey, any>, KM extends Partial<Record<keyof E, PropertyKey>>>(extension: E, keys: KM, type: 'getter', notCacheGetter?: false):
  TheValueConstructor<O & ObjectLiteralWithMethod2Getter<ObjectKeyMapped<E, KM>>>

  addon<E extends Record<PropertyKey, any>, K extends keyof E, KL extends K[]>(extension: E, keys: KL, type: 'getter', notCacheGetter?: false):
  TheValueConstructor<O & ObjectLiteralWithMethod2Getter<Pick<E, KL[number]>>>

  /** Instance should be only used by `is` function */
  Constant: ConstantConstructor
}

declare const Value: TheValueConstructor<{}>

export = Value
