import { throttle, areEquals } from './Utils'

import type { NearyConfigTypePartial } from './Options'
import {
  areOptionsEqual,
  areTargetsEqual,
  defaultOptions,
  mergeOptions
} from './Options'

import type { NearyTargetsType } from './Targets'
import { prepareTargets, setTargets } from './Targets'

import type { NearyElementDebugType } from './Debug'
import { setDebug, setDebugActive } from './Debug'
import { setProximity } from './Proximity'

export type NearySettedElementNode = Element | undefined

export type NearySettedElementType = {
  target: NearySettedElementNode
  uid: string
  distance: {
    x: number
    y: number
  }
  context: NearySettedElementNode
}

export type NearyResponseType =
  | {
      data: boolean | number
      uid: string
      target: NearySettedElementNode
    }
  | undefined

export type NearyInstancetype = {
  kill: () => void
  reboot: ({
    targets,
    options
  }: {
    targets: NearyTargetsType | NearyTargetsType[] | undefined
    options?: NearyConfigTypePartial
  }) => void
  getElements: () => {
    targets: NearySettedElementType[]
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
  let elements: NearyTargetsType[] | undefined = undefined
  let elementsSetted: NearySettedElementType[] = []
  let elementsDebugTarget: NearyElementDebugType = undefined

  /**
   * Build targets once
   */
  const buildTargets = () => {
    elements = prepareTargets(targets, baseOptions)
    if (elements) {
      elementsSetted = setTargets(elements)
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
    const { pageX: x, pageY: y } = event
    const { format, debug, onProximity } = baseOptions
    const newData: NearyResponseType[] = []
    if (elements && elementsSetted && elementsSetted.length > 0) {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index]
        const { target, distance, uid, context } = elementsSetted[index]

        if (target) {
          const { proximity, emit: data } = setProximity(
            format,
            target,
            context,
            distance,
            {
              x,
              y
            }
          )

          if (debug) {
            setDebugActive(elementsDebugTarget, index, proximity)
          }

          if (element.onProximity) {
            element.onProximity({ data, uid, target })
          }
          newData.push({
            uid,
            target,
            data
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
  }, baseOptions.delay)

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
   */
  const reboot = ({
    targets: newTargets,
    options: newOptions
  }: {
    targets?: NearyTargetsType | NearyTargetsType[]
    options?: NearyConfigTypePartial
  }) => {
    newTargets = prepareTargets(newTargets, baseOptions)
    if (newTargets && !areTargetsEqual(newTargets, elements)) {
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
