import { clearCanvas, fadingOutTrace, Style, styledCircle } from './canvas'
import {
  explode, simulate, State,
  vecLength, vecMult, vecSquare
} from './simulation'

interface Styled {
  style: Style
}

const M = 1.9891e30
const sunStyle: Style = [[0, '#DE5E06'], [0.6, '#EC7610'], [0.9, '#F6C760'], [1, '#FEF9C7']]

const data: { [key: string]: State & Styled & { name: string } } = {
  mercury: { M,
    name: "水星",
    style: [[0, '#7E7673'], [0.7, '#8C8384'], [1, '#B0A89D']],
    m: 3.3011e23,
    m_v: [0, 3.886e4],
    m_pos: [6.982e10, 0]
  },
  venus: { M,
    name: "金星",
    style: [[0, '#A96117'], [0.7, '#C08120'], [1, '#E1A83D']],
    m: 4.8675e24,
    m_v: [0, 3.479e4],
    m_pos: [1.0894e11, 0]
  },
  earth: { M,
    name: "地球",
    style: [[0, '#4D7ABE'], [0.7, '#5283BB'], [1, '#83B1ED']],
    m: 5.9723e24,
    m_v: [0, 2.929e4],
    m_pos: [1.521e11, 0]
  },
  mars: { M,
    name: "火星",
    style: [[0, '#9B5A20'], [0.7, '#AD6F2F'], [1, '#D59639']],
    m: 6.4171e23,
    m_v: [0, 2.197e4],
    m_pos: [2.4923e11, 0]
  }
}

const multiSimulate = (state: State, T: number, steps: number): State =>
  steps > 0 ? multiSimulate(simulate(state, T), T, steps - 1) : state

function drawState (
    ctx0: CanvasRenderingContext2D, ctx1: CanvasRenderingContext2D,
    scale: number, state: State, style: Style) {
  styledCircle(
    ctx0, sunStyle,
    ctx0.canvas.width / 2, ctx0.canvas.height / 2,
    4e10 * scale)
  const viewMPos: [number, number] = [
    ctx0.canvas.width / 2 + state.m_pos[0] * scale,
    ctx0.canvas.height / 2 - state.m_pos[1] * scale
  ]
  styledCircle(ctx0, style, viewMPos[0], viewMPos[1], 5e9 * scale)
  fadingOutTrace(ctx1, viewMPos[0], viewMPos[1]);
  (<HTMLInputElement> document.getElementById('input-M')).valueAsNumber = state.M / 1e29;
  (<HTMLInputElement> document.getElementById('input-m')).valueAsNumber = state.m / 1e22;
  (<HTMLInputElement> document.getElementById('input-pos-x')).valueAsNumber = state.m_pos[0] / 1e9;
  (<HTMLInputElement> document.getElementById('input-pos-y')).valueAsNumber = state.m_pos[1] / 1e9;
  (<HTMLInputElement> document.getElementById('input-pos-r')).valueAsNumber = vecLength(state.m_pos) / 1e9;
  (<HTMLInputElement> document.getElementById('input-v-x')).valueAsNumber = state.m_v[0] / 1e3;
  (<HTMLInputElement> document.getElementById('input-v-y')).valueAsNumber = state.m_v[1] / 1e3;
  (<HTMLInputElement> document.getElementById('input-v-len')).valueAsNumber = vecLength(state.m_v) / 1e3;
  (<HTMLInputElement> document.getElementById('input-ek')).valueAsNumber = state.m * vecSquare(state.m_v) / 2 / 1e29
}

window.onload = () => {
  const view = <HTMLDivElement> document.getElementById('view')

  const canvas0 = document.createElement('canvas')
  canvas0.height = view.clientHeight
  canvas0.width = view.clientWidth
  canvas0.style.zIndex = '1'
  view.appendChild(canvas0)

  const canvas1 = document.createElement('canvas')
  canvas1.height = view.clientHeight
  canvas1.width = view.clientWidth
  canvas1.style.zIndex = '0'
  view.appendChild(canvas1)

  // constants
  const framerate = 50
  const frameTime = 1000 / framerate

  // state store
  let viewSpeed = 3600 * 25 * 10 // 10 days / s
  let simSpeed = framerate * 100 // 5000 steps / s

  let T = viewSpeed / simSpeed
  let steps = simSpeed / framerate

  let scale = canvas0.height / 3.1e11
  let stateStore: State = data.mercury
  let styleStore: Style = data.mercury.style
  let toPause = false
  let reallyPaused = true

  const ctx0 = <CanvasRenderingContext2D> canvas0.getContext('2d')
  const ctx1 = <CanvasRenderingContext2D> canvas1.getContext('2d')
  ctx1.fillStyle = 'white'

  function redraw () {
    clearCanvas(ctx0)
    drawState(ctx0, ctx1, scale, stateStore, styleStore)
  }

  redraw();
  (<HTMLInputElement> document.getElementById('input-scale')).valueAsNumber = 1 / scale / 1e7;
  (<HTMLInputElement> document.getElementById('input-timescale')).valueAsNumber = 10
  const inpAcc = (<HTMLInputElement> document.getElementById('input-accuracy'))
  inpAcc.valueAsNumber = simSpeed
  inpAcc.step = framerate.toString()
  inpAcc.min = framerate.toString()
  const inpCP = (<HTMLButtonElement> document.getElementById('continue-pause'));
  (<HTMLInputElement> document.getElementById('input-work')).valueAsNumber = 0

  function start () {
    function frame (state: State) {
      stateStore = state
      redraw()
      if (toPause) {
        toPause = false
        reallyPaused = true
      } else setTimeout(() => frame(multiSimulate(state, T, steps)), frameTime)
    }
    if (reallyPaused) {
      toPause = false
      reallyPaused = false
      inpCP.innerText = "❙❙"
      frame(stateStore)
    }
  }

  function pause () {
    if (! reallyPaused) {
      toPause = true
      inpCP.innerText = "▶"
    }
  }

  // time
  inpCP.addEventListener('click', function () {
    if (reallyPaused) start()
    else pause()
  });
  (<HTMLInputElement> document.getElementById('input-timescale'))
    .addEventListener('input', function () {
      if (this.validity.valid) {
        viewSpeed = 3600 * 24 * this.valueAsNumber
        T = viewSpeed / simSpeed
      }
    });
  (<HTMLInputElement> document.getElementById('input-accuracy'))
    .addEventListener('input', function () {
      if (this.validity.valid) {
        simSpeed = this.valueAsNumber
        T = viewSpeed / simSpeed
        steps = simSpeed / framerate
      }
    });
  // scale
  (<HTMLInputElement> document.getElementById('input-scale'))
    .addEventListener('input', function () {
      if (this.validity.valid) {
        scale = 1 / this.valueAsNumber / 1e7
        clearCanvas(ctx1)
        redraw()
      }
    });
  // explosion
  (<HTMLButtonElement> document.getElementById('explode'))
    .addEventListener('click', () => {
      const inpWork = (<HTMLInputElement> document.getElementById('input-work'))
      if (inpWork.validity.valid) {
        const prevPaused = reallyPaused
        pause()
        setTimeout(() => {
          stateStore = explode(stateStore, inpWork.valueAsNumber * 1e29)
          if (! prevPaused) start()
          else redraw()
        }, frameTime)
      }
    })
  // data
  Object.keys(data).forEach(key => {
    const option = document.createElement('option')
    option.innerText = data[key].name
    option.addEventListener('click', () => {
      const prevPaused = reallyPaused
      pause()
      setTimeout(() => {
        stateStore = data[key]
        styleStore = data[key].style
        clearCanvas(ctx1)
        if (! prevPaused) start()
        else redraw()
      }, frameTime)
    });
    (<HTMLSelectElement> document.getElementById('preset-select')).add(option)
  })
  Array.from(
    <HTMLCollectionOf<HTMLInputElement>>
    (<HTMLDivElement> document.getElementById('data'))
      .getElementsByTagName('input'))
    .forEach(elem => {
      elem.addEventListener('click', pause)
      elem.addEventListener('blur', function () {
        if (this.validity.valid) {
          start()
        }
      })
    });
  (<HTMLInputElement> document.getElementById('input-M'))
    .addEventListener('input', function () {
      if (this.validity.valid) {
        stateStore.M = this.valueAsNumber * 1e29
        redraw()
      }
    });
  (<HTMLInputElement> document.getElementById('input-m'))
    .addEventListener('input', function () {
      if (this.validity.valid) {
        stateStore.m = this.valueAsNumber * 1e22
        redraw()
      }
    });
  (<HTMLInputElement> document.getElementById('input-pos-x'))
    .addEventListener('input', function () {
      stateStore.m_pos[0] = this.valueAsNumber * 1e9
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-pos-y'))
    .addEventListener('input', function () {
      stateStore.m_pos[1] = this.valueAsNumber * 1e9
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-pos-r'))
    .addEventListener('input', function () {
      stateStore.m_pos =
        vecMult(this.valueAsNumber * 1e9 / vecLength(stateStore.m_pos),
                stateStore.m_pos)
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-v-x'))
    .addEventListener('input', function () {
      stateStore.m_v[0] = this.valueAsNumber * 1e3
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-v-y'))
    .addEventListener('input', function () {
      stateStore.m_v[1] = this.valueAsNumber * 1e3
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-v-len'))
    .addEventListener('input', function () {
      stateStore.m_v =
        vecMult(this.valueAsNumber * 1e3 / vecLength(stateStore.m_v),
                stateStore.m_v)
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-ek'))
    .addEventListener('input', function () {
      stateStore.m_v = vecMult(
        Math.sqrt(2 * this.valueAsNumber / stateStore.m)
          / vecLength(stateStore.m_v),
        stateStore.m_v)
      redraw()
    })
}
