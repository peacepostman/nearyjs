import React, { useMemo } from 'react'
import { useNeary } from 'nearyjs-react'

export default function Scrollable() {
  const setNeary = useNeary({
    distance: 20,
    context: '[data-context]',
    onProximity({ data, target }) {
      target.innerHTML = data.toString()
      if (data) {
        target.classList.remove('bg-slate-200')
        target.classList.add('bg-green-400')
      } else {
        target.classList.remove('bg-green-400')
        target.classList.add('bg-slate-200')
      }
    }
  })

  const setNeary2 = useNeary({
    /**
     * use UseMemo to avoid re-render of options as react consider it as a new object
     */
    distance: useMemo(() => ({ x: 40, y: 10 }), []),
    context: '[data-context]',
    format: 'percentage',
    onProximity({ data, target, unsubscribe }) {
      target.innerHTML = data.toString() + '%'
      if (data < 60) {
        target.classList.remove('bg-green-100')
        target.classList.remove('bg-green-600')
        target.classList.add('bg-slate-200')
      }
      if (data >= 60) {
        target.classList.remove('bg-slate-200')
        target.classList.remove('bg-green-600')
        target.classList.add('bg-green-100')
      }
      if (data === 100) {
        target.classList.remove('bg-slate-200')
        target.classList.remove('bg-green-100')
        target.classList.add('bg-green-600')
        unsubscribe()
      }
    },
    /**
     * You can use a useState here or use unsubscribe to disable the target upon proximity
     * in order to avoid a react render
     */
    enabled: true
  })

  const boxClassName =
    'relative rounded-md bg-slate-200 w-32 h-32 min-w-32 flex items-center justify-center p-2 shadow-md shadow-slate-700 font-bold text-slate-800 text-lg'

  return (
    <div className="p-3 flex justify-center items-center h-screen">
      <div
        data-context
        className="flex gap-4 bg-red-300 p-10 overflow-scroll max-w-96 flex-nowrap max-h-44"
      >
        <div className={boxClassName}></div>
        <div className={boxClassName}></div>
        <div ref={setNeary} className={boxClassName}></div>
        <div className={boxClassName}></div>
        <div ref={setNeary2} className={boxClassName}></div>
        <div className={boxClassName}></div>
        <div className="relative rounded-md bg-slate-200 flex flex-grow-0 h-64 w-full items-center justify-center p-2 shadow-md shadow-slate-700 font-bold text-slate-800 text-lg"></div>
      </div>
    </div>
  )
}
