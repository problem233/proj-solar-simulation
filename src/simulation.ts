type Vec = [number, number]

export interface State {
  m: number
  m_v: Vec
  /**
   * relative to M
   */
  m_pos: Vec
  M: number
}

const G = 6.674e-11

const signum = (x: number) => x > 0 ? 1 : x === 0 ? 0 : -1

const square = (x: number) => x * x

const vecPlus = (x: Vec, y: Vec): Vec => [x[0] + y[0], x[1] + y[1]]
const vecMult = (k: number, x: Vec) => <Vec> x.map(x => k * x)

export function simulate (
    { m, m_v, m_pos: [m_x, m_y], M }: State, T: number): State {
  const a = vecMult(G * M / (square(m_x) + square(m_y)), [
      Math.abs(Math.cos(Math.atan2(m_y, m_x))) * signum(- m_x),
      Math.abs(Math.sin(Math.atan2(m_y, m_x))) * signum(- m_y)
    ])
  return {
    m, M,
    m_v: vecPlus(m_v, vecMult(T, a)),
    m_pos: vecPlus([m_x, m_y],
      vecPlus(vecMult(T, m_v), vecMult(square(T) / 2, a)))
  }
}
