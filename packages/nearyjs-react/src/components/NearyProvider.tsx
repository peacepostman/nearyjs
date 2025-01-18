import { NearyInstancetype } from 'nearyjs'
import React, { createContext, useEffect, useContext } from 'react'

export const NearyInstanceContext = createContext<
  NearyInstancetype | undefined
>(undefined)

export const useNearyInstance = (neary?: NearyInstancetype) => {
  const instance = useContext(NearyInstanceContext)
  if (neary) {
    return neary
  }
  if (!instance) {
    throw new Error(
      'No NearyJS instance set, you need to use NearyProvider to set one'
    )
  }
  return instance
}

export type NearyProviderProps = {
  instance: NearyInstancetype
  children?: React.ReactNode
}

export const NearyProvider = ({
  instance,
  children
}: NearyProviderProps): React.JSX.Element => {
  useEffect(() => {
    return () => {
      instance.kill()
    }
  }, [instance])

  return (
    <NearyInstanceContext.Provider value={instance}>
      {children}
    </NearyInstanceContext.Provider>
  )
}
