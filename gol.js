import { useState, useMemo, useRef, useEffect } from 'react'
import { reactJsx } from '@knighted/jsx/react/lite'

const GENERATION_TIME = 1_250
const NOT_RUNNING = 'game not running'
const RUNNING = 'game is running'
const ENDED = 'game has ended'
const ALIVE = 1
const DEAD = 0

class Utils {
  // Return a random integer between [min, max)
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }

  // Return a random integer between [min, max]
  static getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static getRandomMatrix(size) {
    let matrix = []

    for (let x = 0; x < size; x++) {
      matrix[x] = []
      for (let y = 0; y < size; y++) {
        matrix[x][y] = Utils.getRandomIntInclusive(0, 1)
      }
    }

    return matrix
  }
}
const getCellState = (cells, x, y) => {
  const width = cells.length
  const height = width

  if (x < 0 || x >= width || y < 0 || y >= height) {
    return 0
  }

  return cells[x][y]
}
const getNeighborCount = (cells, x, y) => {
  let count = getCellState(cells, x - 1, y - 1) + getCellState(cells, x, y - 1)

  count += getCellState(cells, x + 1, y - 1) + getCellState(cells, x - 1, y)
  count += getCellState(cells, x + 1, y) + getCellState(cells, x - 1, y + 1)
  count += getCellState(cells, x, y + 1) + getCellState(cells, x + 1, y + 1)

  return count
}
export function Gol({ scale = 1 }) {
  const ref = useRef()
  const prev = useRef([])
  const generation = useRef(1)
  const [size, setSize] = useState(0)
  const [cells, setCells] = useState([])
  const [status, setStatus] = useState(NOT_RUNNING)
  const nextGeneration = useMemo(() => {
    return () => {
      const nextCells = []
      let foundLivingCell = false
      let nextStatus = RUNNING

      cells.forEach((row, x) => {
        nextCells[x] = []
        row.forEach((cell, y) => {
          let state = null
          let numNeighbors = getNeighborCount(cells, x, y)

          if (cell === ALIVE) {
            // determine if cell remains alive
            state = numNeighbors === 2 || numNeighbors === 3 ? ALIVE : DEAD
          }

          if (cell === DEAD) {
            // determine if cell remains dead
            state = numNeighbors === 3 ? ALIVE : DEAD
          }

          if (state === ALIVE) {
            foundLivingCell = true
          }

          nextCells[x][y] = state
        })
      })

      generation.current++

      if (!foundLivingCell || JSON.stringify(nextCells) === JSON.stringify(cells)) {
        nextStatus = ENDED
        generation.current = 1
      }

      if (JSON.stringify(nextCells) === JSON.stringify(prev.current)) {
        setCells(Utils.getRandomMatrix(size))
      } else {
        prev.current = cells
        setCells(nextCells)
        setStatus(nextStatus)
      }
    }
  }, [cells, size])

  useEffect(() => {
    let timer = null
    let raf = null

    if (status === RUNNING) {
      timer = setTimeout(nextGeneration, GENERATION_TIME)
    }

    if (status === ENDED) {
      raf = requestAnimationFrame(() => {
        prev.current = cells
        setStatus(RUNNING)
        setCells(Utils.getRandomMatrix(size))
      })
    }

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [status, size, cells, nextGeneration])

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // Divide by 13 to account for the gap
      const perRow = rect.width / 13
      const perColumn = 156 / 13
      const total = scale * perRow * perColumn
      const root = Math.ceil(Math.sqrt(total))
      const cells = Utils.getRandomMatrix(root)

      setCells(cells)
      setStatus(RUNNING)
      setSize(root)
    }
  }, [])

  return reactJsx`
    <div className="gol-grid" ref={${ref}}>
      ${cells.map((row, ridx) => {
        return row.map((cell, cidx) => {
          const classes = cell === 1 ? 'alive' : 'dead'

          return reactJsx`<span key={${ridx + cidx * cidx}} className={${classes}} />`
        })
      })}
    </div>
  `
}
