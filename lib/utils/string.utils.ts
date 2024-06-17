/**
 * Stringify keys of a record
 * @param record
 * @param stringify uses JSON.stringify instead of calling toString if true
 */
export const stringifyKeys = <
  T extends Record<string, any>,
  R extends Partial<Record<keyof T, string | T[keyof T]>> = Partial<Record<keyof T, string | T[keyof T]>>,
>(
  record: T,
  stringify = false,
): R =>
  Object.entries(record).reduce((acc, [key, value]: [keyof T, T[keyof T]]) => {
    if (value === undefined) return acc;
    if (value === null) return acc;
    acc[key] = stringify ? JSON.stringify(value) : value?.toString();
    return acc;
  }, {} as R);

export const sanitizeUrl = (url: string): URL => new URL(url.toString().replace(/,/g, '%2C'));
