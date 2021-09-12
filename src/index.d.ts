/**
 * 获取函数第一个参数的payload类型
 */
type FirstPayload<F> = F extends (first: infer S, second: any) => any ? S extends never ? never : S extends { payload: any } ? S['payload'] : never : never;

/**
 * 获取函数第二个参数的payload类型
 */
type SecondPayload<F> = F extends (first: any, second: infer S) => any ? S extends never ? never : S extends { payload: any } ? S['payload'] : never : never;

/**
 * 获取函数的参数类型
 */
type Args<T> = T extends (...args: infer A) => any ? A : never;

/**
 * 获取函数的第二个参数以后的参数类型
 */
type ArgsWithoutFirst<T> = T extends (_: any, ...args: infer A) => any ? A : never;

/**
 * 过滤掉never类型的type
 */
type WithoutNever<T> = Pick<T, { [k in keyof T]: T[k] extends never ? never : k }[keyof T]>;

/**
 * 生成当前model内需要的action类型
 * 用于model内部做类型限定
 */
type GenerateActionInner<
  Namespace extends string,
  Reducers extends { [k: string]: (...arg: any[]) => any },
  Effects extends { [k: string]: ((...arg: any[]) => any) | any[] } = Record<string, never>,
  OuterActions extends any[] = never[]
  > = {
    // 从reducer生成action type
    [k in keyof Reducers]: WithoutNever<{
      // eslint-disable-next-line prettier/prettier
      type: Namespace extends '' ? k : `${Namespace}/${string & k}`;
      payload: SecondPayload<Reducers[k]>;
    }>;
  }[keyof Reducers] | {
    // 从effect生成action type
    [k in keyof Effects]: WithoutNever<{
      type: Namespace extends '' ? k : `${Namespace}/${string & k}`;
      payload: Effects[k] extends any[] ? FirstPayload<Effects[k][0]> : FirstPayload<Effects[k]>;
    }>
  }[keyof Effects] | OuterActions[number]; // 外加外部的一些action

/**
 * 生成model对应的action类型
 * 用于对外导出
 */
export type ModelAction<
  M extends {
    namespace: string;
    reducers: { [k: string]: (...args: any[]) => any };
    effects?: { [k: string]: ((...args: any[]) => any) | any[] };
  }
  > = M['effects'] extends { [k: string]: ((...args: any[]) => any) | any[] }
  ? GenerateActionInner<M['namespace'], M['reducers'], M['effects']>
  : GenerateActionInner<M['namespace'], M['reducers']>;

/**
 * 生成model对应的state类型
 */
export type ModelState<M extends { namespace: string; state: Record<string, any> }> = M['state'];

/**
 * 生成model对应的saga command类型
 * 用于model内部类型限定
 */
export type Commands<
  M extends {
    reducers: { [k: string]: (...args: any[]) => any };
    effects: { [k: string]: ((...args: any[]) => any) | any[] };
  },
  O extends any[] = never[]
  > = {
    put: (action: GenerateActionInner<'', M['reducers'], M['effects'], O>) => any,
    call: <F extends (arg: any) => any>(api: F, ...payload: Args<F>) => any;
    select: <F extends (state: any, ...arg: any[]) => any>(selector?: F, ...args: ArgsWithoutFirst<F>) => any;
    take: (...args: any[]) => any;
    cancel: (...args: any[]) => any;
    all: (commands: any[]) => any;
    [key: string]: any;
  };

/**
 * 用于effect中的yield类型推导
 */
export type Result<F> = F extends (...args: any[]) => Promise<infer R> ? R : never;
