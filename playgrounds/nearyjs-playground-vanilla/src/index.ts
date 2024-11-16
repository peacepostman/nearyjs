import Neary from 'nearyjs'
import './style.css'

//@ts-ignore
const nearyInstance = Neary({
  targets: {
    target: '#area-2',
    distance: {
      x: 20,
      y: 10
    },
    onProximity({ data, uid, target }) {
      target.innerHTML = `<span class="text-sm text-slate-700 absolute right-2 bottom-2">${data}%</span>`
    },
    context: '#contextt'
  },
  options: {
    format: 'percentage',
    debug: true,
    onProximity: (data) => {
      console.log('onProximity::global', data)
    }
  }
})

// setTimeout(() => {
//   nearyInstance.reboot({
//     targets: {
//       target: '#area-2',
//       distance: {
//         x: 20,
//         y: 80
//       },
//       onProximity({ data, uid, target }) {
//         target.innerHTML = `<span class="text-sm text-slate-700 absolute right-2 bottom-2">${data}%</span>`
//       }
//     },
//     options: {
//       format: 'percentage',
//       debug: true
//     }
//   })
// }, 5000)
