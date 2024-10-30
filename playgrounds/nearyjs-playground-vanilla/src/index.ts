import Neary from 'nearyjs';
import './style.css';

const nearyInstance = Neary({
  enabled: true,
  elements: [
    {
      target: '#area-1',
      distance: 0,
    },
    {
      target: '#area-2',
      distance: {
        x: 20,
        y: 30,
      },
    },
    {
      target: '#area-3',
      distance: 10,
    },
  ],
  onChange: (data) => {
    console.log('onChange', data);
  },
});

console.log('nearyInstance', nearyInstance);
