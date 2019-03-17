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

const square = (x: number) => x * x

const vecPlus = (x: Vec, y: Vec): Vec => [x[0] + y[0], x[1] + y[1]]
export const vecMult = (k: number, x: Vec) => <Vec> x.map(x => k * x)

export function simulate (
    { m, m_v, m_pos: [m_x, m_y], M }: State, T: number): State {
  const angle = Math.atan2(m_y, m_x) + Math.PI
  const a = vecMult(G * M / (square(m_x) + square(m_y)),
                    [Math.cos(angle), Math.sin(angle)])
  return {
    m, M,
    m_v: vecPlus(m_v, vecMult(T, a)),
    m_pos: vecPlus([m_x, m_y],
      vecPlus(vecMult(T, m_v), vecMult(square(T) / 2, a)))
  }
}

export function explode ({ m, m_v, m_pos, M }: State, E: number, angle: number, axis: 0 | 1): State {
  const angleR =
    (axis === 1
      ? Math.atan2(m_pos[1], m_pos[0]) + Math.PI
      : Math.atan2(m_v[1], m_v[0])) + angle
  return {
    m, M, m_pos,
    m_v: vecPlus(m_v, vecMult(Math.sqrt(2 * E / m), [Math.cos(angleR), Math.sin(angleR)]))
  }
}
