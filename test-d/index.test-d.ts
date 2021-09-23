import { expectError, expectType, expectNotType } from 'tsd';

import { ModelAction, Commands, ModelState, Result } from '../src';

declare function fetchTodos(): Promise<Todo[]>;

type Todo = {
  id?: number;
  summary: string;
  createDate: Date;
  status: 'todo' | 'doing' | 'done';
};

type TodoModel = {
  namespace: 'todo';

  state: {
    todos: Todo[];
  };

  reducers: {
    set(state: never, action: { payload: Todo[] }): TodoState;
    add(state: TodoState, action: { payload: Todo }): TodoState;
  };

  effects: {
    fetch(_: never, { call, put }: Commands<TodoModel>): void;
  };
};

type TodoState = ModelState<TodoModel>;

type TodoAction = ModelAction<TodoModel>;

const todoModel: TodoModel = {
  namespace: 'todo',

  state: {
    todos: [],
  },

  reducers: {
    set(_, { payload }) {
      /**
       * never
       */
      expectType<never>(_);
      /**
       * payload type of reducer
       */
      expectType<Todo[]>(payload);

      return { todos: payload };
    },
    add({ todos }, { payload }) {
      /**
       * payload type of reducer
       */
      expectType<Todo[]>(todos);

      return {
        todos: [...todos, payload],
      };
    },
  },

  effects: {
    *fetch(_, { call, put }) {
      /**
       * never
       */
      expectType<never>(_);

      const todos: Result<typeof fetchTodos> = yield call(fetchTodos);
      if (todos) {
        yield put({
          type: 'set',
          payload: todos,
        });
      }

      /**
       * action type of put
       */
      expectError(put({
        type: 'sett',
        payload: todos,
      }));

      /**
       * action type of put
       */
      expectError(put({
        type: 'set',
        payload: 123,
      }));
    },
  },
};

/**
 * return type of reducer
 */
declare const n: never;
expectType<{ todos: Todo[] }>(todoModel.reducers.set(n, { payload: [] }));

/**
 * action type
 */
declare const todoAction: TodoAction;
expectType<
  { type: 'todo/set'; payload: Todo[] }
  | { type: 'todo/add'; payload: Todo }
  | { type: 'todo/fetch' }
>(todoAction);
expectNotType<{ type: 'todo/set'; payload: Todo[] }>(todoAction);

/**
 * state type
 */
declare const todoState: TodoState;
expectType<{ todos: Todo[] }>(todoState);
expectNotType<{ todos: Todo }>(todoState);
