import { simulate, State } from './simulation'

function clearCanvas (ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function circle (x: number, y: number, r: number) {
  const path = new Path2D()
  path.moveTo(x + r, y)
  path.arc(x, y, r, 0, Math.PI * 2)
  return path
}

const M = 1.9891e30

const data: { [key: string]: State & { name: string } } = {
  mercury: { M,
    name: "水星",
    m: 3.3011e23,
    m_v: [0, 3.886e4],
    m_pos: [6.982e10, 0]
  },
  venus: { M,
    name: "金星",
    m: 4.8675e24,
    m_v: [0, 3.479e4],
    m_pos: [1.0894e11, 0]
  },
  earth: { M,
    name: "地球",
    m: 5.9723e24,
    m_v: [0, 2.929e4],
    m_pos: [1.521e11, 0]
  },
  mars: { M,
    name: "火星",
    m: 6.4171e23,
    m_v: [0, 2.197e4],
    m_pos: [2.4923e11, 0]
  }
}

const length = ([x, y]: [number, number]) => Math.sqrt(x * x + y * y)

const multiSimulate = (state: State, T: number, steps: number): State =>
  steps > 0 ? multiSimulate(simulate(state, T), T, steps - 1) : state

function drawState (ctx: CanvasRenderingContext2D, scale: number, realisticSize: boolean, state: State) {
  ctx.fillStyle = "yellow"
  ctx.fill(circle(
    ctx.canvas.width / 2, ctx.canvas.height / 2,
    (realisticSize ? 6.957e8 : 4e10) * scale))
  ctx.fillStyle = "gray"
  ctx.fill(circle(
    ctx.canvas.width / 2 + state.m_pos[0] * scale,
    ctx.canvas.height / 2 - state.m_pos[1] * scale,
    (realisticSize ? 2.4397e6 : 5e9) * scale));
  (<HTMLInputElement> document.getElementById('input-M')).valueAsNumber = state.M / 1e29;
  (<HTMLInputElement> document.getElementById('input-m')).valueAsNumber = state.m / 1e22;
  (<HTMLInputElement> document.getElementById('input-pos-x')).valueAsNumber = state.m_pos[0] / 1e9;
  (<HTMLInputElement> document.getElementById('input-pos-y')).valueAsNumber = state.m_pos[1] / 1e9;
  (<HTMLInputElement> document.getElementById('input-pos-r')).valueAsNumber = length(state.m_pos) / 1e9;
  (<HTMLInputElement> document.getElementById('input-v-x')).valueAsNumber = state.m_v[0] / 1e3;
  (<HTMLInputElement> document.getElementById('input-v-y')).valueAsNumber = state.m_v[1] / 1e3;
  (<HTMLInputElement> document.getElementById('input-v')).valueAsNumber = length(state.m_v) / 1e3
}

window.onload = () => {
  const view = <HTMLDivElement> document.getElementById('view')

  const canvas = document.createElement('canvas')
  canvas.height = view.clientHeight
  canvas.width = view.clientWidth
  view.appendChild(canvas)

  // simulation related constants
  const viewSpeed = 3600 * 25 * 10 // 10 days / s
  const framerate = 50
  const simSpeed = framerate * 100 // 5000 steps / s

  // calculated constants
  const T = viewSpeed / simSpeed
  const steps = simSpeed / framerate
  const frameTime = 1000 / framerate

  // state store
  let scale = canvas.height / 3.1e11
  let stateStore: State = data.mercury
  let toPause = false
  let reallyPaused = true

  const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

  function redraw () {
    clearCanvas(ctx)
    // it's impractical to use realistic size
    drawState(ctx, scale, false, stateStore)
  }

  redraw();
  (<HTMLInputElement> document.getElementById('input-scale')).valueAsNumber = 1 / scale / 1e7

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
      frame(stateStore)
    }
  }

  function pause () {
    if (! reallyPaused) toPause = true
  }

  // time
  (<HTMLButtonElement> document.getElementById('continue'))
    .addEventListener('click', start);
  (<HTMLButtonElement> document.getElementById('pause'))
    .addEventListener('click', pause);
  // scale
  (<HTMLInputElement> document.getElementById('input-scale'))
    .addEventListener('input', function () {
      scale = 1 / this.valueAsNumber / 1e7
      redraw()
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
      elem.addEventListener('blur', start)
    });
  (<HTMLInputElement> document.getElementById('input-M'))
    .addEventListener('input', function () {
      stateStore.M = this.valueAsNumber * 1e29
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-m'))
    .addEventListener('input', function () {
      stateStore.m = this.valueAsNumber * 1e22
      redraw()
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
  (<HTMLInputElement> document.getElementById('input-pos-r'))
    .addEventListener('input', function () {
      redraw()
    });
  (<HTMLInputElement> document.getElementById('input-v'))
    .addEventListener('input', function () {
      redraw()
    })
}
