import { NearyResponseType, NearySettedElementType } from './Neary'
import { NearyConfigType } from './Options'
import { generateUID } from './Utils'

export type NearyTargetDistanceType = number | { x: number; y: number }
export type NearyTargetType = Element | string
export type NearyTargetsType = {
  /**
   * A node ref
   */
  target: NearyTargetType
  /**
   * Distance in pixel around element, default is 0
   */
  distance?: NearyTargetDistanceType
  /**
   * Callback function to call when element is in proximity
   */
  onProximity?: (response: NearyResponseType) => void
}

export function prepareTargets(
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

export function setTargets(
  elements: NearyTargetsType[]
): NearySettedElementType {
  return elements.map((element) => {
    const target = setTarget(element.target)
    const uid = generateUID()
    if (target) {
      target.setAttribute('data-neary', '')
      target.setAttribute('data-neary-uid', uid)
    }
    return {
      target,
      uid,
      distance: setDistance(element.distance)
    }
  })
}

/**
 * Return a node element from target parameter
 * @param target
 * @returns
 */
function setTarget(target?: NearyTargetType): Element | undefined {
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
function setDistance(distance?: NearyTargetDistanceType): {
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
