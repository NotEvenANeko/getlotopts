export const OptionFlagValueRegex =
  /^(?<prefix>(?:-\w[, |]+--[\w][\w-]*)|(?:-\w)|(?:--[\w][\w-]*))(?: (?:(?:\[(?<optional>\w+?(?:\.\.\.)?)\])|(?:<(?<required>\w+?(?:\.\.\.)?)>)))?$/;

export const OptionFlagRegex =
  /^(?:(?:(?<short>-\w)(?:[, |]+)?)?(?<long>--[\w][\w-]*)?)$/;

export const ArgumentFlagRegex =
  /^(?:(?:<(?<required>\w+?(?:\.\.\.)?)>)|(?:\[(?<optional>\w+?(?:\.\.\.)?)\]))$/;
