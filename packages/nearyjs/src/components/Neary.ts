import {
  throttle,
  areEquals,
  setTarget,
  setDistance,
  setProximity,
  generateUID,
  setTargets
} from './Utils'

import {
  areOptionsEqual,
  areTargetsEqual,
  defaultOptions,
  mergeOptions,
  NearyConfigType,
  NearyConfigTypePartial
} from './Options'

import { NearyElementDebugType, setDebug, setDebugActive } from './Debug'

export type NearyTargetDistanceType = number | { x: number; y: number }
export type NearySettedElementType = {
  target: Element | undefined
  uid: string
  distance: {
    x: number
    y: number
  }
}[]
export type NearyTargetType = Element | string
export type NearyResponseType =
  | {
      data: boolean | number
      uid: string
      target: Element | undefined
    }
  | undefined

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

export type NearyInstancetype = {
  kill: () => void
  reboot: (
    newTargets?: NearyTargetsType | NearyTargetsType[],
    newOptions?: NearyConfigType
  ) => void
  getElements: () => {
    targets: NearySettedElementType
    debug: NearyElementDebugType
  }
}

function Neary({
  targets,
  options
}: {
  /**
   * An array of element on which we must detect proximity
   */
  targets: NearyTargetsType | NearyTargetsType[] | undefined
  /**
   * Neary options
   */
  options?: NearyConfigTypePartial
}): NearyInstancetype {
  let baseOptions = mergeOptions(defaultOptions, options)
  let previousData: NearyResponseType[] = []
  let storedTargets: NearyTargetsType | NearyTargetsType[] | undefined = targets
  let elements: NearyTargetsType[] | undefined = undefined
  let elementsSetted: NearySettedElementType = []
  let elementsDebugTarget: NearyElementDebugType = undefined

  /**
   * Build targets once
   */
  const buildTargets = () => {
    elements = setTargets(targets, baseOptions)
    console.log('elements', { elements, targets, baseOptions })
    if (elements) {
      elementsSetted = elements.map((element) => {
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
      if (baseOptions.debug) {
        elementsDebugTarget = setDebug(elementsSetted)
      }
    }
  }

  /**
   * On mouse move action
   * @param event: MouseEvent
   */
  const onMoveThrottled = throttle((event: MouseEvent) => {
    const { pageX: mouseX, pageY: mouseY } = event
    const { format, debug, onProximity } = baseOptions
    const newData: NearyResponseType[] = []
    if (elements && elementsSetted && elementsSetted.length > 0) {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index]
        const { target, distance, uid } = elementsSetted[index]

        if (target) {
          const { proximity, emit } = setProximity(format, target, distance, {
            x: mouseX,
            y: mouseY
          })

          target.setAttribute('data-neary-proximity', proximity.toString())
          if (debug) {
            setDebugActive(elementsDebugTarget, index, proximity)
          }

          if (element.onProximity) {
            element.onProximity({ data: emit, uid, target })
          }
          newData.push({
            uid,
            target,
            data: emit
          })
        } else {
          newData.push({
            uid,
            target: undefined,
            data: false
          })
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
  }, baseOptions.throttleDelay)

  const onResizeThrottled = throttle(() => {
    if (elementsDebugTarget && elementsDebugTarget.length > 0) {
      elementsDebugTarget.forEach((element) => {
        element.remove()
      })
      elementsDebugTarget = setDebug(elementsSetted)
    }
  }, 100)

  /**
   * Boot Neary
   */
  const boot = () => {
    if (baseOptions.enabled) {
      buildTargets()
      if (elementsSetted && elementsSetted.length > 0) {
        document.addEventListener('mousemove', onMoveThrottled, {
          passive: true
        })
      }
      if (elementsDebugTarget && elementsDebugTarget.length > 0) {
        window.addEventListener('resize', onResizeThrottled, {
          passive: true
        })
      }
    }
  }

  /**
   * Reboot Neary with new targets or options or both
   * @param newTargets
   * @param newOptions
   */
  const reboot = (
    newTargets?: NearyTargetsType | NearyTargetsType[],
    newOptions?: NearyConfigType
  ) => {
    newTargets = newTargets
      ? !Array.isArray(newTargets)
        ? [newTargets]
        : newTargets
      : undefined
    if (newTargets && !areTargetsEqual(newTargets, storedTargets)) {
      targets = newTargets
    }
    if (newOptions && !areOptionsEqual(newOptions, baseOptions)) {
      baseOptions = mergeOptions(baseOptions, newOptions)
    }
    kill()
    boot()
  }

  /**
   * Kill Neary instance and clear stored values
   */
  const kill = () => {
    if (elementsSetted && elementsSetted.length > 0) {
      document.removeEventListener('mousemove', onMoveThrottled)
    }
    if (elementsDebugTarget && elementsDebugTarget.length > 0) {
      document.removeEventListener('resize', onResizeThrottled)
      elementsDebugTarget.forEach((element) => {
        element.remove()
      })
    }
    previousData = []
    elements = []
    elementsSetted = []
    elementsDebugTarget = undefined
  }

  boot()

  return {
    kill,
    reboot,
    getElements: () => ({
      targets: elementsSetted,
      debug: elementsDebugTarget
    })
  }
}

export default Neary
