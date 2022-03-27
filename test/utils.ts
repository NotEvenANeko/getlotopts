// deno-lint-ignore-file no-explicit-any
export const mockFn = (impl?: (...args: any[]) => any) => {
  let calledTimes = 0;
  let lastCalledWith: any[];

  return {
    fn: (...args: any[]) => {
      calledTimes += 1;
      lastCalledWith = args;
      if (impl) return impl(args);
    },
    calledTimes: () => calledTimes,
    lastCalledWith: () => {
      if (lastCalledWith.length === 1) return lastCalledWith[0];
      return lastCalledWith;
    },
  };
};
