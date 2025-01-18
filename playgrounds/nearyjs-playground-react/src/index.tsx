import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

import Scrollable from './Example/Scrollable'
import { NearyProvider, Neary } from 'nearyjs-react'
import Basic from './Example/Basic'

const App: React.FC = () => {
  const instance = Neary({
    options: {
      debug: true,
      format: 'boolean',
      defaults: {
        distance: 40,
        onProximity(response) {
          /*
           * Common logic for all targets if non overrided
           */
        }
      }
    }
  })

  return (
    <NearyProvider instance={instance}>
      <main className="playground">
        <Scrollable />
        <Basic />
      </main>
    </NearyProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
