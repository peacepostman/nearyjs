import { useState, useEffect, useRef, useCallback } from 'react'
import { areOptionsEqual, NearyTargetsType, NearyTargetType } from 'nearyjs'
import { canUseDOM } from './Utils'
import { useNearyInstance } from './NearyProvider'

/**
 * useNeary Hook
 *
 * Usefull to listen for a single element proximity, if you need to listen for multiple elements proximity,
 * you should use the Neary Context provider in order to avoid multiple instances of Neary and improve performance.
 */
export function useNeary(options?: Omit<NearyTargetsType, 'target'>) {
  const instance = useNearyInstance()

  const optionsRef = useRef<Omit<NearyTargetsType, 'target'> | undefined>(
    options
  )

  const [targetRef, setTargetRef] = useState<NearyTargetsType | undefined>()
  const refTarget = useRef<Element | null>(null)

  const setTarget = useCallback(
    (element: Element) => {
      if (element) {
        refTarget.current = element
        setTargetRef({ target: element, ...optionsRef.current })
      }
    },
    [setTargetRef]
  )

  useEffect(() => {
    if (
      optionsRef &&
      optionsRef.current &&
      options &&
      !areOptionsEqual(optionsRef.current, options)
    ) {
      if (refTarget.current) {
        setTargetRef({ target: refTarget.current, ...options })
      }
      optionsRef.current = options
    } else {
      optionsRef.current = options
    }
  }, [options, setTargetRef])

  useEffect(() => {
    if (canUseDOM() && targetRef && instance) {
      const targets = instance.targets()
      instance.reboot({
        targets: targets ? [...targets, targetRef] : [targetRef]
      })
      return () => {
        const targets = instance.targets()
        if (targets && targetRef) {
          const index = targets.findIndex(
            (target) => target.target === targetRef.target
          )
          if (index > -1) {
            targets.splice(index, 1)
            instance.reboot({ targets })
          }
        }
      }
    }
  }, [instance, targetRef])

  return setTarget
}
