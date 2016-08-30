import { update, rotate, zoom } from './orbitControls'

import most from 'most'
import { sample } from 'most'
import { fromEvent, combineArray, combine, mergeArray } from 'most'
import { interactionsFromEvents, pointerGestures } from '../interactions/pointerGestures'

import { model } from '../utils/modelUtils'
import animationFrames from '../utils/animationFrames'

export function controlsLoop (interactions, cameraData, fullData) {
  const {settings, camera} = cameraData
  const {gestures} = interactions

  //gestures.taps.taps$.forEach(e=>console.log('taps',e))
  //gestures.taps.shortSingleTaps$.forEach(e => console.log('shortSingleTaps', e))
  //gestures.taps.shortDoubleTaps$.forEach(e => console.log('shortDoubleTaps', e))
  //gestures.taps.longTaps$.forEach(e => console.log('longTaps', e))

  const rate$ = animationFrames() //heartBeat
  //const heartBeat$ = most.periodic(16, 'x')
  //sample(world, rate)

  const mobileReductor = 5.0 // how much we want to divide touch deltas to get movements on mobile

  const dragMoves$ = gestures.dragMoves
    //.throttle(16) // FIXME: not sure, could be optimized some more
    .filter(x => x !== undefined)
    .map( function(data) {
      let delta = [data.delta.x,data.delta.y]
      if(data.type === 'touch'){
        delta = delta.map(x=>x/mobileReductor)
      }
      return delta
    })
    .map(function (delta) {
      const angle = [Math.PI * delta[0], - Math.PI * delta[1]]
      return angle
    })

  const zooms$ = gestures.zooms
    .map(x => -x) // we invert zoom direction
    .startWith(0)
    .filter(x => !isNaN(x))

  function makeCameraModel () {
    function applyRotation (state, angles) {
      state = rotate(settings, state, angles) // mutating, meh
      state = update(settings, state) // not sure
      return state
    }

    function applyZoom (state, zooms) {
      console.log('applyZoom', zooms)
      state = zoom(settings, state, zooms) // mutating, meh
      state = update(settings, state) // not sure
      return state
    }

    function updateState (state) {
      return update(settings, state)
    }

    const updateFunctions = {applyZoom, applyRotation, updateState}
    const actions = {applyZoom: zooms$, applyRotation: dragMoves$, updateState: rate$}

    const cameraState$ = model(camera, actions, updateFunctions)

    return cameraState$
    return most.merge(
      cameraState$.take(2),
      cameraState$// .throttle(20)
    )
    // .map(cameraState => update(settings, cameraState))
  }

  function updateCompleteState (cameraState) {
    let data = fullData
    data.camera = cameraState
    return data
  }

  const cameraState$ = makeCameraModel()

  return cameraState$
    .sample(x=>x, rate$)
    .filter(x => x.changed)
    .merge(cameraState$)
    .map(updateCompleteState)
    //.tap(e=>console.log('here'))



   /*const updateForRender$ = most.sample(updateCompleteState, heartBeat$, cameraState$)
     .filter(x => x.changed)
     .map(updateCompleteState)
   return updateForRender$*/
}


/*const cameraState$ = most.combine(function (angles, zooms) {
  return {angles, zooms}
}, dragMoves$, zooms$)
  .scan(function (state, current) {
    const {angles, zooms} = current
    // console.log('delta', angles)

    let cameraState = update(settings, camera)
    cameraState = zoom(settings, cameraState, zooms) // mutating, meh
    cameraState = rotate(settings, cameraState, angles)
    cameraState = update(settings, cameraState)

    let data = fullData
    data.camera = cameraState
    return data
  }, undefined)
  .filter(x => x !== undefined)*/

export function controlsLoopOld (cameraDefaults, render, fullData) {
  const {settings, camera} = cameraDefaults
  // FIXME: hack for now
  let cameraState = update(settings, camera)
  let prevMouse = [0, 0]

  function onMouseChange (buttons, x, y, mods) {
    // console.log('mouse-change', buttons, x, y, mods)
    if (buttons === 1) {
      let delta = [x - prevMouse[0], y - prevMouse[1]]
      let angle = [0, 0]
      angle[0] = 2 * Math.PI * delta[0] / 1800 * 2.0
      angle[1] = -2 * Math.PI * delta[1] / 1800 * 2.0

      cameraState = rotate(settings, cameraState, angle)
    }
    prevMouse = [x, y]
  }

  function onMouseWheel (dx, dy) {
    const zoomDelta = dy
    cameraState = zoom(settings, cameraState, zoomDelta)
  }

  function updateStep () {
    cameraState = update(settings, cameraState)

    if (cameraState && cameraState.changed) {
      let data = fullData
      data.camera = cameraState
      render(data)
    }
    window.requestAnimationFrame(updateStep)
  }

  require('mouse-change')(onMouseChange)
  require('mouse-wheel')(onMouseWheel)

  let data = fullData
  data.camera = cameraState
  render(data)

  requestAnimationFrame(updateStep)
}
