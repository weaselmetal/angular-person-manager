/**
 * Check if the passed value is a well-defined
 * @param value to check
 * @returns false if null or undefined, else true
 */
export function isPresent(value: any): boolean {
  return value !== null && value !== undefined
}
