import { expectType, expectNotType } from 'tsd';

import { FirstPayload, SecondPayload } from '../src/util';

type State = { a: number };
type Payload = { b: string };

declare function effect(action: { payload: Payload }, commands: unknown): void;
declare const effectPayload: FirstPayload<typeof effect>;

expectType<Payload>(effectPayload);
expectNotType<State>(effectPayload);

declare function reducer(state: State, action: { payload: Payload }): State;
declare const reducerPayload: SecondPayload<typeof reducer>;

expectType<Payload>(reducerPayload);
expectNotType<State>(reducerPayload);
