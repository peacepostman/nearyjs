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

  return convertProximityToPercentage({ proximity, rect, rectDistance, cursor })
}

function convertProximityToPercentage({
  proximity,
  rect,
  rectDistance: { left, top, right, bottom },
  cursor: { x: mouseX, y: mouseY }
}: {
  proximity: boolean
  rect: DOMRect
  rectDistance: { top: number; right: number; bottom: number; left: number }
  cursor: { x: number; y: number }
}) {
  const windowW = window.innerWidth
  const windowH = window.innerHeight
  const leftPercent =
    mouseY > top && mouseY < bottom && mouseX < left + rect.width / 2
      ? percentage(mouseX, left)
      : 0
  const topPercent = mouseY < top ? percentage(mouseY, top) : 0
  const rightPercent =
    mouseY > top && mouseY < bottom && mouseX > left + rect.width / 2
      ? percentage(windowW - mouseX, windowW - right)
      : 0
  const bottomPercent =
    mouseY > bottom ? percentage(windowH - mouseY, windowH - bottom) : 0

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
