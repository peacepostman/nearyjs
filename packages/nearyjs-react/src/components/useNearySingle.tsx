import { useState, useEffect, useRef, useCallback } from 'react'
import Neary, {
  areOptionsEqual,
  NearyInstancetype,
  NearyConfigTypePartial,
  NearyTargetsType
} from 'nearyjs'
import { canUseDOM } from './Utils'

export type UseNearyType = {
  setTarget: (element: Element) => void
  nearyAPI: NearyInstancetype | undefined
  response: boolean | number | undefined
}

/**
 * useNearySingle Hook
 *
 * Usefull to listen for a single element proximity, if you need to listen for multiple elements proximity,
 * you should use the Neary Context provider and useNeary in order to avoid multiple instances of Neary and improve performance.
 */
export function useNearySingle({
  targetOptions,
  options
}: {
  targetOptions?: Omit<NearyTargetsType, 'target'>
  options?: NearyConfigTypePartial
}): UseNearyType {
  const targetOptionRef = useRef<Omit<NearyTargetsType, 'target'> | undefined>(
    targetOptions
  )
  const optionRef = useRef<NearyConfigTypePartial | undefined>(options)
  const [nearyAPI, setNearyAPI] = useState<NearyInstancetype>()
  const [response, setResponse] = useState<boolean | number>()
  const [ref, setRef] = useState<
    NearyTargetsType | NearyTargetsType[] | undefined
  >()

  const reInit = useCallback(() => {
    if (nearyAPI) {
      nearyAPI.reboot({
        targets: ref,
        options: optionRef.current
      })
    }
  }, [nearyAPI, ref])

  useEffect(() => {
    targetOptionRef.current = targetOptions
  }, [targetOptions])

  useEffect(() => {
    if (
      optionRef &&
      optionRef.current &&
      options &&
      !areOptionsEqual(optionRef.current, options)
    ) {
      optionRef.current = options
      reInit()
    }
  }, [options, reInit])

  useEffect(() => {
    if (canUseDOM() && ref) {
      const nearyAPI = Neary({
        targets: ref,
        options: {
          ...optionRef.current,
          onProximity: (response) => {
            setResponse(response[0]?.data)
          }
        }
      })
      setNearyAPI(nearyAPI)
      return () => nearyAPI.kill()
    } else {
      setNearyAPI(undefined)
    }
  }, [setNearyAPI, ref])

  const setTarget = useCallback(
    (element: Element) => {
      if (element) {
        setRef({ target: element, ...targetOptionRef.current })
      }
    },
    [setRef]
  )

  return {
    setTarget,
    nearyAPI,
    response
  }
}
