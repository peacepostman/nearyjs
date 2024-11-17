import { NearySettedElementType } from './Neary'
import { NearyFormatType } from './Options'

/**
 * Return context values
 * @param context
 * @returns
 */
function getProximityContext(context?: Element) {
  if (context) {
    const { width, height, left, top, bottom, right } =
      context.getBoundingClientRect()
    return {
      width,
      height,
      left,
      top,
      right,
      bottom
    }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight
  }
}

/**
 * Return appropriate proximity value according to expected output format
 * @param format
 * @param target
 * @param distance
 * @param cursor
 * @returns
 */
export function setProximity(
  format: NearyFormatType,
  target: Element,
  context: NearySettedElementType['context'],
  distance: { x: number; y: number },
  cursor: { x: number; y: number }
) {
  const {
    width: contextW,
    height: contextH,
    left: contextLeft,
    right: contextRight,
    top: contextTop,
    bottom: contextBottom
  } = getProximityContext(context)
  const { x: mouseX, y: mouseY } = cursor

  /**
   * If out of context return negative response
   */
  if (context) {
    if (
      contextLeft &&
      contextTop &&
      (mouseX < contextLeft + window.scrollX ||
        mouseX > contextLeft + contextW + window.scrollX ||
        mouseY < contextTop + window.scrollY ||
        mouseY > contextTop + contextH + window.scrollY)
    ) {
      return {
        proximity: false,
        emit: format === 'boolean' ? false : 0
      }
    }
  }

  const rect = target.getBoundingClientRect()
  const rectDistance = {
    top: rect.top - distance.y,
    right: rect.right + distance.x,
    bottom: rect.bottom + distance.y,
    left: rect.left - distance.x
  }

  const { left, top, right, bottom } = rectDistance

  const proximityLeft = context
    ? mouseX - contextLeft - window.scrollX >= left - contextLeft
    : mouseX >= left + window.scrollX
  const proximityTop = context
    ? mouseY - contextTop - window.scrollY >= top - contextTop
    : mouseY >= top + window.scrollY
  const proximityRight = context
    ? contextRight - mouseX + window.scrollX >= contextRight - right
    : mouseX <= right + window.scrollX
  const proximityBottom = context
    ? contextBottom - mouseY + window.scrollY >= contextBottom - bottom
    : mouseY <= bottom + window.scrollY

  const proximity =
    proximityLeft && proximityTop && proximityRight && proximityBottom

  target.setAttribute('data-neary-proximity', proximity.toString())

  if (format === 'boolean') {
    return {
      proximity,
      emit: proximity
    }
  }

  return setPercentage({ proximity, rectDistance, cursor, context })
}

function setPercentage({
  proximity,
  rectDistance: { left, top, right, bottom },
  cursor: { x: cursorX, y: cursorY },
  context
}: {
  proximity: boolean
  rectDistance: { top: number; right: number; bottom: number; left: number }
  cursor: { x: number; y: number }
  context: NearySettedElementType['context']
}) {
  const {
    left: contextLeft,
    right: contextRight,
    bottom: contextBottom,
    top: contextTop
  } = getProximityContext(context)

  const rectWidthCenter = (right - left) / 2
  const rectHeightCenter = (bottom - top) / 2

  const cursorOnLeft = cursorX - window.scrollX <= left + rectWidthCenter
  const cursorOnRight = cursorX + window.scrollX >= right - rectWidthCenter
  const cursorOnTop = cursorY - window.scrollY <= top + rectHeightCenter
  const cursorOnBottom = cursorY - window.scrollY >= bottom - rectHeightCenter

  const cursorDistanceFromLeft = left - cursorX + window.scrollX
  const cursorDistanceFromRight = cursorX - right - window.scrollX
  const cursorDistanceFromTop = top - cursorY + window.scrollY
  const cursorDistanceFromBottom = cursorY - bottom - window.scrollY

  const leftPercent =
    cursorOnLeft &&
    (!cursorOnBottom ||
      (cursorOnBottom && cursorDistanceFromLeft >= cursorDistanceFromBottom)) &&
    (!cursorOnTop ||
      (cursorOnTop && cursorDistanceFromLeft >= cursorDistanceFromTop))
      ? percentage(
          cursorX - contextLeft - window.scrollX,
          context && left < contextLeft
            ? cursorX - contextLeft - window.scrollX
            : left - contextLeft
        )
      : 0

  const topPercent =
    cursorOnTop &&
    (!cursorOnRight ||
      (cursorOnRight && cursorDistanceFromRight <= cursorDistanceFromTop)) &&
    (!cursorOnLeft ||
      (cursorOnLeft && cursorDistanceFromLeft <= cursorDistanceFromTop))
      ? percentage(
          cursorY - window.scrollY - contextTop,
          context && top < contextTop
            ? cursorY - window.scrollY - contextTop
            : top - contextTop
        )
      : 0

  const rightPercent =
    cursorOnRight &&
    (!cursorOnBottom ||
      (cursorOnBottom &&
        cursorDistanceFromRight >= cursorDistanceFromBottom)) &&
    (!cursorOnTop ||
      (cursorOnTop && cursorDistanceFromRight >= cursorDistanceFromTop))
      ? percentage(
          contextRight - cursorX + window.scrollX,
          context && contextRight < right
            ? contextRight - cursorX + window.scrollX
            : contextRight - right
        )
      : 0

  const bottomPercent =
    cursorOnBottom &&
    (!cursorOnRight ||
      (cursorOnRight && cursorDistanceFromRight <= cursorDistanceFromBottom)) &&
    (!cursorOnLeft ||
      (cursorOnLeft && cursorDistanceFromLeft <= cursorDistanceFromBottom))
      ? percentage(
          contextBottom - cursorY + window.scrollY,
          context && contextBottom < bottom
            ? contextBottom - cursorY + window.scrollY
            : contextBottom - bottom
        )
      : 0

  const percent = Math.max(leftPercent, topPercent, rightPercent, bottomPercent)

  return {
    proximity,
    emit: percent
  }
}

/**
 * Return percentage value
 * @param partial
 * @param total
 * @returns
 */
function percentage(partial: number, total: number) {
  const percent = (100 * partial) / total
  return percent > 100 ? 100 : Number(percent.toFixed(2))
}
