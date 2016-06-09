// modified version of https://github.com/thibauts/vertices-bounding-box that also works with non nested positions
export default function boundingBox (positions) {
  if (positions.length === 0) {
    return null
  }

  const nested = (Array.isArray(positions) && Array.isArray(positions[0]))
  const dimensions = nested ? positions[0].length : 3
  let min = new Array(dimensions)
  let max = new Array(dimensions)

  for (var i = 0; i < dimensions; i += 1) {
    min[i] = Infinity
    max[i] = -Infinity
  }

  positions.forEach(function (position) {
    for (var i = 0; i < dimensions; i += 1) {
      const _position = nested ? position[i] : position
      max[i] = _position > max[i] ? _position : max[i] // position[i] > max[i] ? position[i] : max[i]
      min[i] = _position < min[i] ? _position : min[i] // min[i] = position[i] < min[i] ? position[i] : min[i]
    }
  })

  return [min, max]
}
