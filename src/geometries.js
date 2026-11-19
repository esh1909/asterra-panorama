import * as THREE from 'three'

function lerp(a, b, t) {
  return a + (b - a) * t
}

function smoothstep(t) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

/** Lower-body / hood / deck height. Greenhouse is built separately. */
export function silhouetteHeight(z) {
  if (z >= 1.08) {
    const t = smoothstep((2.18 - z) / 1.1)
    return lerp(1.02, 1.145, t)
  }
  if (z >= -1.48) return 1.11
  const t = smoothstep((-1.48 - z) / 0.68)
  return lerp(1.11, 1.06, t)
}

function wellMinY(z) {
  for (const cz of [1.34, -1.34]) {
    const dz = z - cz
    const r = 0.52
    if (Math.abs(dz) < r) {
      return 0.425 + Math.sqrt(Math.max(0, r * r - dz * dz))
    }
  }
  return 0.24
}

function halfWidth(z, y, yMax) {
  let w = 0.93
  if (z > 1.85) {
    const t = THREE.MathUtils.clamp((z - 1.85) / 0.35, 0, 1)
    w *= 1 - 0.015 * t * t
  }
  if (z < -1.62) {
    const t = THREE.MathUtils.clamp((-z - 1.62) / 0.56, 0, 1)
    w *= 1 - 0.08 * t * t
  }
  if (y < 1.02) {
    const front = Math.exp(-((z - 1.34) ** 2) / 0.16)
    const rear = Math.exp(-((z + 1.34) ** 2) / 0.16)
    const lift = Math.sin(Math.PI * THREE.MathUtils.clamp((y - 0.24) / 0.78, 0, 1))
    w += 0.13 * (front + rear) * lift
  }
  return w
}

function isDoorHole(z, y, doorHole) {
  return doorHole && z <= 1.04 && z >= -0.08 && y >= 0.5 && y <= 1.12
}

/**
 * Smooth half-body (x >= 0) with fender wells, bounded DLO, roof rails, and wrap.
 */
export function createParametricHalf(doorHole = false) {
  const zSegs = 120
  const vSegs = 36
  const zFront = 2.2
  const zRear = -2.16
  const railV = 0.66

  const positions = []
  const grid = []

  for (let zi = 0; zi <= zSegs; zi++) {
    const row = []
    const z = lerp(zFront, zRear, zi / zSegs)
    const yMax = silhouetteHeight(z)
    const yMin = wellMinY(z)
    for (let vi = 0; vi <= vSegs; vi++) {
      const v = vi / vSegs
      let x
      let y
      if (v <= railV) {
        const t = v / railV
        y = lerp(yMin, yMax, t)
        x = halfWidth(z, y, yMax)
      } else {
        const t = (v - railV) / (1 - railV)
        const ease = smoothstep(t)
        y = yMax + 0.02 * Math.sin(ease * Math.PI)
        x = halfWidth(z, yMax, yMax) * (1 - ease)
      }
      row.push(positions.length / 3)
      positions.push(x, y, z)
    }
    grid.push(row)
  }

  const indices = []
  for (let zi = 0; zi < zSegs; zi++) {
    for (let vi = 0; vi < vSegs; vi++) {
      const z = lerp(zFront, zRear, (zi + 0.5) / zSegs)
      const yMax = silhouetteHeight(z)
      const yMin = wellMinY(z)
      const v = (vi + 0.5) / vSegs
      let y
      if (v <= railV) y = lerp(yMin, yMax, v / railV)
      else y = yMax

      if (v > railV && z < 2.15 && z > -1.48) continue
      if (v <= railV && isDoorHole(z, y, doorHole)) continue

      const a = grid[zi][vi]
      const b = grid[zi + 1][vi]
      const c = grid[zi + 1][vi + 1]
      const d = grid[zi][vi + 1]
      indices.push(a, b, d, b, c, d)
    }
  }

  const railCount = Math.round(railV * vSegs)
  const capWall = (zi, front) => {
    for (let vi = 0; vi < railCount; vi++) {
      const i0 = grid[zi][vi]
      const i1 = grid[zi][vi + 1]
      const y0 = positions[i0 * 3 + 1]
      const z0 = positions[i0 * 3 + 2]
      const y1 = positions[i1 * 3 + 1]
      const z1 = positions[i1 * 3 + 2]
      const a = positions.length / 3
      positions.push(0, y0, z0)
      const b = positions.length / 3
      positions.push(0, y1, z1)
      if (front) indices.push(i0, i1, b, i0, b, a)
      else indices.push(i0, a, b, i0, b, i1)
    }
  }
  capWall(0, true)
  capWall(zSegs, false)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function greenhouseYMax(z) {
  if (z >= 0.48) {
    const t = smoothstep((1.1 - z) / 0.62)
    return lerp(1.14, 1.68, t)
  }
  if (z >= -0.95) return 1.68
  const t = smoothstep((-0.95 - z) / 0.52)
  return lerp(1.68, 1.12, t)
}

function greenhouseWidth(z, y) {
  const yMax = greenhouseYMax(z)
  const t = THREE.MathUtils.clamp((y - 1.1) / Math.max(0.04, yMax - 1.1), 0, 1)
  let w = lerp(0.89, 0.84, t)
  if (z > 0.75) w *= 1 - 0.03 * smoothstep((z - 0.75) / 0.33)
  if (z < -0.7 && z > -1.42) w = Math.max(w, 0.88)
  if (z < -1.05) w *= 1 - 0.04 * smoothstep((-z - 1.05) / 0.45)
  return w
}

function isSideGlass(z, y) {
  const yMax = greenhouseYMax(z)
  if (y < 1.175 || y > yMax - 0.1) return false
  if (z <= 0.52 && z >= 0.02) return true
  if (z <= -0.14 && z >= -0.7) return true
  return false
}

export function createHoodGeometry() {
  const zSegs = 36
  const xSegs = 20
  const z0 = 2.18
  const z1 = 1.06
  const positions = []
  const indices = []
  for (let zi = 0; zi <= zSegs; zi++) {
    const z = lerp(z0, z1, zi / zSegs)
    const yBase = silhouetteHeight(z) + 0.01
    const w = halfWidth(z, yBase, yBase) - 0.015
    for (let xi = 0; xi <= xSegs; xi++) {
      const x = lerp(-w, w, xi / xSegs)
      const nx = w > 0 ? x / w : 0
      const y = yBase + 0.028 * (1 - nx * nx)
      positions.push(x, y, z)
    }
  }
  for (let zi = 0; zi < zSegs; zi++) {
    for (let xi = 0; xi < xSegs; xi++) {
      const a = zi * (xSegs + 1) + xi
      const b = a + 1
      const c = a + (xSegs + 1)
      const d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function createDeckGeometry() {
  const zSegs = 18
  const xSegs = 16
  const z0 = -1.48
  const z1 = -2.12
  const positions = []
  const indices = []
  for (let zi = 0; zi <= zSegs; zi++) {
    const z = lerp(z0, z1, zi / zSegs)
    const yBase = silhouetteHeight(z) + 0.01
    const w = halfWidth(z, yBase, yBase) - 0.04
    for (let xi = 0; xi <= xSegs; xi++) {
      const x = lerp(-w, w, xi / xSegs)
      positions.push(x, yBase, z)
    }
  }
  for (let zi = 0; zi < zSegs; zi++) {
    for (let xi = 0; xi < xSegs; xi++) {
      const a = zi * (xSegs + 1) + xi
      const b = a + 1
      const c = a + (xSegs + 1)
      const d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function pillarVolume(corners) {
  const positions = new Float32Array(corners.flat())
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex([
    0, 1, 5, 0, 5, 4,
    1, 3, 7, 1, 7, 5,
    3, 2, 6, 3, 6, 7,
    2, 0, 4, 2, 4, 6,
    4, 5, 7, 4, 7, 6,
    0, 2, 3, 0, 3, 1,
  ])
  geometry.computeVertexNormals()
  return geometry
}

export function createAPillarGeometry() {
  return pillarVolume([
    [0.9, 1.145, 1.08],
    [0.8, 1.145, 1.08],
    [0.9, 1.145, 0.92],
    [0.8, 1.145, 0.92],
    [0.8, 1.675, 0.5],
    [0.72, 1.675, 0.5],
    [0.8, 1.675, 0.58],
    [0.72, 1.675, 0.58],
  ])
}

export function createCPillarGeometry() {
  return pillarVolume([
    [0.9, 1.12, -0.96],
    [0.78, 1.12, -0.96],
    [0.9, 1.12, -1.42],
    [0.78, 1.12, -1.42],
    [0.84, 1.68, -0.92],
    [0.72, 1.68, -0.92],
    [0.84, 1.68, -1.1],
    [0.72, 1.68, -1.1],
  ])
}

export function createGreenhouseHalf() {
  const zSegs = 90
  const vSegs = 22
  const zFront = 1.1
  const zRear = -1.52
  const railV = 0.84
  const positions = []
  const grid = []

  for (let zi = 0; zi <= zSegs; zi++) {
    const row = []
    const z = lerp(zFront, zRear, zi / zSegs)
    const yMax = greenhouseYMax(z)
    const yMin = 1.095
    for (let vi = 0; vi <= vSegs; vi++) {
      const v = vi / vSegs
      let x
      let y
      if (v <= railV) {
        const t = v / railV
        y = lerp(yMin, yMax, t)
        x = greenhouseWidth(z, y)
      } else {
        const t = (v - railV) / (1 - railV)
        y = yMax + 0.01
        x = greenhouseWidth(z, yMax) * (1 - 0.28 * t)
      }
      row.push(positions.length / 3)
      positions.push(x, y, z)
    }
    grid.push(row)
  }

  const indices = []
  for (let zi = 0; zi < zSegs; zi++) {
    for (let vi = 0; vi < vSegs; vi++) {
      const z = lerp(zFront, zRear, (zi + 0.5) / zSegs)
      const yMax = greenhouseYMax(z)
      const v = (vi + 0.5) / vSegs
      const y = v <= railV ? lerp(1.095, yMax, v / railV) : yMax
      if (v <= railV && isSideGlass(z, y)) continue
      const a = grid[zi][vi]
      const b = grid[zi + 1][vi]
      const c = grid[zi + 1][vi + 1]
      const d = grid[zi][vi + 1]
      indices.push(a, b, d, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function quadGeometry(corners) {
  const positions = new Float32Array(corners.flat())
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex([0, 1, 2, 0, 2, 3])
  geometry.computeVertexNormals()
  return geometry
}

export function createWindshieldGeometry() {
  return quadGeometry([
    [-0.81, 1.148, 1.07],
    [0.81, 1.148, 1.07],
    [0.79, 1.678, 0.5],
    [-0.79, 1.678, 0.5],
  ])
}

export function createFrontDoorGlassGeometry() {
  return quadGeometry([
    [-0.02, 1.17, -0.5],
    [-0.02, 1.17, -1.08],
    [-0.02, 1.62, -1.08],
    [-0.02, 1.54, -0.5],
  ])
}

export function createRearDoorGlassGeometry() {
  return quadGeometry([
    [-0.02, 1.17, -0.08],
    [-0.02, 1.17, -0.62],
    [-0.02, 1.6, -0.62],
    [-0.02, 1.6, -0.08],
  ])
}

export function createBacklightGeometry() {
  return quadGeometry([
    [-0.78, 1.13, -1.46],
    [0.78, 1.13, -1.46],
    [0.78, 1.675, -0.95],
    [-0.78, 1.675, -0.95],
  ])
}

export function createFrontDloGlass() {
  return quadGeometry([
    [0.885, 1.18, 0.5],
    [0.885, 1.18, 0.03],
    [0.845, 1.64, 0.03],
    [0.86, 1.56, 0.5],
  ])
}

export function createRearDloGlass() {
  return quadGeometry([
    [0.885, 1.18, -0.16],
    [0.885, 1.18, -0.72],
    [0.85, 1.62, -0.72],
    [0.85, 1.62, -0.16],
  ])
}

export function createQuarterGlassGeometry() {
  return quadGeometry([
    [0.86, 1.18, -0.97],
    [0.86, 1.18, -1.17],
    [0.72, 1.46, -1.17],
    [0.78, 1.52, -0.97],
  ])
}

function extrudeXZ(shape, depth, bevel = 0.014) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 24,
  })
  geometry.rotateX(Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export function createArchCladding() {
  const shape = new THREE.Shape()
  const ro = 0.62
  const ri = 0.448
  const a0 = 0.06
  const a1 = Math.PI - 0.06
  shape.absarc(0, 0, ro, a0, a1, false)
  shape.absarc(0, 0, ri, a1, a0, true)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 3,
    curveSegments: 40,
  })
  geometry.rotateY(-Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export function createRoofFrameGeometry() {
  const outer = new THREE.Shape()
  outer.moveTo(-0.86, 0.56)
  outer.lineTo(0.86, 0.56)
  outer.lineTo(0.84, -0.96)
  outer.lineTo(-0.84, -0.96)
  outer.closePath()
  const hole = new THREE.Path()
  hole.moveTo(-0.6, 0.36)
  hole.lineTo(-0.58, -0.8)
  hole.lineTo(0.58, -0.8)
  hole.lineTo(0.6, 0.36)
  hole.closePath()
  outer.holes.push(hole)
  const geometry = extrudeXZ(outer, 0.038, 0.004)
  geometry.translate(0, 1.678, 0)
  return geometry
}

export function createRoofGlassGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.58, 0.34)
  shape.lineTo(0.58, 0.34)
  shape.lineTo(0.56, -0.78)
  shape.lineTo(-0.56, -0.78)
  shape.closePath()
  const geometry = extrudeXZ(shape, 0.014, 0.002)
  geometry.translate(0, 1.684, 0)
  return geometry
}

export function makeScreenTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 576
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0B0D10'
  ctx.fillRect(0, 0, 1024, 576)

  const glow = ctx.createRadialGradient(640, 220, 20, 640, 220, 420)
  glow.addColorStop(0, 'rgba(80, 55, 18, 0.38)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 576)

  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(90, 430)
  ctx.bezierCurveTo(280, 410, 430, 300, 620, 230)
  ctx.bezierCurveTo(790, 165, 880, 150, 960, 120)
  ctx.stroke()

  ctx.fillStyle = '#1C1F24'
  ctx.fillRect(0, 500, 1024, 76)

  const dots = ['#3E7A52', '#C9A227', '#4A4E55']
  dots.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(72 + i * 30, 538, 7, 0, Math.PI * 2)
    ctx.fill()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
