export interface OptionConfig<T> {
  default?: T;
  transformer?: (value: unknown) => T;
}

export type OptionValueType = 'string' | 'boolean' | 'string-array';
export type ArgumentValueType = 'string' | 'string-array';
export type BaseOptionAndArgumentType = Record<string, unknown>;

export interface FlagParams {
  optionShort?: string;
  optionLong?: string;
  optionName: string;
  optionOptional: boolean;
  optionType: OptionValueType;
  optionValueDisplayName?: string;
  optionReverse: boolean;
}

export interface OptionHelpOutput {
  output: [string, string][];
  maxPrefixLength: number;
}

export type KebabCaseToCamelCase<
  Input extends string,
  Ans extends string = '',
> = Input extends `${infer Prefix}-${infer Suffix}` ? KebabCaseToCamelCase<
  Suffix,
  `${Ans}${Ans extends '' ? Prefix : Capitalize<Prefix>}`
>
  : `${Ans}${Ans extends '' ? Input : Capitalize<Input>}`;

export type ExtractTypeFromOption<Option extends string> = Option extends
  `${string} <${string}...>` ? string[]
  : Option extends `${string} <${string}>` ? string
  : Option extends `${string} [${string}...]` ? string[] | boolean
  : Option extends `${string} [${string}]` ? string | boolean
  : Option extends `${string}` ? boolean
  : never;

export type RemoveNoFromOptionName<Option extends string> = Option extends
  `no-${infer Opt}` ? KebabCaseToCamelCase<Opt> : KebabCaseToCamelCase<Option>;

export type RemoveTypeFromOption<Option extends string> = Option extends
  `${infer Declaration} <${string}>` ? Declaration
  : Option extends `${infer Declaration} [${string}]` ? Declaration
  : Option;

export type ExtractNameFromOption<Option extends string> = Option extends
  `-${infer Short}, --${infer Long}` ? Short | RemoveNoFromOptionName<Long>
  : Option extends `--${infer Long}` ? RemoveNoFromOptionName<Long>
  : Option extends `-${infer Short}` ? Short
  : never;

export type ParseOptionToType<
  Option extends string,
  Required extends boolean = false,
> = {
  readonly [K in ExtractNameFromOption<RemoveTypeFromOption<Option>>]:
    Required extends true ? ExtractTypeFromOption<Option>
      : ExtractTypeFromOption<Option> | undefined;
};
