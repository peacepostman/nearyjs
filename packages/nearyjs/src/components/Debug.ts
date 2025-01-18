import { NearySettedElementNode, NearySettedElementType } from './Targets'

export type NearyElementDebugType = HTMLElement[] | undefined
export type NearyElementDebugNode = {
  element: HTMLDivElement
  uid: string
  context?: NearySettedElementNode
}
export interface NearyElementDebugNodes {
  [key: string]: NearyElementDebugNode
}

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

export function setDebug(
  elementSetted: NearySettedElementType
): NearyElementDebugNode {
  const { distance, target, uid, context } = elementSetted
  const ref = { uid } as unknown as NearyElementDebugNode
  const { width, height, x, y } = target.getBoundingClientRect()
  // const contextScroll = { x: 0, y: 0 }
  // if (context) {
  //   contextScroll.x = context.scrollLeft
  //   contextScroll.y = context.scrollTop
  // }
  const copy = document.createElement('div')
  copy.setAttribute('data-neary-debug-id', uid)
  css(copy, {
    position: 'absolute',
    top: `${y + window.scrollY - distance.y}px`,
    left: `${x + window.scrollX - distance.x}px`,
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

/**
 * Add debugs overlay on elements
 * @param elements
 */
export function setDebugs(
  elementsSetted: NearySettedElementType[]
): NearyElementDebugNodes {
  const elementsRef = {} as unknown as NearyElementDebugNodes
  for (let index = 0; index < elementsSetted.length; index++) {
    if (elementsSetted[index].enabled) {
      const ref = setDebug(elementsSetted[index])
      if (ref) {
        elementsRef[ref.uid] = ref
      }
    }
  }
  return elementsRef
}

export function setDebugActive(
  elementsDebugNodes: NearyElementDebugNodes,
  uid: string,
  proximity: boolean
) {
  if (
    elementsDebugNodes &&
    elementsDebugNodes[uid] &&
    elementsDebugNodes[uid].element
  ) {
    elementsDebugNodes[uid].element.style.borderColor = proximity
      ? 'rgba(66,239,66,.8)'
      : 'rgba(239,66,66,.8)'
  }
}

export function setDebugCoordinates(
  elementsSetted: NearySettedElementType[],
  elementsDebugNodes: NearyElementDebugNodes,
  uid: string
) {
  const index = elementsSetted.findIndex((item) => item.uid === uid)
  if (
    elementsSetted &&
    elementsSetted[index] &&
    elementsSetted[index].target &&
    elementsDebugNodes &&
    elementsDebugNodes[uid] &&
    elementsDebugNodes[uid].element
  ) {
    const { target, distance, context } = elementsSetted[index]
    const debugElement = elementsDebugNodes[uid].element
    const { x, y } = target.getBoundingClientRect()
    const contextScroll = { x: 0, y: 0 }
    if (context) {
      contextScroll.x = context.scrollLeft
      contextScroll.y = context.scrollTop
    }
    debugElement.style.top = `${y + window.scrollY - distance.y}px`
    debugElement.style.left = `${x + window.scrollX - distance.x}px`
  }
  return elementsDebugNodes
}

export function setDebugContextListener(
  elementsSetted: NearySettedElementType[],
  fn: (e: Event) => void,
  method: 'add' | 'remove'
) {
  const contexts = [
    ...new Map(
      elementsSetted.map((item) => [item['contextUID'], item])
    ).values()
  ]
  if (contexts && contexts.length > 0) {
    contexts.forEach(({ context }) => {
      if (context) {
        context[`${method}EventListener`](
          'scroll',
          fn,
          method === 'add' && {
            passive: true
          }
        )
      }
    })
  }
}
