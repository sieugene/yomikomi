import { BindLang, RouteValue } from './types';

export function bindLang<T extends Record<string, RouteValue>>(
  routes: T,
  lang: string,
): BindLang<T> {
  const prefix = lang ? `/${lang}` : "";

  const result = {} as BindLang<T>;

  for (const key in routes) {
    const value = routes[key];

    if (typeof value === "function") {
      result[key] = ((...args: unknown[]) =>
        prefix + value(...args)) as BindLang<T>[typeof key];
    } else {
      result[key] = (prefix + value) as BindLang<T>[typeof key];
    }
  }

  return result;
}