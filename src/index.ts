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

const data: { [key: string]: State } = {
  mercury: { M,
    m: 3.3011e23,
    m_v: [0, 3.886e4],
    m_pos: [6.982e10, 0]
  }
}

const length = ([x, y]: [number, number]) => Math.sqrt(x * x + y * y)

const multiSimulate = (state: State, T: number, steps: number): State =>
  steps > 0 ? multiSimulate(simulate(state, T), T, steps - 1) : state

function drawState (ctx: CanvasRenderingContext2D, scale: number, state: State) {
  ctx.fillStyle = "white"
  ctx.fillStyle = "yellow"
  ctx.fill(circle(ctx.canvas.width / 2, ctx.canvas.height / 2, 50))
  ctx.fillStyle = "gray"
  ctx.fill(circle(
    ctx.canvas.width / 2 + state.m_pos[0] * scale,
    ctx.canvas.height / 2 - state.m_pos[1] * scale, 10))
}

window.onload = () => {
  const view = <HTMLDivElement> document.getElementById('view')

  const canvas = document.createElement('canvas')
  canvas.height = view.clientHeight
  canvas.width = view.clientWidth
  view.appendChild(canvas)

  // simulation related constants
  const scale = canvas.height / 3.1e11
  const viewSpeed = 3600 * 25 * 10 // 10 days / s
  const framerate = 50
  const simSpeed = framerate * 100 // 5000 steps / s

  // calculated constants
  const T = viewSpeed / simSpeed
  const steps = simSpeed / framerate
  const frameTime = 1000 / framerate

  // state store
  let stateStore = data.mercury
  let paused = false

  const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

  drawState(ctx, scale, stateStore)

  function frame (state: State) {
    stateStore = state
    clearCanvas(ctx)
    drawState(ctx, scale, state)
    if (paused) paused = false
    else setTimeout(() => frame(multiSimulate(state, T, steps)), frameTime)
  }

  (<HTMLButtonElement> document.getElementById('continue'))
    .addEventListener('click', () => frame(stateStore));
  (<HTMLButtonElement> document.getElementById('pause'))
    .addEventListener('click', () => { paused = true })
}
