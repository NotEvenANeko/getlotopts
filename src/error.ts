export class OptionFlagError extends Error {
  constructor(flag: string) {
    super(`'${flag}' is not valid option flag.`);
  }
}

export class ArgumentFlagError extends Error {
  constructor(flag: string) {
    super(`'${flag}' is not valid argument flag.`);
  }
}
