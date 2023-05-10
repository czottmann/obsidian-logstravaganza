/**
 * Creates a debounced function that delays the execution of the original
 * function until a certain amount of time has passed since the last invocation.
 *
 * @param func - The original function to be debounced.
 * @param delayInMs - The delay in milliseconds before invoking the debounced
 *                    function.
 * @returns The resulting debounced function.
 */
export function debounce(func: Function, delayInMs: number): Function {
  let timeoutId: any;

  return function (...args: any[]): void {
    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout to invoke the function after the specified delay
    timeoutId = setTimeout(() => {
      // Apply the original function with the provided arguments
      func.apply(this, args);
    }, delayInMs);
  };
}
