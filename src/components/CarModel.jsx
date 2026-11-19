import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import {
  createAPillarGeometry,
  createArchCladding,
  createBacklightGeometry,
  createCPillarGeometry,
  createDeckGeometry,
  createFrontDloGlass,
  createGreenhouseHalf,
  createHoodGeometry,
  createParametricHalf,
  createRearDloGlass,
  createRoofFrameGeometry,
  createRoofGlassGeometry,
  createWindshieldGeometry,
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

function ClearGlass() {
  return (
    <meshPhysicalMaterial
      color="#d7e3e8"
      metalness={0}
      roughness={0.04}
      transmission={0.94}
      thickness={0.035}
      ior={1.5}
      transparent
      opacity={1}
      envMapIntensity={1.1}
      side={THREE.DoubleSide}
    />
  )
}

function Wheel({ position, side = 1 }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[DIM.wheelR, DIM.wheelR, DIM.wheelW, 64]} />
        <meshStandardMaterial color={COLORS.tread} roughness={0.94} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[DIM.wheelR * 0.78, DIM.wheelR * 0.78, DIM.wheelW * 0.72, 48]} />
        <meshStandardMaterial color="#1A1C1E" roughness={0.82} />
      </mesh>
      <mesh position={[side * (DIM.wheelW * 0.5 + 0.008), 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 48]} />
        <meshStandardMaterial color={COLORS.hub} metalness={0.32} roughness={0.46} />
      </mesh>
      <mesh position={[side * (DIM.wheelW * 0.5 + 0.026), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.078, 0.078, 0.01, 32]} />
        <meshStandardMaterial color={COLORS.hubRing} metalness={0.35} roughness={0.4} />
      </mesh>
    </group>
  )
}

function WheelArch({ side, z, geometry }) {
  return (
    <mesh
      geometry={geometry}
      position={[side * 0.91, DIM.wheelR, z]}
      scale={[side > 0 ? -1 : 1, 1, 1]}
      castShadow
    >
      <CladdingMaterial />
    </mesh>
  )
}

function Badge({ side }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.1, 0.045)
    shape.lineTo(0.1, -0.045)
    shape.closePath()
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false })
    geom.computeVertexNormals()
    return geom
  }, [])

  return (
    <mesh
      geometry={geometry}
      position={[side * 0.95, 0.76, 0.84]}
      rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <meshStandardMaterial color="#141516" roughness={0.45} metalness={0.2} />
    </mesh>
  )
}

function PixelCluster({ x, y, z, color, intensity }) {
  return (
    <group position={[x, y, z]}>
      {[-1, 1].map((col) =>
        [-1, 1].map((row) => (
          <mesh key={`${col}-${row}`} position={[col * 0.036, row * 0.03, 0]}>
            <boxGeometry args={[0.048, 0.024, 0.012]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
          </mesh>
        )),
      )}
    </group>
  )
}

function FrontFascia() {
  return (
    <group position={[0, 0, 2.2]}>
      <mesh position={[0, 0.68, 0.01]} castShadow>
        <boxGeometry args={[1.76, 0.66, 0.06]} />
        <PaintMaterial />
      </mesh>
      <RoundedBox args={[1.5, 0.22, 0.036]} radius={0.01} position={[0, 0.86, 0.05]}>
        <meshStandardMaterial color="#101112" roughness={0.46} />
      </RoundedBox>
      <mesh position={[0, 0.86, 0.072]}>
        <boxGeometry args={[0.9, 0.015, 0.01]} />
        <meshStandardMaterial color={COLORS.led} emissive={COLORS.led} emissiveIntensity={6.4} />
      </mesh>
      <PixelCluster x={-0.56} y={0.86} z={0.074} color={COLORS.led} intensity={5.4} />
      <PixelCluster x={0.56} y={0.86} z={0.074} color={COLORS.led} intensity={5.4} />
      <mesh position={[0, 0.56, 0.05]}>
        <boxGeometry args={[0.6, 0.09, 0.02]} />
        <meshStandardMaterial color="#0C0D0E" roughness={0.72} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`fog-${side}`} position={[side * 0.64, 0.5, 0.055]}>
          <mesh>
            <boxGeometry args={[0.044, 0.15, 0.02]} />
            <CladdingMaterial />
          </mesh>
          {[0.046, 0, -0.046].map((y) => (
            <mesh key={y} position={[0, y, 0.014]}>
              <sphereGeometry args={[0.01, 12, 12]} />
              <meshStandardMaterial color={COLORS.led} emissive={COLORS.led} emissiveIntensity={3.5} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.28, 0.02]} castShadow>
        <boxGeometry args={[1.78, 0.14, 0.14]} />
        <CladdingMaterial />
      </mesh>
      <mesh position={[0, 0.21, 0.08]} castShadow>
        <boxGeometry args={[0.56, 0.016, 0.1]} />
        <meshStandardMaterial color={COLORS.silver} metalness={0.85} roughness={0.28} />
      </mesh>
    </group>
  )
}

function RearFascia() {
  return (
    <group position={[0, 0, -2.12]}>
      <RoundedBox args={[1.58, 0.22, 0.08]} radius={0.014} position={[0, 0.86, -0.04]}>
        <meshStandardMaterial color="#121314" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.88, -0.09]}>
        <boxGeometry args={[1.0, 0.02, 0.012]} />
        <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={4.2} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.68, 0.84, -0.09]}>
            <boxGeometry args={[0.032, 0.14, 0.012]} />
            <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={3.8} />
          </mesh>
          <PixelCluster x={side * 0.6} y={0.84} z={-0.09} color={COLORS.tail} intensity={3.4} />
        </group>
      ))}
      <mesh position={[0, 0.56, -0.06]}>
        <boxGeometry args={[0.36, 0.12, 0.03]} />
        <meshStandardMaterial color="#151618" roughness={0.6} />
      </mesh>
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, 0.48, -0.1]}>
          <boxGeometry args={[0.18, 0.014, 0.01]} />
          <meshStandardMaterial color={COLORS.tail} emissive={COLORS.tail} emissiveIntensity={3.1} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[1.7, 0.14, 0.16]} />
        <CladdingMaterial />
      </mesh>
      <mesh position={[0, 0.24, -0.08]} castShadow>
        <boxGeometry args={[0.52, 0.018, 0.1]} />
        <meshStandardMaterial color={COLORS.silver} metalness={0.85} roughness={0.28} />
      </mesh>
    </group>
  )
}

export default function CarModel({ doorOpen, onToggleDoor }) {
  const driverHalf = useMemo(() => createParametricHalf(true), [])
  const passengerHalf = useMemo(() => createParametricHalf(false), [])
  const greenhouse = useMemo(() => createGreenhouseHalf(), [])
  const hood = useMemo(() => createHoodGeometry(), [])
  const deck = useMemo(() => createDeckGeometry(), [])
  const aPillar = useMemo(() => createAPillarGeometry(), [])
  const cPillar = useMemo(() => createCPillarGeometry(), [])
  const roofGlass = useMemo(() => createRoofGlassGeometry(), [])
  const roofFrame = useMemo(() => createRoofFrameGeometry(), [])
  const windshield = useMemo(() => createWindshieldGeometry(), [])
  const backlight = useMemo(() => createBacklightGeometry(), [])
  const frontDlo = useMemo(() => createFrontDloGlass(), [])
  const rearDlo = useMemo(() => createRearDloGlass(), [])
  const arch = useMemo(() => createArchCladding(), [])

  return (
    <group>
      <mesh geometry={driverHalf} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={passengerHalf} scale={[-1, 1, 1]} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>

      <mesh geometry={hood} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={deck} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={greenhouse} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={greenhouse} scale={[-1, 1, 1]} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={aPillar} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={aPillar} scale={[-1, 1, 1]} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={cPillar} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh geometry={cPillar} scale={[-1, 1, 1]} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      <mesh position={[0, 1.148, 1.07]} castShadow receiveShadow>
        <boxGeometry args={[1.64, 0.055, 0.3]} />
        <PaintMaterial />
      </mesh>
      <mesh position={[0, 1.675, 0.5]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.12]} />
        <PaintMaterial />
      </mesh>
      <mesh position={[0, 1.675, -0.96]} castShadow>
        <boxGeometry args={[1.56, 0.05, 0.12]} />
        <PaintMaterial />
      </mesh>
      <mesh geometry={roofFrame} castShadow receiveShadow>
        <PaintMaterial />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`bpillar-${side}`} position={[side * 0.86, 1.36, -0.06]}>
          <boxGeometry args={[0.035, 0.42, 0.05]} />
          <meshStandardMaterial color={COLORS.dlo} roughness={0.5} />
        </mesh>
      ))}

      <mesh geometry={windshield}>
        <ClearGlass />
      </mesh>
      <mesh geometry={backlight}>
        <ClearGlass />
      </mesh>
      <mesh geometry={frontDlo}>
        <ClearGlass />
      </mesh>
      <mesh geometry={frontDlo} scale={[-1, 1, 1]}>
        <ClearGlass />
      </mesh>
      <mesh geometry={rearDlo}>
        <ClearGlass />
      </mesh>
      <mesh geometry={rearDlo} scale={[-1, 1, 1]}>
        <ClearGlass />
      </mesh>
      <mesh geometry={roofGlass}>
        <meshPhysicalMaterial
          color={COLORS.glassRoof}
          metalness={0}
          roughness={0.12}
          transmission={0.55}
          thickness={0.04}
          ior={1.5}
          transparent
          opacity={1}
          envMapIntensity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.32, 0]} receiveShadow>
        <boxGeometry args={[1.76, 0.16, 1.52]} />
        <CladdingMaterial />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={`fender-blend-${side}`} position={[side * 0.9, 0.72, 1.92]} castShadow>
          <boxGeometry args={[0.16, 0.48, 0.38]} />
          <PaintMaterial />
        </mesh>
      ))}
      <WheelArch side={1} z={DIM.wheelZ} geometry={arch} />
      <WheelArch side={-1} z={DIM.wheelZ} geometry={arch} />
      <WheelArch side={1} z={-DIM.wheelZ} geometry={arch} />
      <WheelArch side={-1} z={-DIM.wheelZ} geometry={arch} />
      <Badge side={1} />
      <Badge side={-1} />

      <FrontFascia />
      <RearFascia />
      <Interior />

      <DriverDoor isOpen={doorOpen} onToggle={onToggleDoor} />
      <DoorUnit side={-1} row="front" />
      <DoorUnit side={1} row="rear" />
      <DoorUnit side={-1} row="rear" />

      <mesh position={[-0.9, 0.9, -1.96]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.012, 20]} />
        <meshStandardMaterial color="#2A2C2E" metalness={0.4} roughness={0.4} />
      </mesh>

      <Wheel position={[DIM.track, DIM.wheelR, DIM.wheelZ]} side={1} />
      <Wheel position={[-DIM.track, DIM.wheelR, DIM.wheelZ]} side={-1} />
      <Wheel position={[DIM.track, DIM.wheelR, -DIM.wheelZ]} side={1} />
      <Wheel position={[-DIM.track, DIM.wheelR, -DIM.wheelZ]} side={-1} />
    </group>
  )
}
