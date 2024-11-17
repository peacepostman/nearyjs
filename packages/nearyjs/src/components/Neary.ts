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

import type { NearyElementDebugNodes, NearyElementDebugType } from './Debug'
import { setDebugs, setDebugActive, setDebugCoordinates } from './Debug'
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
  contextUID: string
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
    debug: NearyElementDebugNodes
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
  let elementsDebugNodes: NearyElementDebugNodes = undefined

  /**
   * Build targets once
   */
  const buildTargets = () => {
    elements = prepareTargets(targets, baseOptions)
    if (elements) {
      elementsSetted = setTargets(elements)
      if (baseOptions.debug) {
        elementsDebugNodes = setDebugs(elementsSetted)
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
        let toPush: NearyResponseType = {
          uid,
          target: undefined,
          data: false
        }
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
            setDebugActive(elementsDebugNodes, index, proximity)
          }

          if (element.onProximity) {
            element.onProximity({ data, uid, target })
          }

          toPush = {
            uid,
            target,
            data
          }
        }
        newData.push(toPush)
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
    if (elementsDebugNodes && elementsDebugNodes.length > 0) {
      elementsDebugNodes.forEach(({ element }) => {
        element.remove()
      })
      elementsDebugNodes = setDebugs(elementsSetted)
    }
  }, 100)

  const onContextScroll = throttle((e: Event) => {
    const contextUID = (e.target as HTMLElement).getAttribute(
      'data-neary-context-uid'
    )
    if (elementsDebugNodes && elementsDebugNodes.length > 0) {
      elementsDebugNodes.forEach(({ context }, index) => {
        if (context) {
          const elementContextUID = context.getAttribute(
            'data-neary-context-uid'
          )
          if (contextUID === elementContextUID) {
            elementsDebugNodes = setDebugCoordinates(
              elementsSetted,
              elementsDebugNodes,
              index
            )
          }
        }
      })
    }
  }, 50)

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
        elementsSetted.forEach(({ context }) => {
          if (context) {
            context.addEventListener('scroll', onContextScroll, {
              passive: true
            })
          }
        })
      }
      if (elementsDebugNodes && elementsDebugNodes.length > 0) {
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
    if (elementsDebugNodes && elementsDebugNodes.length > 0) {
      document.removeEventListener('resize', onResizeThrottled)
      elementsDebugNodes.forEach(({ element }) => {
        element.remove()
      })
    }
    previousData = []
    elements = []
    elementsSetted = []
    elementsDebugNodes = undefined
  }

  boot()

  return {
    kill,
    reboot,
    getElements: () => ({
      targets: elementsSetted,
      debug: elementsDebugNodes
    })
  }
}

export default Neary
