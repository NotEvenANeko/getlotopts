import { Option } from './option.ts';
import { Argument } from './argument.ts';
import { isNotValue, isOptionFlag } from './util.ts';

export class Command<T> {
  private options: Option[];
  private arguments: Argument[];
  private versionStr?: string;
  private commandName?: string;
  private usageStr?: string;
  private globalOptionalDefault: boolean | string | string[] = true;
  private optionRes: Record<string, unknown>;
  private argumentRes: Record<string, unknown>;

  constructor() {
    this.options = [];
    this.arguments = [];
    this.optionRes = {};
    this.argumentRes = {};
  }

  private findOption(flag: string) {
    return this.options.findIndex((option) =>
      option.short === flag || option.long === flag
    );
  }

  public addOption(option: Option) {
    this.options.push(option);
    return this;
  }

  public option(flag: string, desc?: string) {
    const tempOption = new Option(flag);
    desc && tempOption.setDescription(desc);
    this.options.push(tempOption);
    return this;
  }

  public requiredOption(flag: string, desc?: string) {
    const tempOption = new Option(flag, true);
    desc && tempOption.setDescription(desc);
    this.options.push(tempOption);
  }

  public version(ver: string) {
    this.versionStr = ver;
    return this;
  }

  public name(name: string) {
    this.commandName = name;
    return this;
  }

  public argument(flags: string, desc?: string) {
    const flagsArr = flags.split(' ');
    if (flagsArr.length === 1) {
      const tempArg = new Argument(flagsArr[0]);
      desc && tempArg.setDescription(desc);
      this.arguments.push(tempArg);
    } else if (flagsArr.length > 1) {
      this.arguments = this.arguments.concat(
        flagsArr.map((flag) => new Argument(flag)),
      );
    }
    return this;
  }

  public usage(usage: string) {
    this.usageStr = usage;
    return this;
  }

  private checkUnprocessedRequiredOption() {
    const unprocessedIndex = this.options.findIndex((value) =>
      value.required && !value.processed
    );
    if (unprocessedIndex !== -1) {
      console.error(
        `error: required option '${
          this.options[unprocessedIndex].getDisplayName()
        }' not found`,
      );
      Deno.exit(1);
    }
  }

  public parse(args = Deno.args) {
    let iter = 0;
    let argIter = 0;
    let optionFinished = false;
    const optionAns: Record<string, unknown> = {};
    const argsAns: Record<string, unknown> = {};

    while (iter < args.length) {
      if (optionFinished) {
        // processing args
        if (argIter >= this.arguments.length) break;

        while (argIter < this.arguments.length && iter < args.length) {
          const curArg = this.arguments[argIter];

          switch (curArg.type) {
            case 'string': {
              argsAns[curArg.valueName] = args[iter];
              break;
            }
            case 'string-array': {
              if (argsAns[curArg.valueName] === undefined) {
                argsAns[curArg.valueName] = [];
              }
              while (iter < args.length) {
                argsAns[curArg.valueName] = [
                  ...(argsAns[curArg.valueName] as string[]),
                  args[iter],
                ];
                iter += 1;
              }
              break;
            }
          }
          argIter += 1;
        }
        continue;
      }
      if (args[iter] === '--') { // option finished
        optionFinished = true;
        this.checkUnprocessedRequiredOption();
      } else if (isOptionFlag(args[iter])) { // processing options
        const index = this.findOption(args[iter]);

        if (index === -1) {
          console.error(`error: option '${args[iter]}' is not valid option.`);
          Deno.exit(1);
        }

        this.options[index].processed = true; // processed
        const option = this.options[index];

        if (option.type === 'boolean') { // process boolean
          optionAns[option.valueName] = true;
        } else if (option.type === 'string') { // process string
          if (
            isNotValue(args[iter + 1])
          ) {
            if (option.optional) {
              optionAns[option.valueName] = this.globalOptionalDefault;
            } else {
              console.error(
                `error: option '${option.getDisplayName()}' needs a value.`,
              );
              Deno.exit(1);
            }
          } else {
            iter += 1;
            optionAns[option.valueName] = args[iter];
          }
        } else if (option.type === 'string-array') {
          if (optionAns[option.valueName] === undefined) {
            optionAns[option.valueName] = [];
          }
          if (isNotValue(args[iter + 1])) {
            console.error(
              `error: option '${option.getDisplayName()}' needs a value.`,
            );
            Deno.exit(1);
          }
          while (!isNotValue(args[iter + 1])) {
            optionAns[option.valueName] = [
              ...(optionAns[option.valueName] as string[]),
              args[iter + 1],
            ];
            iter += 1;
          }
        }
      } else { // processing args
        if (argIter >= this.arguments.length) break;
        const curArg = this.arguments[argIter];
        switch (curArg.type) {
          case 'string': {
            argsAns[curArg.valueName] = args[iter];
            argIter += 1;
            break;
          }
          case 'string-array': {
            if (argsAns[curArg.valueName] === undefined) {
              argsAns[curArg.valueName] = [];
            }
            argsAns[curArg.valueName] = [
              ...(argsAns[curArg.valueName] as string[]),
              args[iter],
            ];
            break;
          }
        }
      }
      iter += 1;
    }

    this.checkUnprocessedRequiredOption();

    if (
      argIter + 1 < this.arguments.length &&
      this.arguments[argIter + 1].required
    ) {
      console.error(
        `error: argument '${
          this.arguments[argIter + 1].valueNameDisplay
        }' is required.`,
      );
      Deno.exit(1);
    }

    this.optionRes = optionAns;
    this.argumentRes = argsAns;
  }

  public getOpts() {
    return this.optionRes;
  }

  public getArgs() {
    return this.argumentRes;
  }
}
