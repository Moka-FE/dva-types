import { expectType, expectNotType } from 'tsd';

import { FirstPayload, SecondPayload, Args, ArgsWithoutFirst, WithoutNever, GenerateActionInner } from '../src/util';

type State = { a: number };
type Payload = { b: string };

declare function effect(action: { payload: Payload }, commands: unknown): void;
declare function reducer(state: State, action: { payload: Payload }): State;

/**
 * FirstPayload
 */
declare const effectPayload: FirstPayload<typeof effect>;
expectType<Payload>(effectPayload);
expectNotType<State>(effectPayload);

/**
 * SecondPayload
 */
declare const reducerPayload: SecondPayload<typeof reducer>;
expectType<Payload>(reducerPayload);
expectNotType<State>(reducerPayload);

/**
 * Args
 */
declare const args: Args<typeof effect>;
expectType<[{ payload: Payload }, unknown]>(args);
expectNotType<{ payload: Payload }>(args);

/**
 * ArgsWithoutFirst
 */
declare const argsWithoutFirst: ArgsWithoutFirst<typeof effect>;
expectType<[unknown]>(argsWithoutFirst);
expectNotType<[{ payload: Payload }, unknown]>(argsWithoutFirst);

/**
 * WithoutNever
 */
type SomeType = {
  a: never;
  b: string;
  c: number[];
}
declare const withoutNever: WithoutNever<SomeType>;
expectType<{ b: string; c: number[] }>(withoutNever);
expectNotType<SomeType>(withoutNever);

/**
 * GenerateActionInner
 */
type AnotherPayload = { x: number; y: string };
type Reducers = {
  a: (state: State, action: { payload: Payload }) => State;
  b: (state: State, action: { payload: AnotherPayload }) => State;
}
type Effects = {
  c: (action: { payload: Payload }, commands: unknown) => void;
  d: (action: { payload: AnotherPayload }, commands: unknown) => void;
}
type NormalAction = {
  type: 'test/a';
  payload: Payload;
} | {
  type: 'test/b';
  payload: AnotherPayload;
} | {
  type: 'test/c';
  payload: Payload;
} | {
  type: 'test/d';
  payload: AnotherPayload;
}
declare const normalAction: GenerateActionInner<'test', Reducers, Effects>;
expectType<NormalAction>(normalAction);
expectNotType<Payload>(normalAction);

type OuterAction1 = { type: 'outer1/a'; payload: Payload };
type OuterAction2 = { type: 'outer2/a'; payload: AnotherPayload };
type OuterActions = [OuterAction1, OuterAction2];
declare const combinedActions: GenerateActionInner<'test', Reducers, Effects, OuterActions>;
expectType<NormalAction | OuterAction1 | OuterAction2>(combinedActions);
expectNotType<NormalAction>(combinedActions);

type ReducersWithNever = {
  a: (state: State, action: { payload: Payload }) => State;
  b: (state: State, action: { payload: AnotherPayload }) => State;
  c: (state: State, _: never) => State;
}
type EffectsWithNever = {
  d: (action: { payload: Payload }, commands: unknown) => void;
  e: (action: { payload: AnotherPayload }, commands: unknown) => void;
  f: (_: never, commands: unknown) => void;
}
type NormalActionWithoutNever = {
  type: 'test/a';
  payload: Payload;
} | {
  type: 'test/b';
  payload: AnotherPayload;
} | {
  type: 'test/c';
} | {
  type: 'test/d';
  payload: Payload;
}| {
  type: 'test/e';
  payload: AnotherPayload;
} | {
  type: 'test/f';
}
declare const normalActionWithoutNever: GenerateActionInner<'test', ReducersWithNever, EffectsWithNever>;
expectType<NormalActionWithoutNever>(normalActionWithoutNever);
expectNotType<NormalAction>(normalActionWithoutNever);