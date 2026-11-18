import * as THREE from 'three'

export function finishExtrude(shape, depth, bevel = 0.02) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 24,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.rotateY(-Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

function extrudeXZ(shape, depth, bevel = 0.016) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 20,
  })
  geometry.rotateX(Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

/** Side silhouette in (z, y) with +z forward. */
export function createBodyShape(doorHole = false) {
  const shape = new THREE.Shape()
  shape.moveTo(2.34, 0.33)
  shape.lineTo(2.38, 0.52)
  shape.lineTo(2.36, 0.96)
  shape.lineTo(2.2, 1.05)
  shape.lineTo(1.22, 1.14)
  shape.quadraticCurveTo(0.88, 1.4, 0.5, 1.61)
  shape.lineTo(-1.02, 1.635)
  shape.quadraticCurveTo(-1.38, 1.56, -1.68, 1.38)
  shape.quadraticCurveTo(-2.02, 1.2, -2.2, 1.13)
  shape.lineTo(-2.34, 1.1)
  shape.lineTo(-2.38, 0.96)
  shape.lineTo(-2.36, 0.52)
  shape.lineTo(-2.32, 0.33)
  shape.lineTo(2.34, 0.33)
  shape.closePath()

  if (doorHole) {
    const hole = new THREE.Path()
    hole.moveTo(1.04, 0.48)
    hole.lineTo(1.04, 1.5)
    hole.lineTo(-0.12, 1.5)
    hole.lineTo(-0.12, 0.48)
    hole.closePath()
    shape.holes.push(hole)
  }

  return shape
}

export function createHoodGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.88, 1.14)
  shape.lineTo(0.88, 1.14)
  shape.lineTo(0.82, 2.22)
  shape.lineTo(-0.82, 2.22)
  shape.closePath()
  const geometry = extrudeXZ(shape, 0.07, 0.02)
  geometry.translate(0, 1.09, 0)
  return geometry
}

export function createRoofGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.84, 0.46)
  shape.lineTo(0.84, 0.46)
  shape.lineTo(0.8, -1.52)
  shape.lineTo(-0.8, -1.52)
  shape.closePath()

  const glass = new THREE.Path()
  glass.moveTo(-0.64, 0.26)
  glass.lineTo(0.64, 0.26)
  glass.lineTo(0.6, -1.36)
  glass.lineTo(-0.6, -1.36)
  glass.closePath()
  shape.holes.push(glass)

  const geometry = extrudeXZ(shape, 0.048, 0.012)
  geometry.translate(0, 1.63, 0)
  return geometry
}

export function createRoofGlassGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.62, 0.24)
  shape.lineTo(0.62, 0.24)
  shape.lineTo(0.58, -1.34)
  shape.lineTo(-0.58, -1.34)
  shape.closePath()
  const geometry = extrudeXZ(shape, 0.02, 0.004)
  geometry.translate(0, 1.638, 0)
  return geometry
}

export function createTrunkGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.82, -1.68)
  shape.lineTo(0.82, -1.68)
  shape.lineTo(0.78, -2.28)
  shape.lineTo(-0.78, -2.28)
  shape.closePath()
  const geometry = extrudeXZ(shape, 0.068, 0.016)
  geometry.translate(0, 1.125, 0)
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
