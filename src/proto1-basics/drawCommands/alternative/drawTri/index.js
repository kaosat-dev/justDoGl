var glslify = require('glslify-sync') // works in client & server
import mat4 from 'gl-mat4'

export default function drawTri (regl, params) {
  const {width, height} = params
  return regl({
    vert: glslify(__dirname + '/shaders/tri.vert'),
    frag: glslify(__dirname + '/shaders/tri.frag'),

    attributes: {
      position: [
        width / 2, height, 0,
        0, 0, 0,
        width, 0, 0]
    },
    count: 3,
    uniforms: {
      model: (context, props) => props.model || mat4.identity([]),
      color: regl.prop('color'),
      angle: ({tick}) => 0.01 * tick
    },
    cull: {
      enable: false,
      face: 'back'
    }
  })
}
