import React from 'react'
import { useNeary } from 'nearyjs-react'

export default function Basic() {
  const setNeary = useNeary()

  const boxClassName =
    'relative rounded-md bg-slate-200 w-32 h-32 flex items-center justify-center p-2 shadow-md shadow-slate-700 font-bold text-slate-800 text-lg'

  return (
    <div className="p-3 flex justify-center items-center h-screen">
      <div className="flex gap-4 p-10 min-w-96">
        <div className={boxClassName + ' min-w-32'}></div>
        <div className={boxClassName + ' min-w-32'}></div>
        <div ref={setNeary} className={boxClassName + ' min-w-32'}></div>
        <div className={boxClassName + ' min-w-96'}></div>
        <div className={boxClassName + ' min-w-96'}></div>
        <div className={boxClassName + ' min-w-96'}></div>
      </div>
    </div>
  )
}
