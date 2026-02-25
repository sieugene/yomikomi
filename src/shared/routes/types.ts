export type RouteValue = string | ((...args: unknown[]) => string);

export type BindLang<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => string
    ? (...args: A) => string
    : string;
};
