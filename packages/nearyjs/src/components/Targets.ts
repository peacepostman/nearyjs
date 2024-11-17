import {
  NearyResponseType,
  NearySettedElementNode,
  NearySettedElementType
} from './Neary'
import { defaultOptions, NearyConfigType, NearyFormatType } from './Options'
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
  /**
   * Context in which the element is located
   * Default is window
   */
  context?: NearyTargetType
  /**
   * Determine the return type of the function
   * Default is boolean
   *
   * Boolean: return boolean value for elements. True means in proximity and false means not in proximity
   * Array: return array of numeric values between 0 and 1 for elements. Zero means not in proximity and 1 means in proximity
   */
  format?: NearyFormatType
  /**
   * Boolean to enable listener for target, default is true
   */
  enabled?: boolean
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
        const context = baseOptions.defaults?.context || undefined
        return {
          target: node as Element,
          distance,
          onProximity,
          context
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
  elements: NearyTargetsType[],
  options: NearyConfigType
): NearySettedElementType[] {
  return elements.map((element) => {
    const target = setTarget(element.target)
    const context = element.context
      ? setTarget(element.context, true)
      : undefined
    const uid = generateUID()
    let contextUID = generateUID('context_')
    if (target) {
      target.setAttribute('data-neary', '')
      target.setAttribute('data-neary-uid', uid)
    }
    if (context) {
      const contextCurrentID = context.getAttribute('data-neary-context-uid')
      if (!contextCurrentID) {
        context.setAttribute('data-neary-context-uid', contextUID)
      } else {
        contextUID = contextCurrentID
      }
    }
    return {
      target,
      uid,
      distance: setDistance(element.distance || options.defaults?.distance),
      format: element.format || options.format || defaultOptions.format,
      enabled: typeof element.enabled !== 'undefined' ? element.enabled : true,
      context,
      contextUID
    }
  })
}

/**
 * Return a node element from target parameter
 * @param target
 * @returns
 */
function setTarget(
  target?: NearyTargetType,
  isContext?: boolean
): NearySettedElementNode {
  if (typeof target === 'undefined') {
    throw new Error(`NearyJS - ${isContext ? 'Context' : 'Target'} is required`)
  }
  if (typeof target === 'string') {
    var node = document.querySelector(target)
    if (node) {
      return node
    } else {
      throw new Error(
        `NearyJS - ${
          isContext ? 'Context' : 'Target'
        } not found, was looking for "${target}"`
      )
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
