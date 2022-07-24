import { Option } from './option.ts';
import { Argument } from './argument.ts';
import { OptionFlagError } from './error.ts';
import { OptionHelpOutput, ParseOptionToType } from './interface.ts';
import {
  concatFlag,
  isNotValue,
  isOptionFlag,
  resolveOptionFlagToParams,
} from './util.ts';

export class Command<
  Opt extends Record<string, unknown> = Record<never, never>,
  Arg extends Record<string, unknown> = Record<never, never>,
> {
  private options: Option[]; // Options like -a, --all <value>
  private arguments: Argument[]; // Arguments like npm i this-is-argument

  private versionNumber?: string;
  private versionDescription?: string;
  private versionFlagShort?: string;
  private versionFlagLong?: string;

  private helpFlagShort: string;
  private helpFlagLong: string;
  private helpDescription?: string;

  private commandName?: string;
  private commandUsage?: string;
  private commandDescription?: string;

  private globalOptionalDefault: boolean | string | string[] = true;
  private optionRes: Opt; // Parsed options
  private argumentRes: Arg; // Parsed arguments

  constructor() {
    this.options = [];
    this.arguments = [];
    this.optionRes = {} as Opt;
    this.argumentRes = {} as Arg;

    this.versionFlagShort = '-V';
    this.versionFlagLong = '--version';
    this.versionDescription = 'display version';
    this.helpFlagShort = '-h';
    this.helpFlagLong = '--help';
    this.helpDescription = 'display this help message';
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

  public option<Flag extends string>(
    flag: Flag,
    desc?: string,
  ): Command<Opt & ParseOptionToType<Flag>> {
    const tempOption = new Option(flag);
    desc && tempOption.setDescription(desc);
    this.options.push(tempOption);
    return this as Command<Opt & ParseOptionToType<Flag>>;
  }

  public requiredOption<Flag extends string>(
    flag: Flag,
    desc?: string,
  ): Command<Opt & ParseOptionToType<Flag, true>> {
    const tempOption = new Option(flag, true);
    desc && tempOption.setDescription(desc);
    this.options.push(tempOption);
    return this as Command<Opt & ParseOptionToType<Flag, true>>;
  }

  public version(ver: string, flag?: string, description?: string) {
    this.versionNumber = ver;
    if (flag) {
      const flagRes = resolveOptionFlagToParams(flag);
      if (!flagRes) throw new OptionFlagError(flag);
      this.versionFlagLong = flagRes.optionLong;
      this.versionFlagShort = flagRes.optionShort;
    }
    description && (this.versionDescription = description);
    return this;
  }

  public name(name: string) {
    this.commandName = name;
    return this;
  }

  public description(description: string) {
    this.commandDescription = description;
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
    this.commandUsage = usage;
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
        }' not found.`,
      );
      Deno.exit(1);
    }
  }

  private versionAvailable() {
    return (this.versionFlagShort || this.versionFlagLong) &&
      this.versionNumber;
  }

  private helpAvailable() {
    return this.helpFlagLong || this.helpFlagShort;
  }

  private processHelp(args: string[]) {
    const index = args.findIndex((value) =>
      value === this.helpFlagLong || value === this.helpFlagShort
    );

    if (index === -1) {
      return;
    }

    let outputArray: string[] = [];

    if (this.commandName && this.commandUsage) {
      outputArray.push(`Usage: ${this.commandName} ${this.commandUsage}`);
      outputArray.push('');
    }

    if (this.commandDescription) {
      outputArray.push(this.commandDescription);
      outputArray.push('');
    }

    if (
      this.options.length || this.versionAvailable() || this.helpAvailable()
    ) {
      outputArray.push('Options:');

      let optionsOutput: OptionHelpOutput = {
        output: [],
        maxPrefixLength: 0,
      };

      if (this.options.length) {
        optionsOutput = this.options.reduce<OptionHelpOutput>((pre, cur) => {
          const text = cur.getHelpText();
          return {
            maxPrefixLength: Math.max(pre.maxPrefixLength, text.name.length),
            output: [...pre.output, [text.name, text.description || '']],
          };
        }, {
          output: [],
          maxPrefixLength: 0,
        });
      }

      if (this.versionAvailable()) {
        const prefix = concatFlag(this.versionFlagShort, this.versionFlagLong);
        optionsOutput.output.push([
          prefix,
          this.versionDescription ?? '',
        ]);
        optionsOutput.maxPrefixLength = Math.max(
          prefix.length,
          optionsOutput.maxPrefixLength,
        );
      }

      if (this.helpAvailable()) {
        const prefix = concatFlag(this.helpFlagShort, this.helpFlagLong);
        optionsOutput.output.push([
          prefix,
          this.helpDescription ?? '',
        ]);
        optionsOutput.maxPrefixLength = Math.max(
          optionsOutput.maxPrefixLength,
          prefix.length,
        );
      }

      outputArray = outputArray.concat(
        optionsOutput.output
          .sort(([first, _f], [second, _s]) => {
            if (first.startsWith('--') && second.startsWith('-')) return 1;
            if (first.startsWith('-') && second.startsWith('--')) return -1;
            if (first.startsWith('-') && second.startsWith('-')) {
              return first.slice(1) < second.slice(1) ? -1 : 1;
            }
            if (first.startsWith('--') && second.startsWith('--')) {
              return first.slice(2) < second.slice(2) ? -1 : 1;
            }
            return 0;
          })
          .map(([prefix, desc]) => {
            return '  ' + prefix.padEnd(optionsOutput.maxPrefixLength, ' ') +
                '  ' +
                desc ?? '';
          }),
      );
    }

    console.log(outputArray.join('\n'));
    Deno.exit(0);
  }

  private processVersion(args: string[]) {
    if (!this.versionNumber) return;
    const index = args.findIndex((value) =>
      value === this.versionFlagLong || value === this.versionFlagShort
    );
    if (index !== -1) {
      console.log(this.versionNumber);
      Deno.exit(0);
    }
  }

  public parse(args = Deno.args) {
    let iter = 0;
    let argIter = 0;
    let optionFinished = false;
    const optionAns: Record<string, unknown> = {};
    const argsAns: Record<string, unknown> = {};

    this.processHelp(args);
    this.processVersion(args);

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
      argIter < this.arguments.length &&
      this.arguments[argIter].required
    ) {
      console.error(
        `error: argument '${
          this.arguments[argIter].valueNameDisplay
        }' is required.`,
      );
      Deno.exit(1);
    }

    this.optionRes = optionAns as Opt & { [key: string]: unknown };
    this.argumentRes = argsAns as Arg & { [key: string]: unknown };
  }

  public getOpts() {
    return this.optionRes;
  }

  public getArgs() {
    return this.argumentRes;
  }
}
