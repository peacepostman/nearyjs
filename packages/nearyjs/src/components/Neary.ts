import { throttle, areEquals } from './Utils'

import type { NearyConfigTypePartial, NearyFormatType } from './Options'
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
  format: NearyFormatType
  enabled: boolean
  context: NearySettedElementNode
  contextUID: string
}

export type NearyResponseType =
  | {
      data: boolean | number
      uid: string
      target: NearySettedElementNode
      enabled: boolean
      format: NearyFormatType
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
  options: () => NearyConfigTypePartial
  targets: () => NearyTargetsType[] | undefined
}

function Neary({
  targets,
  options
}: {
  /**
   * An array of element on which we must detect proximity
   */
  targets?: NearyTargetsType | NearyTargetsType[]
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
      elementsSetted = setTargets(elements, baseOptions)
      if (baseOptions.debug) {
        elementsDebugNodes = setDebugs(elementsSetted)
      }
    }
  }

  const uniqContext = (elementsSetted: NearySettedElementType[]) => {
    return [
      ...new Map(
        elementsSetted.map((item) => [item['contextUID'], item])
      ).values()
    ]
  }

  /**
   * On mouse move action
   * @param event: MouseEvent
   */
  const onMoveThrottled = throttle((event: MouseEvent) => {
    const { pageX: x, pageY: y } = event
    const { debug, onProximity } = baseOptions
    const newData: NearyResponseType[] = []
    if (elements && elementsSetted && elementsSetted.length > 0) {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index]
        const { target, distance, uid, context, enabled, format } =
          elementsSetted[index]

        if (enabled) {
          let toPush: NearyResponseType = {
            uid,
            target: undefined,
            data: false,
            enabled,
            format
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

            if (element.onProximity || baseOptions.defaults?.onProximity) {
              const emit = {
                data,
                uid,
                target,
                enabled,
                format
              }
              if (element.onProximity) {
                element.onProximity(emit)
              } else if (baseOptions.defaults?.onProximity) {
                baseOptions.defaults.onProximity(emit)
              }
            }

            toPush = {
              uid,
              target,
              data,
              enabled,
              format
            }
          }
          newData.push(toPush)
        }
      }
    }
    if (onProximity) {
      /**
       * Only emit global change if data is different from previous data
       */
      if (
        previousData.length === 0 ||
        !areEquals(
          newData && newData.length > 0
            ? newData.map((e) => (e ? e.data : 0))
            : [],
          previousData && previousData.length > 0
            ? previousData.map((e) => (e ? e.data : 0))
            : []
        )
      ) {
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
        if (elementsDebugNodes && elementsDebugNodes.length > 0) {
          window.addEventListener('resize', onResizeThrottled, {
            passive: true
          })
          const contexts = uniqContext(elementsSetted)
          if (contexts && contexts.length > 0) {
            contexts.forEach(({ context }) => {
              if (context) {
                context.addEventListener('scroll', onContextScroll, {
                  passive: true
                })
              }
            })
          }
        }
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

      if (elementsDebugNodes && elementsDebugNodes.length > 0) {
        const contexts = uniqContext(elementsSetted)
        if (contexts && contexts.length > 0) {
          contexts.forEach(({ context }) => {
            if (context) {
              context.removeEventListener('scroll', onContextScroll)
            }
          })
        }
        document.removeEventListener('resize', onResizeThrottled)
        elementsDebugNodes.forEach(({ element }) => {
          element.remove()
        })
      }
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
    options: () => baseOptions,
    targets: () => elements
  }
}

export default Neary
