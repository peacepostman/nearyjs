import Neary from 'nearyjs'
import './style.css'

const nearyInstance = Neary({
  enabled: true,
  debug: true,
  elements: [
    // {
    //   target: '#area-1',
    //   distance: 0,
    //   onProximity(data) {
    //     console.log('onProximity::area1', data)
    //   }
    // },
    {
      target: '#area-2',
      distance: {
        x: 20,
        y: 80
      },
      onProximity(data, el) {
        console.log('onProximity::area2', data)
        el.innerHTML = `<span class="text-sm text-slate-700 absolute right-2 bottom-2">${data}%</span>`
      }
    }
    // {
    //   target: '#area-3',
    //   distance: 10
    // }
  ],
  format: 'percentage',
  onProximity: (data) => {
    console.log('onProximity::global', data)
  }
})

console.log('nearyInstance', nearyInstance)
