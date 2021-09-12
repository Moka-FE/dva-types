import { GenerateActionInner, Args, ArgsWithoutFirst } from './util';

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
