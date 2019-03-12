function clearCanvas (ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function circle (x: number, y: number, r: number) {
  const path = new Path2D()
  path.moveTo(x + r, y)
  path.arc(x, y, r, 0, Math.PI * 2)
  return path
}

window.onload = () => {
  const view = <HTMLDivElement> document.getElementById('view')

  const canvas = document.createElement('canvas')
  canvas.height = view.clientHeight
  canvas.width = view.clientWidth
  view.appendChild(canvas)

  const ctx = <CanvasRenderingContext2D> canvas.getContext('2d')
  ctx.fillStyle = "skyblue"
  ctx.fill(circle(500, 500, 100))

  function f (a: number) {
    clearCanvas(ctx)
    ctx.fill(circle(300 + 200 * Math.cos(a), 300 + 200 * Math.sin(a), 50))
    setTimeout(() => f(a + Math.PI * 0.01), 20)
  }
  // f(0)
  function g (x: number) {
    clearCanvas(ctx)
    ctx.fill(circle(x % ctx.canvas.width, 300 + 200 * Math.sin(x * Math.PI / 360), 50))
    setTimeout(() => g(x + 2), 10)
  }
  g(0)
}
