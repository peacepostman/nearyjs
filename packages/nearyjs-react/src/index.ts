import { useState, useEffect, useRef, useCallback } from 'react'
import Neary, {
  NearyInstancetype,
  NearyResponseType,
  NearyTargetsType
} from 'nearyjs'

import {
  areOptionsEqual,
  NearyConfigTypePartial
} from 'nearyjs/components/Options'

function canUseDOM() {
  return !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )
}

/**
 * This hook will check if an element is in the current cursor boundary.
 * You can define how much distance from the element you want in order to return true
 *
 * Hook return an array of boolean values which indexes matches the provided elements order
 */
export default function useCursorProximity(
  targets: NearyTargetsType | NearyTargetsType[],
  config: NearyConfigTypePartial
) {
  const targetsRef = useRef<NearyTargetsType | NearyTargetsType[]>(targets)
  const optionRef = useRef<NearyConfigTypePartial>(config)
  const [nearyAPI, setNearyAPI] = useState<NearyInstancetype>()
  const [response, setResponse] = useState<NearyResponseType>()

  const reInit = useCallback(() => {
    if (nearyAPI) nearyAPI.reboot(optionRef.current)
  }, [nearyAPI])

  useEffect(() => {
    if (!areOptionsEqual(optionRef.current, config)) {
      optionRef.current = config
      reInit()
    }
  }, [config, reInit])

  useEffect(() => {
    if (canUseDOM() && targets) {
      const freshAPI = Neary({
        targets,
        options: {
          ...optionRef.current,
          onProximity: setResponse
        }
      })
      targetsRef.current = targets
      setNearyAPI(freshAPI)
      return () => freshAPI.kill()
    } else {
      setNearyAPI(undefined)
    }
  }, [targets, setNearyAPI])

  return {
    nearyAPI,
    response
  }
}
