import {
  throttle,
  areEquals,
  setDebug,
  setTarget,
  setDistance,
  setProximity,
  setDefaultProximity
} from './Utils'

export type NearyTargetDistanceType = number | { x: number; y: number }
export type NearyTargetType = Element | string
export type NearyFormatType = 'boolean' | 'percentage'
export type NearyProximityType = boolean | number
export type NearyResponseType = NearyProximityType[]

export type NearyElementType = {
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
  onProximity?: (data: NearyProximityType, el: Element) => void
}
export type NearyConfigType = {
  /**
   * An array of element on which we must detect proximity
   */
  elements: NearyElementType | NearyElementType[]
  /**
   * Boolean to enable listener, default is true
   */
  enabled?: boolean
  /**
   * Enable debug mode
   */
  debug?: boolean
  /**
   * Determine the return type of the function
   * Default is boolean
   *
   * Boolean: return boolean value for elements. True means in proximity and false means not in proximity
   * Array: return array of numeric values between 0 and 1 for elements. Zero means not in proximity and 1 means in proximity
   */
  format?: NearyFormatType
  /**
   * Callback function to call when elements proximity state change
   * This function will be executed only if the proximity state of the elements has changed
   */
  onProximity?: (values: NearyResponseType) => void
}

function Neary(options: NearyConfigType) {
  if (typeof options.enabled === 'undefined') {
    options.enabled = true
  }
  if (typeof options.format === 'undefined') {
    options.format = 'boolean'
  }
  if (!Array.isArray(options.elements)) {
    options.elements = [options.elements]
  }

  const { enabled, elements, format, onProximity } = options
  const elementsSetted = elements.map((element) => ({
    target: setTarget(element.target),
    distance: setDistance(element.distance)
  }))

  let previousData: NearyResponseType = []

  let debugTargets: NodeListOf<HTMLElement> | undefined = undefined
  if (options.debug) {
    setDebug(elements)
    debugTargets = document.querySelectorAll('[data-neary-debug-id]')
  }

  function proximity(event: MouseEvent) {
    const { pageX: mouseX, pageY: mouseY } = event
    const newData: NearyResponseType = []

    if (elementsSetted && elementsSetted.length > 0) {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index]
        const { target, distance } = elementsSetted[index]

        if (target) {
          const rect = target.getBoundingClientRect()
          const { left, top, right, bottom } = {
            top: rect.top - distance.y,
            right: rect.right + distance.x,
            bottom: rect.bottom + distance.y,
            left: rect.left - distance.x
          }

          const isInProximity =
            mouseX >= left + window.scrollX &&
            mouseX <= right + window.scrollX &&
            mouseY >= top + window.scrollY &&
            mouseY <= bottom + window.scrollY

          target.setAttribute('data-neary-proximity', isInProximity.toString())
          if (options.debug) {
            if (debugTargets && debugTargets[index]) {
              debugTargets[index].style.borderColor = isInProximity
                ? 'rgba(66,239,66,.8)'
                : 'rgba(239,66,66,.8)'
            }
          }

          const emittedValue = setProximity(format, isInProximity, {
            mouseX,
            mouseY,
            left,
            top,
            right,
            bottom,
            width: rect.width,
            height: rect.height,
            windowW: window.innerWidth,
            windowH: window.innerHeight
          })

          if (element.onProximity) {
            element.onProximity(emittedValue, target)
          }
          newData.push(emittedValue)
        } else {
          newData.push(false)
        }
      }
    }
    if (onProximity) {
      /**
       * Only emit global change if data is different from previous data
       */
      if (previousData.length === 0 || !areEquals(newData, previousData)) {
        onProximity(newData)
        previousData = newData
      }
    }
  }

  if (elements) {
    if (enabled) {
      const throttleProximity = throttle(proximity, 100)
      document.addEventListener('mousemove', throttleProximity)
      return () => document.removeEventListener('mousemove', throttleProximity)
    } else {
      if (onProximity) {
        onProximity(
          new Array(elements.length).fill(setDefaultProximity(format))
        )
      }
    }
  }
}

export default Neary
