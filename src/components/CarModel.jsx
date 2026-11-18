import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import {
  createBodyShape,
  createHoodGeometry,
  createRoofGeometry,
  createRoofGlassGeometry,
  createTrunkGeometry,
  finishExtrude,
} from '../geometries.js'
import { CLADDING, COLORS, DIM, PAINT } from '../theme.js'
import DriverDoor, { DoorUnit } from './DriverDoor.jsx'
import Interior from './Interior.jsx'

function PaintMaterial() {
  return <meshPhysicalMaterial {...PAINT} />
}

function CladdingMaterial() {
  return <meshStandardMaterial {...CLADDING} />
}

function GlassMaterial({ opacity = 0.24, color = COLORS.glass }) {
  return (
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={opacity}
      roughness={0.05}
      metalness={0.14}
      envMapIntensity={1.55}
    />
  )
}

function Wheel({ position, side = 1 }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[DIM.wheelR, DIM.wheelR, DIM.wheelW, 48]} />
        <meshStandardMaterial color={COLORS.tread} roughness={0.94} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.312, 0.098, 14, 40]} />
        <meshStandardMaterial color={COLORS.tire} roughness={0.88} />
      </mesh>
      {Array.from({ length: 18 }).map((_, index) => (
        <mesh key={index} rotation={[0, (index / 18) * Math.PI * 2, Math.PI / 2]}>
          <boxGeometry args={[0.02, DIM.wheelW + 0.012, 0.055]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[side * 0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.242, 0.242, 0.04, 48]} />
        <meshStandardMaterial color={COLORS.hub} metalness={0.38} roughness={0.4} />
      </mesh>
      <mesh position={[side * 0.132, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.092, 0.011, 10, 32]} />
        <meshStandardMaterial color={COLORS.hubRing} metalness={0.42} roughness={0.36} />
      </mesh>
      <mesh position={[side * 0.136, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.038, 0.038, 0.018, 24]} />
        <meshStandardMaterial color="#1B1D1F" roughness={0.42} />
      </mesh>
    </group>
  )
}

function WheelArch({ side, z }) {
  return (
    <group position={[side * 0.93, DIM.wheelR + 0.02, z]}>
      <mesh rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.5, 0.055, 10, 24, Math.PI]} />
        <CladdingMaterial />
      </mesh>
      <mesh position={[side * -0.12, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.42, 0.62]} />
        <meshStandardMaterial color="#151618" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Badge({ side }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.1, 0.046)
    shape.lineTo(0.1, -0.046)
    shape.closePath()
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false })
    geom.computeVertexNormals()
    return geom
  }, [])

  return (
    <mesh
      geometry={geometry}
      position={[side * 0.948, 0.72, 0.86]}
      rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <meshStandardMaterial color="#141516" roughness={0.45} metalness={0.2} />
    </mesh>
  )
}

function FrontFascia() {
  return (
    <group position={[0, 0, 2.24]}>
      <RoundedBox args={[1.8, 0.74, 0.3]} radius={0.045} position={[0, 0.75, 0]} castShadow receiveShadow>
        <PaintMaterial />
      </RoundedBox>
      <RoundedBox args={[1.72, 0.3, 0.08]} radius={0.02} position={[0, 0.84, 0.132]}>
        <meshStandardMaterial color="#121314" roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.84, 0.178]}>
        <boxGeometry args={[1.2, 0.028, 0.018]} />
        <meshStandardMaterial color={COLORS.led} emissive={COLORS.led} emissiveIntensity={4.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.72, 0.84, 0.178]}>
          {[0, 1].map((col) =>
            [0, 1].map((row) => (
              <mesh key={`${col}-${row}`} position={[side * col * 0.088, row === 1 ? 0.054 : -0.054, 0]}>
                <boxGeometry args={[0.068, 0.04, 0.02]} />
                <meshStandardMaterial color={COLORS.led} emissive={COLORS.led} emissiveIntensity={3.7} />
              </mesh>
            )),
          )}
        </group>
      ))}
      <mesh position={[0, 0.48, 0.1]}>
        <boxGeometry args={[0.74, 0.16, 0.1]} />
        <meshStandardMaterial color="#0E0F10" roughness={0.7} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`fog-${side}`} position={[side * 0.64, 0.46, 0.15]}>
          <mesh>
            <boxGeometry args={[0.078, 0.22, 0.04]} />
            <CladdingMaterial />
          </mesh>
          {[0.07, 0, -0.07].map((y) => (
            <mesh key={y} position={[0, y, 0.026]}>
              <sphereGeometry args={[0.014, 12, 12]} />
              <meshStandardMaterial color={COLORS.led} emissive={COLORS.led} emissiveIntensity={2.9} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.28, 0.04]} castShadow>
        <boxGeometry args={[0.72, 0.03, 0.16]} />
        <meshStandardMaterial color={COLORS.silver} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.38, -0.02]}>
        <boxGeometry args={[1.8, 0.16, 0.24]} />
        <CladdingMaterial />
      </mesh>
    </group>
  )
}

function RearFascia() {
  return (
    <group position={[0, 0, -2.26]}>
      <RoundedBox args={[1.78, 0.72, 0.28]} radius={0.045} position={[0, 0.75, 0]} castShadow receiveShadow>
        <PaintMaterial />
      </RoundedBox>
      <RoundedBox args={[1.7, 0.28, 0.07]} radius={0.02} position={[0, 0.9, -0.122]}>
        <meshStandardMaterial color="#121314" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.92, -0.162]}>
        <boxGeometry args={[1.24, 0.026, 0.016]} />
        <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={3.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.78, 0.9, -0.162]}>
            <boxGeometry args={[0.05, 0.18, 0.018]} />
            <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={3.5} />
          </mesh>
          {[0.06, -0.02].map((y, i) => (
            <mesh key={i} position={[side * 0.72, 0.9 + y, -0.162]}>
              <boxGeometry args={[0.08, 0.028, 0.016]} />
              <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={3.2} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.52, -0.12]}>
        <boxGeometry args={[0.38, 0.18, 0.04]} />
        <meshStandardMaterial color="#151618" roughness={0.6} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.44, -0.148]}>
          <boxGeometry args={[0.22, 0.02, 0.012]} />
          <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={2.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.78, 0.16, 0.24]} />
        <CladdingMaterial />
      </mesh>
      <mesh position={[0, 0.28, -0.04]} castShadow>
        <boxGeometry args={[0.7, 0.03, 0.16]} />
        <meshStandardMaterial color={COLORS.silver} metalness={0.85} roughness={0.28} />
      </mesh>
    </group>
  )
}

function GlassPanels() {
  return (
    <group>
      <mesh position={[0, 1.36, 0.84]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[1.48, 0.5, 0.03]} />
        <GlassMaterial opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.34, -1.58]} rotation={[-0.46, 0, 0]}>
        <boxGeometry args={[1.4, 0.46, 0.03]} />
        <GlassMaterial opacity={0.3} />
      </mesh>
    </group>
  )
}

export default function CarModel({ doorOpen, onToggleDoor }) {
  const leftSkin = useMemo(() => finishExtrude(createBodyShape(true), 0.074, 0.012), [])
  const rightSkin = useMemo(() => finishExtrude(createBodyShape(false), 0.074, 0.012), [])
  const hood = useMemo(() => createHoodGeometry(), [])
  const roof = useMemo(() => createRoofGeometry(), [])
  const roofGlass = useMemo(() => createRoofGlassGeometry(), [])
  const trunk = useMemo(() => createTrunkGeometry(), [])

  return (
    <group>
      <mesh geometry={leftSkin} position={[0.905, 0, 0]} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={rightSkin} position={[-0.905, 0, 0]} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={hood} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={roof} castShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={roofGlass}>
        <GlassMaterial opacity={0.34} color={COLORS.glassRoof} />
      </mesh>
      <mesh geometry={trunk} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>

      <mesh position={[0, 0.72, 1.56]} castShadow>
        <boxGeometry args={[1.74, 0.075, 0.86]} />
        <PaintMaterial />
      </mesh>
      <mesh position={[0, 0.74, -1.92]} castShadow>
        <boxGeometry args={[1.72, 0.09, 0.52]} />
        <PaintMaterial />
      </mesh>
      <mesh position={[0, 1.34, -0.32]}>
        <boxGeometry args={[1.64, 0.07, 2.08]} />
        <PaintMaterial />
      </mesh>

      <mesh position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[1.72, 0.08, 4.42]} />
        <CladdingMaterial />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`skirt-${side}`} position={[side * 0.91, 0.32, 0]} castShadow>
          <boxGeometry args={[0.08, 0.18, 1.52]} />
          <CladdingMaterial />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <mesh key={`bpillar-${side}`} position={[side * 0.93, 1.18, -0.14]}>
          <boxGeometry args={[0.06, 0.62, 0.1]} />
          <meshStandardMaterial color={COLORS.dlo} roughness={0.55} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`cpillar-${side}`} position={[side * 0.91, 1.22, -1.18]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.055, 0.55, 0.12]} />
          <meshStandardMaterial color={COLORS.dlo} roughness={0.55} />
        </mesh>
      ))}

      <WheelArch side={1} z={DIM.wheelZ} />
      <WheelArch side={-1} z={DIM.wheelZ} />
      <WheelArch side={1} z={-DIM.wheelZ} />
      <WheelArch side={-1} z={-DIM.wheelZ} />
      <Badge side={1} />
      <Badge side={-1} />

      <FrontFascia />
      <RearFascia />
      <GlassPanels />
      <Interior />

      <DriverDoor isOpen={doorOpen} onToggle={onToggleDoor} />
      <DoorUnit side={-1} row="front" />
      <DoorUnit side={1} row="rear" />
      <DoorUnit side={-1} row="rear" />

      <mesh position={[-0.94, 0.92, -2.08]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.012, 20]} />
        <meshStandardMaterial color="#2A2C2E" metalness={0.4} roughness={0.4} />
      </mesh>

      <Wheel position={[DIM.track, DIM.wheelR, DIM.wheelZ]} side={1} />
      <Wheel position={[-DIM.track, DIM.wheelR, DIM.wheelZ]} side={-1} />
      <Wheel position={[DIM.track, DIM.wheelR, -DIM.wheelZ]} side={1} />
      <Wheel position={[-DIM.track, DIM.wheelR, -DIM.wheelZ]} side={-1} />
    </group>
  )
}
