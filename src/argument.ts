import { ArgumentFlagRegex } from './constant.ts';
import { ArgumentFlagError } from './error.ts';
import { snakeAndKebabToCamelCase } from './util.ts';
import { ArgumentValueType } from './interface.ts';

export class Argument {
  public required: boolean;
  public valueName: string;
  public valueNameDisplay: string;
  public description?: string;
  public readonly type: ArgumentValueType;

  constructor(flag: string) {
    const matchRes = ArgumentFlagRegex.exec(flag);
    if (!matchRes || !matchRes.groups) throw new ArgumentFlagError(flag);
    if (matchRes.groups.required) {
      this.required = true;
      this.valueNameDisplay = matchRes.groups.required;
      this.type = matchRes.groups.required.endsWith('...')
        ? 'string-array'
        : 'string';
      this.valueName = snakeAndKebabToCamelCase(
        matchRes.groups.required.replace('...', ''),
      );
    } else if (matchRes.groups.optional) {
      this.required = false;
      this.valueNameDisplay = matchRes.groups.optional;
      this.type = matchRes.groups.optional.endsWith('...')
        ? 'string-array'
        : 'string';
      this.valueName = snakeAndKebabToCamelCase(
        matchRes.groups.optional
          .replace('...', ''),
      );
    } else {
      throw new ArgumentFlagError(flag);
    }
  }

  public setDescription(desc: string) {
    this.description = desc;
    return this;
  }
}
