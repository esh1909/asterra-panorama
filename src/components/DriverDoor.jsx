import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { COLORS, PAINT } from '../theme.js'

function PaintMaterial() {
  return <meshPhysicalMaterial {...PAINT} />
}

function DoorMeshes({ length, hasMirror }) {
  const glassY = 1.24
  const glassH = 0.44
  const panelH = 0.68
  const panelY = 0.73

  return (
    <>
      <mesh position={[0.04, panelY, -length / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.072, panelH, length]} />
        <PaintMaterial />
      </mesh>
      <mesh position={[0.04, 0.5, -length / 2]} castShadow>
        <boxGeometry args={[0.082, 0.22, length + 0.02]} />
        <meshStandardMaterial color={COLORS.cladding} roughness={0.75} metalness={0.22} />
      </mesh>

      <mesh position={[0.046, glassY + glassH / 2 - 0.01, -length / 2]}>
        <boxGeometry args={[0.03, 0.032, length]} />
        <meshStandardMaterial color={COLORS.dlo} roughness={0.55} />
      </mesh>
      <mesh position={[0.046, glassY - glassH / 2 + 0.04, -length / 2]}>
        <boxGeometry args={[0.032, 0.036, length]} />
        <meshStandardMaterial color={COLORS.dlo} roughness={0.55} />
      </mesh>
      <mesh position={[0.046, glassY, -0.028]}>
        <boxGeometry args={[0.03, glassH, 0.05]} />
        <meshStandardMaterial color={COLORS.dlo} roughness={0.55} />
      </mesh>
      <mesh position={[0.046, glassY, -length + 0.038]}>
        <boxGeometry args={[0.03, glassH, 0.055]} />
        <meshStandardMaterial color={COLORS.dlo} roughness={0.55} />
      </mesh>
      <mesh position={[0.052, glassY, -length / 2]}>
        <boxGeometry args={[0.012, glassH - 0.05, length - 0.12]} />
        <meshPhysicalMaterial
          color={COLORS.glass}
          transparent
          opacity={0.28}
          roughness={0.05}
          metalness={0.12}
          envMapIntensity={1.4}
        />
      </mesh>

      <mesh position={[0.082, 0.98, -length + 0.3]} castShadow>
        <boxGeometry args={[0.018, 0.026, 0.155]} />
        <meshStandardMaterial color="#2E3236" metalness={0.62} roughness={0.32} />
      </mesh>

      {hasMirror && (
        <group position={[0.12, 1.14, -0.06]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.048, 0.075]} />
            <meshStandardMaterial color={COLORS.cladding} roughness={0.5} />
          </mesh>
          <mesh position={[0.125, 0.02, 0]} rotation={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.078]} />
            <PaintMaterial />
          </mesh>
          <mesh position={[0.125, 0.02, -0.042]} rotation={[0, 0.18, 0]}>
            <planeGeometry args={[0.15, 0.078]} />
            <meshStandardMaterial color="#c5d0d6" metalness={0.92} roughness={0.08} />
          </mesh>
        </group>
      )}

      <mesh position={[-0.018, panelY, -length / 2]} receiveShadow>
        <boxGeometry args={[0.05, panelH, length - 0.04]} />
        <meshStandardMaterial color={COLORS.cabin} roughness={0.65} />
      </mesh>
      <mesh position={[-0.01, 1.0, -length / 2]}>
        <boxGeometry args={[0.03, 0.034, length - 0.16]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.38} />
      </mesh>
      <mesh position={[-0.028, 0.58, -length / 2 + 0.08]}>
        <boxGeometry args={[0.02, 0.15, length * 0.52]} />
        <meshStandardMaterial color={COLORS.amber} emissive={COLORS.amber} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.038, 1.24, -length / 2]}>
        <boxGeometry args={[0.018, 0.38, length - 0.14]} />
        <meshPhysicalMaterial color="#d8e0e4" transparent opacity={0.18} roughness={0.08} />
      </mesh>
    </>
  )
}

export function DoorUnit({
  side = 1,
  row = 'front',
  interactive = false,
  isOpen = false,
  onToggle,
}) {
  const hinge = useRef()
  const length = row === 'front' ? 1.16 : 1.04
  const hingeZ = row === 'front' ? 1.04 : -0.13
  const hingeX = 0.935 * side

  useFrame((_, delta) => {
    if (!interactive || !hinge.current) return
    const target = isOpen ? -1.05 : 0
    easing.damp(hinge.current.rotation, 'y', target, 0.28, delta)
  })

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const handlers = interactive
    ? {
        onPointerDown: (event) => event.stopPropagation(),
        onClick: (event) => {
          event.stopPropagation()
          onToggle?.()
        },
        onPointerOver: (event) => {
          event.stopPropagation()
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          document.body.style.cursor = 'auto'
        },
      }
    : {}

  return (
    <group position={[hingeX, 0, hingeZ]}>
      <group ref={hinge} {...handlers}>
        <group scale={[side, 1, 1]}>
          <DoorMeshes length={length} hasMirror={row === 'front'} />
        </group>
      </group>
    </group>
  )
}

export default function DriverDoor({ isOpen, onToggle }) {
  return <DoorUnit side={1} row="front" interactive isOpen={isOpen} onToggle={onToggle} />
}
