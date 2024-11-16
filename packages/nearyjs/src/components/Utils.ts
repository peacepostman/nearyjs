import { NearyResponseType } from './Neary'

/**
 *
 * Compare two arrays of values
 *
 * @param a1 Array of numbers or boolean
 * @param a2 Array of numbers or boolean
 * @returns boolean
 */
export function areEquals(
  a1: NearyResponseType[],
  a2: NearyResponseType[]
): boolean {
  return JSON.stringify(a1) === JSON.stringify(a2)
}

/**
 * Throttle function
 * @param fn
 * @param wait
 * @returns
 */
export function throttle(fn: Function, wait: number) {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number
  return function (this: any) {
    const context = this,
      args = arguments
    if (!inThrottle) {
      fn.apply(context, args)
      lastTime = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFn)
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args)
          lastTime = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastTime), 0))
    }
  }
}

var nearyID = 0
export function generateUID(suffix?: string) {
  suffix = 'neary_' + (suffix ? suffix : '')
  var id = ++nearyID
  return String(suffix + id)
}
