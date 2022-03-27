import { OptionFlagError } from './error.ts';
import { OptionValueType } from './interface.ts';
import { resolveOptionFlagToParams } from './util.ts';

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
    const flagRes = resolveOptionFlagToParams(flag);

    if (!flagRes) throw new OptionFlagError(flag);

    this.long = flagRes.long;
    this.short = flagRes.short;
    this.type = flagRes.optionType;
    this.optional = flagRes.optionOptional;
    this.valueName = flagRes.optionName;
    this.valueNameDisplay = flagRes.optionValueDisplayName;

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
