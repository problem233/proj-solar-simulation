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

window.onload = () => {
  const view = <HTMLDivElement> document.getElementById('view')

  const canvas = document.createElement('canvas')
  canvas.height = view.clientHeight
  canvas.width = view.clientWidth
  view.appendChild(canvas)

  const scale = canvas.height / 3.1e11
  const timescale = 3600 * 12 // 12 hrs / s
  const framerate = 50

  const T = timescale / framerate

  const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')

  function frame (state: State) {
    clearCanvas(ctx)
    ctx.fillStyle = "white"
    ctx.fillText("v: " + length(state.m_v).toExponential(3), 0, 10)
    ctx.fillText("r: " + length(state.m_pos).toExponential(3), 0, 20)
    ctx.fillStyle = "yellow"
    ctx.fill(circle(canvas.width / 2, canvas.height / 2, 50))
    ctx.fillStyle = "gray"
    ctx.fill(circle(canvas.width / 2 + state.m_pos[0] * scale, canvas.height / 2 - state.m_pos[1] * scale, 10))
    setTimeout(() => frame(simulate(state, T)), 1000 / framerate)
  }
  frame(data.mercury)
}
