import {
  NearyTargetsType,
  NearyResponseType,
  NearyTargetDistanceType,
  NearyTargetType
} from './Neary'

import { NearyConfigType, NearyFormatType } from './Options'

var idCounter = 0

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

export function generateUID() {
  var id = ++idCounter
  return String('neary_' + id)
}

export function setTargets(
  targets: NearyTargetsType[] | NearyTargetsType | undefined,
  baseOptions: NearyConfigType
): NearyTargetsType[] | undefined {
  function setElementFallback() {
    const nodes = document.querySelectorAll('[data-neary]')
    if (nodes && nodes.length > 0) {
      return Array.from(nodes).map((node) => {
        const distance = baseOptions.defaults?.distance || { x: 0, y: 0 }
        const onProximity = baseOptions.defaults?.onProximity || undefined
        return {
          target: node as Element,
          distance,
          onProximity
        }
      })
    }
    return undefined
  }

  return targets
    ? !Array.isArray(targets)
      ? [targets]
      : targets
    : setElementFallback()
}

/**
 * Return Element from Neary elements parameter
 * @param target
 * @returns
 */
export function setTarget(target?: NearyTargetType): Element | undefined {
  if (typeof target === 'undefined') {
    throw new Error('NearyJS - Target is required')
  }
  if (typeof target === 'string') {
    var node = document.querySelector(target)
    if (node) {
      return node
    } else {
      throw new Error('NearyJS - Target not found')
    }
  }
  if (target instanceof Element) {
    return target
  }
}

/**
 * Return distance from Neary elements parameter
 * @param distance
 * @returns
 */
export function setDistance(distance?: NearyTargetDistanceType): {
  x: number
  y: number
} {
  const defaultDistance = { x: 0, y: 0 }
  if (distance !== undefined) {
    if (typeof distance === 'number') {
      return { x: distance, y: distance }
    }
    if (
      typeof distance === 'object' &&
      distance.hasOwnProperty('x') &&
      typeof distance.x === 'number' &&
      distance.hasOwnProperty('y') &&
      typeof distance.y === 'number'
    ) {
      return distance
    }
    return defaultDistance
  }
  return defaultDistance
}

/**
 * Return appropriate proximity value according to expected output format
 * @param format
 * @param target
 * @param distance
 * @param cursor
 * @returns
 */
export function setProximity(
  format: NearyFormatType,
  target: Element,
  distance: { x: number; y: number },
  cursor: { x: number; y: number }
) {
  const rect = target.getBoundingClientRect()
  const { left, top, right, bottom } = {
    top: rect.top - distance.y,
    right: rect.right + distance.x,
    bottom: rect.bottom + distance.y,
    left: rect.left - distance.x
  }
  const { x: mouseX, y: mouseY } = cursor
  const windowW = window.innerWidth
  const windowH = window.innerHeight

  const proximity =
    mouseX >= left + window.scrollX &&
    mouseX <= right + window.scrollX &&
    mouseY >= top + window.scrollY &&
    mouseY <= bottom + window.scrollY

  if (format === 'boolean') {
    return {
      proximity,
      emit: proximity
    }
  }

  /**
   * Return percentage value
   * @param partial
   * @param total
   * @returns
   */
  function percentage(partial: number, total: number) {
    const percent = (100 * partial) / total
    return percent > 100 ? 100 : Number(percent.toFixed(2))
  }

  const { leftPercent, topPercent, rightPercent, bottomPercent } = {
    leftPercent:
      mouseY > top && mouseY < bottom && mouseX < left + rect.width / 2
        ? percentage(mouseX, left)
        : 0,
    topPercent: mouseY < top ? percentage(mouseY, top) : 0,
    rightPercent:
      mouseY > top && mouseY < bottom && mouseX > left + rect.width / 2
        ? percentage(windowW - mouseX, windowW - right)
        : 0,
    bottomPercent:
      mouseY > bottom ? percentage(windowH - mouseY, windowH - bottom) : 0
  }

  const percent = Math.max(leftPercent, topPercent, rightPercent, bottomPercent)

  return {
    proximity,
    emit: percent
  }
}
