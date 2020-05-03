import Vue from 'vue';

// 以'xx.xx'形式设置对象的键和值，并设置为响应式对象
export const setObjectValue = (observer: {[key: string]: any}, strKey: string, value: any) => {
  if (typeof value === 'undefined' || value === null) return;
  strKey.split('.').reduce((acc, key, index, src) => {
    if (index === src.length - 1) {
      Vue.set(acc, key, value);
    } else {
      if (typeof acc[key] === 'undefined' || acc[key] === null) {
        Vue.set(acc, key, {});
      }
    }
    return acc[key];
  }, observer);
};

// 获取对象中xx.xx键值形式的值
export const getObjectValue = (object: {[key: string]: any}, strKey: string) => {
  try {
    return strKey.split('.').reduce((acc, key) => acc[key], object);
  } catch (e) {
    return undefined;
  }
};

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
};
