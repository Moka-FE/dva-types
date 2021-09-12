import { ModelAction, Commands, ModelState } from '../src';

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
    set(state: TodoState, action: { payload: Todo[] }): TodoState;
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
