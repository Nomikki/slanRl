export const paddedLogObject = (object: { [k in string]: string }) => {
  const maxKeyLength = Object.keys(object).reduce(
    (previousValue, currentValue) =>
      currentValue.length + 3 > previousValue
        ? currentValue.length + 3
        : previousValue,
    0,
  );

  console.log(
    Object.keys(object)
      .map(key => `${key.padEnd(maxKeyLength, ' ')}: ${object[key]}`)
      .join('\n'),
  );
};

export const populateVersion = () =>
  `Commit ID: <span>${COMMIT_HASH}</span> | Version: <span>${VERSION}</span>`;

export const printVersionContainer = () => {
  ensure(document.querySelector('#version')).innerHTML = populateVersion();
};

export const debugInit = () => {
  // Populates the content for "version" div in the bottom right corner
  printVersionContainer();

  // Console logs a padded object
  paddedLogObject({
    BUILD_DATE: BUILD_DATE,
    BUILD_TIME: BUILD_TIME,
    BUILD_DATETIME: BUILD_DATETIME,
    COMMIT_HASH: COMMIT_HASH,
    VERSION: VERSION,
  });
};

export const ensure = <T>(
  argument: T | undefined | null,
  message = 'This value was promised to be there.',
): T => {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
};

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends () => Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

export type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export declare class As<S extends string> {
  private as: S;
}
