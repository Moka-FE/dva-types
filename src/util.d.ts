/**
 * 获取函数第一个参数的payload类型
 */
export type FirstPayload<F> = F extends (first: infer S, second: any) => any ? S extends never ? never : S extends { payload: any } ? S['payload'] : never : never;

/**
* 获取函数第二个参数的payload类型
*/
export type SecondPayload<F> = F extends (first: any, second: infer S) => any ? S extends never ? never : S extends { payload: any } ? S['payload'] : never : never;

/**
* 获取函数的参数类型
*/
export type Args<T> = T extends (...args: infer A) => any ? A : never;

/**
* 获取函数的第二个参数以后的参数类型
*/
export type ArgsWithoutFirst<T> = T extends (_: any, ...args: infer A) => any ? A : never;

/**
* 过滤掉never类型的type
*/
export type WithoutNever<T> = Pick<T, { [k in keyof T]: T[k] extends never ? never : k }[keyof T]>;

/**
* 生成当前model内需要的action类型
* 用于model内部做类型限定
*/
export type GenerateActionInner<
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
