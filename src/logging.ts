import chalk from 'chalk';

export const formatLabel = (label: string): string => `${chalk.bold(label)}:`;

export const formatIterableLabel = (label: string, size: number): string =>
  `${formatLabel(label)} ${chalk.dim(`(${size} listed below)`)}`;

export type Primitive = undefined | null | string | number;

export const formatPrimitive = (primitive: Primitive): string => {
  if (primitive === undefined) {
    return chalk.dim(`<undefined>`);
  } else if (primitive === null) {
    return chalk.dim(`<null>`);
  } else if (typeof primitive === 'number') {
    return primitive.toString();
  } else {
    return JSON.stringify(primitive);
  }
}

export const formatFile = (path?: string | null): string => {
  if (path == null) {
    return formatPrimitive(path);
  }

  return chalk.cyan(path);
}
