# Dva Types

Dva 扩展类型

源自(迁移 Dva 项目到 typescript 有感)[https://blog.lishunyang.com/2021/04/migrate-dva-to-ts.html]

# 用法

## 1. 安装依赖

```sh
npm i -d @moka-fe/dva-types
```

## 2. 引入

```ts
import { ModelAction, ModelState, Commands, Result } from '@moka-fe/dva-types';
```

一共有 4 个工具类型，分别是：

- `ModelAction`，根据 model 自动推导出 action 类型
- `ModelState`，根据 model 自动推导出 state 类型
- `Commands`，redux saga 相关的 commands 类型
- `Result`，generator yield 的类型

具体用法见下面的例子。

## 3. 使用

假设我们在开发一个经典的待办应用（Todo List），原本的 model 可能是这样：

```js
const todoModel = {
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

export default todoModel;
```

先看一下改造后的样子：

```ts
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

export default todoModel;
export type TodoState = ModelState<TodoModel>;
export type TodoAction = ModelAction<TodoModel>;
```

其实简单来讲，就是 2 点：

1. 手动补充了 model 类型
2. 额外导出了一些类型（state 类型和 action 类型）

### 关于补充 model 类型，这里有一些注意点：

reducers 相对较简单，类型的写法是这样的：

```ts
reducers: {
  // 第一个参数的类型是当前model的state类型（这里是TodoState）
  // 第二个参数是action的类型，通常我们只会考虑其中的payload的部分
  // 返回值也是当前model的state类型（这里是TodoState）
  add(state: TodoState, action: { payload: Todo }): TodoState;
  ...
}
```

effects 相对多一些东西：

```ts
import { Commands } from '@moka-fe/dva-types';

effects: {
  // effects写类型的时候不用加*号
  // 第一个参数是action的类型，如果不需要action，则这里的类型写never
  // 第二个参数是一些saga commands，这里使用我们自己封装好的工具类型Commands
  // 返回类型写void（前提是没有用到返回值的话）
  fetch(_: never, commands: Commands<TodoModel>): void;
  // 下面是一个用到了action的例子，action类型的写法跟reducers类似
  remove(action: { payload: { id: number } }, commands: Commands<DashboardModel>): void;
  ...
}
```

定义好 reducers 和 effects 的类型后，ts 就可以自动推导出这个 model 里所有 action 的类型是什么，这样就可以在 reducer 和 effect 方法里做校验了，例如：

```ts
*fetch(_, { call, put }) {
  const todos = yield call(fetchTodos);
  if (todos) {
    // 这里我们put了一个action，ts会自动检查这个action的type和payload是否
    // 符合类型定义，如果不符合将会报错😎
    yield put({
      type: 'set',
      payload: todos,
    });
  }
},
```

有时候 effect 可能是个数组，例如用到了 saga 的 takeLatest：

```ts
const takeLatest = { type: 'takeLatest' };

const model = {
  effects: {
    fetchSomething: [
      function* fetchSomething(_, { call, put }) {
        ...
      },
      takeLatest,
    ],
  },
};
```

对于这种数组类型的，只需要在 model 的类型中写好 tuple 类型即可，例如：

```ts
const takeLatest = { type: 'takeLatest' };

interface SomethingModel = {
  effects: {
    fetchSomething: [(_: never, Commands<SomethingModel>) => void, typeof takeLatest];
  };
};
```

如果用到了 select，写法跟普通的 yield 类似，在 yield 前面补充类型即可，例如：

```ts
const { todos }: TodoState = yield select(({ todos }) => todos);
```

其实是手动写了个 TodoState 的类型，这是因为 generator 的原理决定了这里的 yield 类型无法自动推导出来，必须手动补充，所以算是有一些些代码冗余吧，美中不足。

### 关于导出的类型，也需要说明一下

额外导出的类型是通过一个工具类型 ModelAction 做的：

```ts
// 这个工具类型接受1个参数，就是对应的model的类型
// 生成的是这个model对应的action的类型
export type TodoAction = ModelAction<TodoModel>;
```

这个导出的 action 类型可以用在 dispatch 的地方，例如：

```ts
// 注意这里用TodoAction实例化了dispatch泛型方法
// 经过TodoAction加持的dispatch就可以正确对action类型做校验了
// 不但可以自动补全type，而且如果传入的payload与实际action的定义不符合，ts也可以检查出报错
dispatch<TodoAction>({ type: 'todo/add', payload: blablabla });
```

另外一个额外导出的是 state 的类型：

```ts
// 导出了state的类型
export type TodoState = ModelState<TodoModel>;
```

这个导出的 state 类型可以用在 selector 处，例如：

```ts
// 注意这里对useSelector中第一个参数增加了Todo的类型，这样ts就可以自动推导出todos的类型
const { todos } = useSelector(
  ({ todoState }: { todoState: DashboardState }) => todoState.todos,
  shallowEqual
);
```

# TODO

- [ ] 补全 UT（目前只引入了几个基本的例子）
- [ ] 其实 saga commands 有很多，实现这个项目的时候，只补全了其中的 put、call、select 这几个，其他暂时没有补全，都是`(...args: any[]) => any`这种，这主要是因为其他的用的不多，缺乏具体实际场景，暂时就先放着了，如果有具体的例子再补充。
