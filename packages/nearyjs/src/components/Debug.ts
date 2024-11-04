import { NearySettedElementType } from './Neary'

export type NearyElementDebugType = HTMLElement[] | undefined

/**
 * Add debugs overlay on elements
 * @param elements
 */
export function setDebug(elementsSetted: NearySettedElementType) {
  type styleType = Partial<CSSStyleDeclaration> & { [propName: string]: string }
  function css(element: HTMLElement, style: styleType) {
    Object.keys(style).forEach((styleKey: string) => {
      ;(element.style as styleType)[styleKey] = style[styleKey]
    })
  }

  if (elementsSetted.length > 0) {
    const elementsRef = []
    for (let index = 0; index < elementsSetted.length; index++) {
      const { distance, target, uid } = elementsSetted[index]
      if (target) {
        const { width, height, x, y } = target.getBoundingClientRect()
        const copy = document.createElement('div')
        copy.setAttribute('data-neary-debug-id', uid)
        css(copy, {
          position: 'absolute',
          top: `${y - distance.y}px`,
          left: `${x - distance.x}px`,
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
        elementsRef.push(copy)
        document.body.appendChild(copy)
      }
    }
    return elementsRef
  } else {
    return undefined
  }
}

export function setDebugActive(
  elementsDebugTarget: NearyElementDebugType,
  index: number,
  proximity: boolean
) {
  if (elementsDebugTarget && elementsDebugTarget[index]) {
    elementsDebugTarget[index].style.borderColor = proximity
      ? 'rgba(66,239,66,.8)'
      : 'rgba(239,66,66,.8)'
  }
}
