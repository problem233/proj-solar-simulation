export function clearCanvas (ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function circle (x: number, y: number, r: number) {
  const path = new Path2D()
  path.moveTo(x + r, y)
  path.arc(x, y, r, 0, Math.PI * 2)
  return path
}

export function fadeOut (ctx: CanvasRenderingContext2D, opacity = 99) {
  // tslint:disable-next-line:prefer-const
  let data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (let y = 0; y < data.height; y++)
    for (let x = 0; x < data.width; x++)
      data.data[((x * (data.height * 4)) + (y * 4)) + 3] -= (100 - opacity)
  ctx.putImageData(data, 0, 0)
}

export function fadingOutTrace (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, width = 3, opacity?: number) {
  fadeOut(ctx, opacity)
  ctx.fill(circle(x, y, width / 2))
}

export type Style = Array<[number, string]>

export function styledCircle (
    ctx: CanvasRenderingContext2D,
    s: Style, x: number, y: number, r: number) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
  s.forEach(([offset, color]) => grad.addColorStop(offset, color))
  ctx.fillStyle = grad
  ctx.fill(circle(x, y, r))
}
