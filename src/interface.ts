export interface OptionConfig<T> {
  default?: T;
  transformer?: (value: unknown) => T;
}

export type OptionValueType = 'string' | 'boolean' | 'string-array';
export type ArgumentValueType = 'string' | 'string-array';

export interface FlagParams {
  optionShort?: string;
  optionLong?: string;
  optionName: string;
  optionOptional: boolean;
  optionType: OptionValueType;
  optionValueDisplayName?: string;
  optionReverse: boolean;
}
