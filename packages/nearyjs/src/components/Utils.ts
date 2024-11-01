import {
  NearyElementType,
  NearyFormatType,
  NearyResponseType,
  NearyTargetDistanceType,
  NearyTargetType
} from './Neary'

/**
 *
 * Compare two arrays of numbers
 *
 * @param a1 Array of numbers
 * @param a2 Array of numbers
 * @returns boolean
 */
function areEquals(a1: NearyResponseType, a2: NearyResponseType) {
  return JSON.stringify(a1) == JSON.stringify(a2)
}

/**
 * Throttle function
 * @param fn
 * @param wait
 * @returns
 */
function throttle(fn: Function, wait: number) {
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

/**
 * Return Element from Neary elements parameter
 * @param target
 * @returns
 */
function setTarget(target?: NearyTargetType) {
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
function setDistance(distance?: NearyTargetDistanceType) {
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
 * Add debugs overlay on elements
 * @param elements
 */
function setDebug(elements: NearyElementType[]) {
  type styleType = Partial<CSSStyleDeclaration> & { [propName: string]: string }
  function css(element: HTMLElement, style: styleType) {
    Object.keys(style).forEach((styleKey: string) => {
      ;(element.style as styleType)[styleKey] = style[styleKey]
    })
  }

  if (elements.length > 0) {
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index]
      const target = setTarget(element.target) as HTMLElement
      const distance = setDistance(element.distance)
      if (target) {
        const { width, height, x, y } = target.getBoundingClientRect()
        const copy = document.createElement('div')
        copy.setAttribute('data-neary-debug-id', index.toString())
        css(copy, {
          position: 'absolute',
          top: `${y - distance.y}px`,
          left: `${x - distance.x}px`,
          width: `${width + distance.x * 2}px`,
          height: `${height + distance.y * 2}px`,
          borderWidth: '1px',
          borderStyle: 'dashed',
          borderColor: 'rgba(239,66,66,.8)',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          zIndex: '99999999999999'
        })
        document.body.appendChild(copy)
      }
    }
  }
}

/**
 * Retrun appropriate proximity value according to expected output format
 * @param format
 * @param value
 * @param proximityData
 * @returns
 */
function setProximity(
  format: NearyFormatType,
  value: boolean,
  proximityData: {
    mouseX: number
    mouseY: number
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
    windowW: number
    windowH: number
  }
) {
  if (typeof value === 'boolean') {
    if (format === 'boolean') {
      return value
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

    const { left, top, right, bottom } = {
      left:
        proximityData.mouseY > proximityData.top &&
        proximityData.mouseY < proximityData.bottom &&
        proximityData.mouseX < proximityData.right - proximityData.width / 2
          ? percentage(
              proximityData.mouseX,
              proximityData.windowW - proximityData.right
            )
          : 0,
      top:
        proximityData.mouseY < proximityData.top
          ? percentage(proximityData.mouseY, proximityData.top)
          : 0,
      right:
        proximityData.mouseY > proximityData.top &&
        proximityData.mouseY < proximityData.bottom &&
        proximityData.mouseX > proximityData.left + proximityData.width / 2
          ? percentage(
              proximityData.windowW - proximityData.mouseX,
              proximityData.windowW - proximityData.right
            )
          : 0,
      bottom:
        proximityData.mouseY > proximityData.bottom
          ? percentage(
              proximityData.windowH - proximityData.mouseY,
              proximityData.windowH - proximityData.bottom
            )
          : 0
    }
    console.log('setProximity', { left, top, right, bottom })
    return Math.max(left, top, right, bottom)
  }
  return setDefaultProximity(format)
}

/**
 * Return default proximity value according to expected output format
 * @param format
 * @returns
 */
function setDefaultProximity(format: NearyFormatType) {
  if (format === 'boolean') {
    return false
  }
  return 0
}

export {
  throttle,
  setDebug,
  areEquals,
  setTarget,
  setDistance,
  setProximity,
  setDefaultProximity
}
