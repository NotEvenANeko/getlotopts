import { OptionFlagRegex, OptionFlagValueRegex } from './constant.ts';
import { OptionFlagError } from './error.ts';
import { OptionValueType } from './interface.ts';
import { snakeAndKebabToCamelCase } from './util.ts';

export class Option {
  public short?: string;
  public long?: string;
  public valueName: string;
  public valueNameDisplay?: string;
  public optional: boolean;
  public readonly type: OptionValueType;
  public description?: string;
  public defaultValue?: string | boolean;
  public defaultDescription?: string;
  public required: boolean;
  public processed: boolean;

  constructor(flag: string, required = false) {
    // TODO: can we just match once?
    const firstMatch = OptionFlagValueRegex.exec(flag);
    if (!firstMatch || !firstMatch.groups) throw new OptionFlagError(flag);
    const secondMatch = OptionFlagRegex.exec(firstMatch.groups.prefix);
    if (!secondMatch || !secondMatch.groups) throw new OptionFlagError(flag);

    if (firstMatch.groups.required) {
      this.optional = false;
      this.type = firstMatch.groups.required.endsWith('...')
        ? 'string-array'
        : 'string';
      this.valueNameDisplay = firstMatch.groups.required;
    } else if (firstMatch.groups.optional) {
      this.optional = true;
      this.type = firstMatch.groups.optional.endsWith('...')
        ? 'string-array'
        : 'string';
      this.valueNameDisplay = firstMatch.groups.optional;
    } else {
      this.optional = false;
      this.type = 'boolean';
    }

    this.valueName = '';

    if (secondMatch.groups.short) {
      this.valueName = secondMatch.groups.short.slice(1);
      this.short = secondMatch.groups.short;
    }
    if (secondMatch.groups.long) {
      const longOriginForm = secondMatch.groups.long.slice(2);
      this.valueName = snakeAndKebabToCamelCase(longOriginForm);
      this.long = secondMatch.groups.long;
    }

    if (this.valueName === '') {
      throw new OptionFlagError(flag);
    }

    this.required = required;
    this.processed = false;
    // TODO: add reverse option and chioces
  }

  public setDescription(desc: string) {
    this.description = desc;
    return this;
  }

  public setDefault(defaultValue: string | boolean, desc?: string) {
    this.defaultValue = defaultValue;
    this.defaultDescription = desc;
    return this;
  }

  public getDisplayName() {
    return `${this.short ?? ''}${this.short && this.long ? ', ' : ''}${
      this.long ?? ''
    }${
      this.valueNameDisplay
        ? this.optional
          ? ` [${this.valueNameDisplay}]`
          : ` <${this.valueNameDisplay}>`
        : ''
    }`;
  }
}
