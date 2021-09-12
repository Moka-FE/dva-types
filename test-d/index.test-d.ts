import { ModelAction, Commands, ModelState } from '../src';

declare function fetchTodos(): Promise<TodoModelState['todos']>;

type TodoModel = {
  namespace: 'todo';

  state: {
    todos: {
      summary: string;
      createDate: Date;
      status: 'todo' | 'doing' | 'done';
    }[];
  };

  reducers: {
    set(state: TodoModelState, action: { payload: TodoModelState['todos'] }): TodoModelState;
    add(state: TodoModelState, action: { payload: TodoModelState['todos'][0] }): TodoModelState;
  };

  effects: {
    fetch(_: never, { call, put }: Commands<TodoModel>): void;
  };
};

type TodoModelState = ModelState<TodoModel>;

type TodoModelAction = ModelAction<TodoModel>;


const todoModel: TodoModel = {
  namespace: 'todo',

  state: {
    todos: [],
  },

  reducers: {
    set(_, { payload }) {
      return { todos: payload };
    },
    add({ todos }, { payload }) {
      return {
        todos: [...todos, payload],
      };
    },
  },

  effects: {
    *fetch(_, { call, put }) {
      const todos = yield call(fetchTodos);
      if (todos) {
        yield put({
          type: 'set',
          payload: todos,
        });
      }
    },
  },
};
