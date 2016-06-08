var glslify = require('glslify-sync') // works in client & server

export default function makeGrid (size, ticks = 10) {
  let positions = []
  console.log('making grid')

  for (let i = -size;i < size;i += ticks) {
    positions.push(-size, 0, i)
    positions.push(size, 0, i)
    positions.push(-size, 0, i)
  }

  for (let i = -size;i < size;i += ticks) {
    positions.push(i, 0, -size)
    positions.push(i, 0, size)
    positions.push(i, 0, -size)
  }

  const gridData = {
    shaders: {
      vert: glslify(__dirname + '/shaders/base.vert'),
      frag: glslify(__dirname + '/shaders/foggy.frag')
    },

    geometry: {positions},

    transforms: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [1, 1, 1]
    },

    color: [0, 0.7, 0.8, 0.6],
    primitive: 'line strip',

    pickable: false
  }

  return gridData
}