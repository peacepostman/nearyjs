import { NearyFormatType } from './Options'

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
  distance: { x: number; y: number },
  cursor: { x: number; y: number }
) {
  const rect = target.getBoundingClientRect()
  const rectDistance = {
    top: rect.top - distance.y,
    right: rect.right + distance.x,
    bottom: rect.bottom + distance.y,
    left: rect.left - distance.x
  }
  const { left, top, right, bottom } = rectDistance
  const { x: mouseX, y: mouseY } = cursor

  const proximity =
    mouseX >= left + window.scrollX &&
    mouseX <= right + window.scrollX &&
    mouseY >= top + window.scrollY &&
    mouseY <= bottom + window.scrollY

  target.setAttribute('data-neary-proximity', proximity.toString())

  if (format === 'boolean') {
    return {
      proximity,
      emit: proximity
    }
  }

  return setPercentage({ proximity, rectDistance, cursor })
}

function setPercentage({
  proximity,
  rectDistance: { left, top, right, bottom },
  cursor: { x: cursorX, y: cursorY }
}: {
  proximity: boolean
  rectDistance: { top: number; right: number; bottom: number; left: number }
  cursor: { x: number; y: number }
}) {
  const windowW = window.innerWidth
  const windowH = window.innerHeight

  const rectWidthCenter = (right - left) / 2
  const rectHeightCenter = (bottom - top) / 2

  const cursorOnLeft = cursorX <= left + rectWidthCenter
  const cursorOnRight = cursorX >= right - rectWidthCenter
  const cursorOnTop = cursorY <= top + rectHeightCenter
  const cursorOnBottom = cursorY >= bottom - rectHeightCenter

  const cursorDistanceFromLeft = left - cursorX
  const cursorDistanceFromRight = cursorX - right
  const cursorDistanceFromTop = top - cursorY
  const cursorDistanceFromBottom = cursorY - bottom

  const leftPercent =
    cursorOnLeft &&
    (!cursorOnBottom ||
      (cursorOnBottom && cursorDistanceFromLeft >= cursorDistanceFromBottom)) &&
    (!cursorOnTop ||
      (cursorOnTop && cursorDistanceFromLeft >= cursorDistanceFromTop))
      ? percentage(cursorX, left)
      : 0
  const topPercent =
    cursorOnTop &&
    (!cursorOnRight ||
      (cursorOnRight && cursorDistanceFromRight <= cursorDistanceFromTop)) &&
    (!cursorOnLeft ||
      (cursorOnLeft && cursorDistanceFromLeft <= cursorDistanceFromTop))
      ? percentage(cursorY, top)
      : 0

  const rightPercent =
    cursorOnRight &&
    (!cursorOnBottom ||
      (cursorOnBottom &&
        cursorDistanceFromRight >= cursorDistanceFromBottom)) &&
    (!cursorOnTop ||
      (cursorOnTop && cursorDistanceFromRight >= cursorDistanceFromTop))
      ? percentage(windowW - cursorX, windowW - right)
      : 0

  const bottomPercent =
    cursorOnBottom &&
    (!cursorOnRight ||
      (cursorOnRight && cursorDistanceFromRight <= cursorDistanceFromBottom)) &&
    (!cursorOnLeft ||
      (cursorOnLeft && cursorDistanceFromLeft <= cursorDistanceFromBottom))
      ? percentage(windowH - cursorY, windowH - bottom)
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
