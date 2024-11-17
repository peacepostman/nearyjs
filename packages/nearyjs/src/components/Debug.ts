import { NearySettedElementNode, NearySettedElementType } from './Neary'

export type NearyElementDebugType = HTMLElement[] | undefined
export type NearyElementDebugNode = {
  element: HTMLDivElement
  context?: NearySettedElementNode
}
export type NearyElementDebugNodes =
  | {
      element: HTMLDivElement
      context?: NearySettedElementNode
    }[]
  | undefined

type styleType = Partial<CSSStyleDeclaration> & { [propName: string]: string }

/**
 * Small helper to build css style as object
 * @param element
 * @param style
 */
function css(element: HTMLElement, style: styleType) {
  Object.keys(style).forEach((styleKey: string) => {
    ;(element.style as styleType)[styleKey] = style[styleKey]
  })
}

export function setDebug(elementSetted: NearySettedElementType) {
  const { distance, target, uid, context } = elementSetted
  if (target) {
    const ref = {} as unknown as NearyElementDebugNode
    const { width, height, x, y } = target.getBoundingClientRect()
    const contextScroll = { x: 0, y: 0 }
    if (context) {
      contextScroll.x = context.scrollLeft
      contextScroll.y = context.scrollTop
    }
    const copy = document.createElement('div')
    copy.setAttribute('data-neary-debug-id', uid)
    console.log('setDebug', {
      y,
      x,
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      distance
    })
    css(copy, {
      position: 'absolute',
      top: `${y + window.scrollY - distance.y + contextScroll.y}px`,
      left: `${x + window.scrollX - distance.x + contextScroll.x}px`,
      width: `${width + distance.x * 2}px`,
      height: `${height + distance.y * 2}px`,
      transition: 'border-color .15s',
      borderWidth: '1px',
      borderStyle: 'dashed',
      borderColor: 'rgba(239,66,66,.8)',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      zIndex: '99999999999999'
    })

    ref['element'] = copy

    if (context) {
      ref['context'] = context
      context.appendChild(copy)
    } else {
      document.body.appendChild(copy)
    }
    return ref
  }
}

/**
 * Add debugs overlay on elements
 * @param elements
 */
export function setDebugs(
  elementsSetted: NearySettedElementType[]
): NearyElementDebugNodes {
  if (elementsSetted.length > 0) {
    const elementsRef = [] as unknown as NearyElementDebugNode[]
    for (let index = 0; index < elementsSetted.length; index++) {
      const ref = setDebug(elementsSetted[index])
      if (ref) {
        elementsRef.push(ref)
      }
    }
    return elementsRef
  } else {
    return undefined
  }
}

export function setDebugActive(
  elementsDebugNodes: NearyElementDebugNodes,
  index: number,
  proximity: boolean
) {
  if (
    elementsDebugNodes &&
    elementsDebugNodes[index] &&
    elementsDebugNodes[index].element
  ) {
    elementsDebugNodes[index].element.style.borderColor = proximity
      ? 'rgba(66,239,66,.8)'
      : 'rgba(239,66,66,.8)'
  }
}

export function setDebugCoordinates(
  elementsSetted: NearySettedElementType[],
  elementsDebugNodes: NearyElementDebugNodes,
  index: number
) {
  if (
    elementsSetted &&
    elementsSetted[index] &&
    elementsSetted[index].target &&
    elementsDebugNodes &&
    elementsDebugNodes[index] &&
    elementsDebugNodes[index].element
  ) {
    const { target, distance, context } = elementsSetted[index]
    const debugElement = elementsDebugNodes[index].element
    const { x, y } = target.getBoundingClientRect()
    const contextScroll = { x: 0, y: 0 }
    if (context) {
      contextScroll.x = context.scrollLeft
      contextScroll.y = context.scrollTop
    }

    console.log('setDebugCoordinates', {
      x,
      y,
      contextScroll,
      WscrollX: window.scrollX,
      WscrollY: window.scrollY
    })
    debugElement.style.top = `${y + window.scrollY - distance.y}px`
    debugElement.style.left = `${x + window.scrollX - distance.x}px`
  }
  return elementsDebugNodes
}
