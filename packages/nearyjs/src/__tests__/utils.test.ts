import {
  areEquals,
  isEmpty,
  generateUID,
  throttle
} from './../components/Utils'

describe('Utils - areEquals', () => {
  it('should return true if two arrays of numbers are equal', () => {
    expect(areEquals([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(areEquals([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(areEquals([false, true], [false, true])).toBe(true)
    expect(areEquals([false, false, false], [true, true, true])).toBe(false)
  })

  it('should return false if two arrays of numbers are not equal', () => {
    expect(areEquals([1, 2, 3], [1, 2, 4])).toBe(false)
  })

  it('should return true if two arrays of boolean are equal', () => {
    expect(areEquals([false, true], [false, true])).toBe(true)
  })

  it('should return false if two arrays of boolean are not equal', () => {
    expect(areEquals([false, false, false], [true, true, true])).toBe(false)
  })
})

describe('Utils - isEmpty', () => {
  it('should return true if object is empty', () => {
    expect(isEmpty({})).toBe(true)
  })
  it('should return true if array is empty', () => {
    expect(isEmpty([])).toBe(true)
  })
  it('should return false if array is not empty', () => {
    expect(isEmpty([1, 2, 3])).toBe(false)
  })
  it('should return false if object is not empty', () => {
    expect(isEmpty({ a: 1 })).toBe(false)
  })
})

describe('Utils - generateUID', () => {
  it('should return a unique id', () => {
    expect(generateUID()).toBe('neary_1')
  })

  it('should return a unique id with suffix', () => {
    expect(generateUID('test_')).toBe('neary_test_2')
  })
})

describe('Utils - throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllTimers()
  })

  it('should throttle function calls', () => {
    const mockFn = jest.fn()
    const throttledFn = throttle(mockFn, 1000)

    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    throttledFn()
    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)

    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
