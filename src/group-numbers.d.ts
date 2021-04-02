/* eslint-disable prettier/prettier */

declare module "group-numbers" {
  /**
   * Partitions an array of numbers into continuous groups.
   * @param numbers The array of numbers to be grouped.
   */
  export default function groupNumbers(numbers: number[]): (number[] | number)[];

  /**
   * Partitions an array of numbers into continuous groups.
   * @param numbers The array of numbers to be grouped.
   * @param returnSingleElements Whether to return single elements in the array as single elements or in an array (of a single element). Defaults to true.
   */
  export default function groupNumbers(numbers: number[], returnSingleElements: true): (number[] | number)[];

  /**
   * Partitions an array of numbers into continuous groups.
   * @param numbers The array of numbers to be grouped.
   * @param returnSingleElements Whether to return single elements in the array as single elements or in an array (of a single element). Defaults to true.
   */
  export default function groupNumbers(numbers: number[], returnSingleElements: false): number[][];
}
