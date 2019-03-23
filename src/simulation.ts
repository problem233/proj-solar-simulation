type Vec = [number, number]

export interface State {
  t: number
  m: number
  m_v: Vec
  /**
   * relative to M
   */
  m_pos: Vec
  M: number
}

const G = 6.674e-11

const square = (x: number) => x * x

const vecPlus = (x: Vec, y: Vec): Vec => [x[0] + y[0], x[1] + y[1]]
export const vecMult = (k: number, x: Vec) => <Vec> x.map(x => k * x)
export const vecSquare = ([x, y]: Vec) => x * x + y * y
export const vecLength = (x: Vec) => Math.sqrt(vecSquare(x))

export function simulate (
    { t, m, m_v, m_pos: [m_x, m_y], M }: State, T: number): State {
  const angle = Math.atan2(m_y, m_x) + Math.PI
  const a = vecMult(G * M / (square(m_x) + square(m_y)),
                    [Math.cos(angle), Math.sin(angle)])
  return {
    m, M,
    t: t + T,
    m_v: vecPlus(m_v, vecMult(T, a)),
    m_pos: vecPlus([m_x, m_y],
      vecPlus(vecMult(T, m_v), vecMult(square(T) / 2, a)))
  }
}

export const explode = (state: State, W: number): State => ({
  ...state,
  m_v: vecMult(Math.sqrt(1 - 2 * W / state.m / vecSquare(state.m_v)), state.m_v)
})
