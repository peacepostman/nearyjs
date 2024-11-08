import { NearyResponseType } from './Neary'

import { NearyTargetDistanceType, NearyTargetsType } from './Targets'

export type NearyFormatType = 'boolean' | 'percentage'
export type NearyConfigType = {
  /**
   * Boolean to enable listener, default is true
   */
  enabled: boolean
  /**
   * Throttle delay - Default value is 100ms
   */
  delay: number
  /**
   * Enable debug mode
   */
  debug: boolean
  /**
   * Determine the return type of the function
   * Default is boolean
   *
   * Boolean: return boolean value for elements. True means in proximity and false means not in proximity
   * Array: return array of numeric values between 0 and 1 for elements. Zero means not in proximity and 1 means in proximity
   */
  format: NearyFormatType
  /**
   * Callback function to call when elements proximity state change
   * This function will be executed only if the proximity state of the elements has changed
   */
  onProximity: (values: NearyResponseType[]) => void
  /**
   * Default targets configuration
   */
  defaults?: {
    distance?: NearyTargetDistanceType
    onProximity?: (response: NearyResponseType) => void
  }
}

export type NearyConfigTypePartial = Partial<NearyConfigType>

export const defaultOptions: NearyConfigType = {
  enabled: true,
  format: 'boolean',
  debug: false,
  delay: 100,
  onProximity: () => {}
}

/**
 * Merge options if reboot needed
 * @param optA
 * @param optB
 * @returns
 */
export function mergeOptions<
  OptionA extends NearyConfigType,
  OptionB extends NearyConfigTypePartial
>(optA: OptionA, optB?: OptionB): NearyConfigType {
  return <OptionA>Object.assign({}, optA, optB)
}

/**
 * Check if givent parameters are equal
 * @param optionsA
 * @param optionsB
 * @returns
 */
export function areOptionsEqual(
  optionsA: Record<string, unknown>,
  optionsB: Record<string, unknown>
): boolean {
  const optionsAKeys = Object.keys(optionsA)
  const optionsBKeys = Object.keys(optionsB)

  if (optionsAKeys.length !== optionsBKeys.length) return false

  return optionsAKeys.every((key) => {
    const valueA = optionsA[key]
    const valueB = optionsB[key]
    if (typeof valueA === 'function') {
      return `${valueA}` === `${valueB}`
    }
    return valueA === valueB
  })
}

/**
 * Compare list of target parameters
 * @param targetsA
 * @param targetsB
 * @returns boolean
 */
export function areTargetsEqual(
  targetsA: NearyTargetsType[] | undefined,
  targetsB: NearyTargetsType[] | undefined
): boolean {
  if (typeof targetsA !== typeof targetsB) return false
  if (targetsA && targetsB && targetsA.length !== targetsB.length) return false
  if ((!targetsA && targetsB) || (targetsA && !targetsB)) return false
  if (targetsA && targetsB) {
    return targetsA.every((targetsA, index) => {
      const targetB = targetsB[index]
      return areOptionsEqual(targetsA, targetB)
    })
  }
  return false
}
