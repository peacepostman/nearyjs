import { useState, useEffect } from 'react'
import Neary from 'neary'

type elementsType = {
  /**
   * A node ref
   */
  target: HTMLElement
  /**
   * Distance in pixel around element, default is 0
   */
  distance?: number | { x: number; y: number }
}
interface ProximityType {
  /**
   * An array of element on which we must detect proximity
   */
  elements: elementsType | elementsType[]
  /**
   * Boolean to enable listener, default is true
   */
  enabled?: boolean
}

export type { elementsType }

/**
 * This hook will check if an element is in the current cursor boundary.
 * You can define how much distance from the element you want in order to return true
 *
 * Hook return an array of boolean values which indexes matches the provided elements order
 */
export default function useCursorProximity({ elements, enabled = true }: ProximityType): { distances: boolean[] } {
  const [distances, setDistances] = useState<boolean[]>([])

  useEffect(() => {
    function calculateProximity(event: MouseEvent) {
      const { pageX: mouseX, pageY: mouseY } = event

      let data = [] as boolean[]
      if (!Array.isArray(elements)) {
        elements = [elements]
      }

      if (elements.length > 0) {
        for (let index = 0; index < elements.length; index++) {
          const element = elements[index].target
          const distance = (
            elements[index].distance !== undefined
              ? typeof elements[index].distance === 'number'
                ? { x: elements[index].distance, y: elements[index].distance }
                : elements[index].distance
              : { x: 0, y: 0 }
          ) as { x: number; y: number }

          let isInElement: boolean = false
          let rect = element?.getBoundingClientRect()
          let { left, top, right, bottom } = {
            top: rect?.top + window.scrollY,
            right: rect?.right + window.scrollX,
            bottom: rect?.bottom + window.scrollY,
            left: rect?.left + window.scrollX,
          }

          if (mouseX >= left - distance.x && mouseX <= right + distance.x && mouseY >= top - distance.y && mouseY <= bottom + distance.y) {
            isInElement = true
          }
          data.push(isInElement)
        }
      }
      setDistances((prev) => (isEqual(data, prev) ? prev : data))
    }

    if (elements) {
      if (enabled) {
        const throttleCalculateProximity = throttle(calculateProximity, 300)
        document.addEventListener('mousemove', throttleCalculateProximity)
        return () => document.removeEventListener('mousemove', throttleCalculateProximity)
      } else {
        if (!Array.isArray(elements)) {
          elements = [elements]
        }
        setDistances(new Array(elements.length).fill(false))
      }
    }
  }, [elements, enabled])

  return {
    distances,
  }
}
