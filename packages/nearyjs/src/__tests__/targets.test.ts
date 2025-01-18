import {
  prepareTargets,
  setTarget,
  setDistance,
  setTargets
} from '../components/Targets'

const TARGET_MOCK_CONFIG = {
  target: '.test',
  onProximity: () => {}
}

const TARGET_MOCK_CONTEXT_CONFIG = {
  target: '.test',
  context: '.context',
  onProximity: () => {}
}

const TARGET_NEARY_CONFIG = {
  enabled: true
}

describe('prepareTargets', () => {
  it('should output an array of the input object', () => {
    expect(
      prepareTargets(TARGET_MOCK_CONFIG, TARGET_NEARY_CONFIG)
    ).toStrictEqual([TARGET_MOCK_CONFIG])
  })

  it('should return the same array if the input is an array', () => {
    expect(
      prepareTargets([TARGET_MOCK_CONFIG], TARGET_NEARY_CONFIG)
    ).toStrictEqual([TARGET_MOCK_CONFIG])
  })

  it('should return undefined prepared targets if no element with data-neary attribute', () => {
    expect(prepareTargets(undefined, TARGET_NEARY_CONFIG)).toBeUndefined()
  })

  it('should return fallback element with data-neary attribute', () => {
    document.body.innerHTML = '<div>' + '  <div data-neary />' + '</div>'
    expect(prepareTargets(undefined, TARGET_NEARY_CONFIG)).toStrictEqual([
      {
        target: document.querySelector('[data-neary]'),
        context: undefined,
        onProximity: undefined,
        distance: { x: 0, y: 0 }
      }
    ])

    document.body.innerHTML = ''
  })
})

describe('setTarget', () => {
  it('should return a DOM element if a string is provided', () => {
    document.body.innerHTML = '<div>' + '  <div data-neary />' + '</div>'
    expect(setTarget('[data-neary]')).toBe(
      document.querySelector('[data-neary]')
    )
    document.body.innerHTML = ''
  })

  it('should throw an error if the target is not found', () => {
    expect(() => setTarget('[data-neary]')).toThrow(
      'NearyJS - Target not found, was looking for "[data-neary]"'
    )
  })

  it('should throw an error if the target is not provided', () => {
    expect(() => setTarget()).toThrow('NearyJS - Target is required')
  })

  it('should throw an error if the target is not found', () => {
    expect(() => setTarget('.test')).toThrow(
      'NearyJS - Target not found, was looking for ".test"'
    )
  })

  it('should return a DOM element if an element is provided', () => {
    document.body.innerHTML = '<div>' + '  <div class="test" />' + '</div>'
    expect(setTarget(document.querySelector('.test') as Element)).toBe(
      document.querySelector('.test') as Element
    )
    document.body.innerHTML = ''
  })

  it('should return a DOM element if a matching class is provided', () => {
    document.body.innerHTML = '<div>' + '  <div class="test" />' + '</div>'
    expect(setTarget('.test')).toBe(document.querySelector('.test') as Element)
    document.body.innerHTML = ''
  })
})

describe('setDistance', () => {
  it('should return a distance object if a number is provided', () => {
    expect(setDistance(10)).toStrictEqual({ x: 10, y: 10 })
  })

  it('should return a distance object if an object of numbers is provided', () => {
    expect(setDistance({ x: 10, y: 10 })).toStrictEqual({ x: 10, y: 10 })
  })

  it('should return a default distance object if nothing is provided', () => {
    expect(setDistance()).toStrictEqual({ x: 0, y: 0 })
  })
})

describe('setTargets', () => {
  it('should return an array of setted element with expected keys', () => {
    document.body.innerHTML = '<div>' + '  <div class="test" />' + '</div>'
    expect(setTargets([TARGET_MOCK_CONFIG], TARGET_NEARY_CONFIG)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: document.querySelector('.test'),
          uid: expect.stringMatching(new RegExp('^neary_')),
          enabled: true,
          distance: expect.objectContaining({ x: 0, y: 0 }),
          format: expect.stringContaining('boolean'),
          context: undefined,
          contextUID: expect.stringMatching(new RegExp('^neary_context_'))
        })
      ])
    )

    /**
     * Check if the element has a data-neary attribute
     */
    const target = document.querySelector('.test')
    const targetAttr = target?.getAttribute('data-neary')
    expect(target).toBeDefined()
    expect(targetAttr).not.toBeNull()

    document.body.innerHTML = ''
  })

  it('should return an array of setted element with expected keys and context', () => {
    document.body.innerHTML =
      '<div>' + '  <div class="context"><div class="test" /></div>' + '</div>'

    expect(
      setTargets([TARGET_MOCK_CONTEXT_CONFIG], TARGET_NEARY_CONFIG)
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: document.querySelector('.test'),
          uid: expect.stringMatching(new RegExp('^neary_')),
          enabled: true,
          distance: expect.objectContaining({ x: 0, y: 0 }),
          format: expect.stringContaining('boolean'),
          context: document.querySelector('.context'),
          contextUID: expect.stringMatching(new RegExp('^neary_context_'))
        })
      ])
    )

    /**
     * Check if the element has a data-neary attribute
     */
    const target = document.querySelector('.test')
    const targetAttr = target?.getAttribute('data-neary')
    expect(target).toBeDefined()
    expect(targetAttr).not.toBeNull()

    /**
     * Check if the context element has a data-neary-context-uid attribute
     */
    const context = document.querySelector('.context')
    const contextAttr = context?.getAttribute('data-neary-context-uid')
    expect(context).toBeDefined()
    expect(contextAttr).toMatch(new RegExp('^neary_context_'))

    document.body.innerHTML = ''
  })

  it('should throw an error if no target key is provided', () => {
    document.body.innerHTML = '<div>' + '  <div class="test" />' + '</div>'
    expect(() =>
      setTargets(
        [
          {
            target: document.querySelector('.undefined') as Element
          }
        ],
        TARGET_NEARY_CONFIG
      )
    ).toThrow('NearyJS - No targets found')
    document.body.innerHTML = ''
  })
})
