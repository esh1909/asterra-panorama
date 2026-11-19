import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { COLORS, PAINT } from '../theme.js'
import { createFrontDoorGlassGeometry, createRearDoorGlassGeometry } from '../geometries.js'

function PaintMaterial() {
  return <meshPhysicalMaterial {...PAINT} />
}

function DoorMeshes({ length, hasMirror, row = 'front' }) {
  const panelH = 0.58
  const panelY = 0.8
  const glassGeom = useMemo(
    () => (row === 'front' ? createFrontDoorGlassGeometry() : createRearDoorGlassGeometry()),
    [row],
  )

  return (
    <>
      <mesh position={[0.035, panelY, -length / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.07, panelH, length]} />
        <PaintMaterial />
      </mesh>
      <mesh position={[0.038, 0.5, -length / 2]} castShadow>
        <boxGeometry args={[0.078, 0.22, length + 0.02]} />
        <meshStandardMaterial color={COLORS.cladding} roughness={0.75} metalness={0.22} />
      </mesh>

      <mesh geometry={glassGeom}>
        <meshPhysicalMaterial
          color="#d7e3e8"
          metalness={0}
          roughness={0.04}
          transmission={0.94}
          thickness={0.03}
          ior={1.5}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.078, 0.98, -length + 0.32]} castShadow>
        <boxGeometry args={[0.016, 0.024, 0.15]} />
        <meshStandardMaterial color="#2E3236" metalness={0.62} roughness={0.32} />
      </mesh>

      {hasMirror && (
        <group position={[0.09, 1.2, -0.14]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.045, 0.07]} />
            <meshStandardMaterial color={COLORS.cladding} roughness={0.5} />
          </mesh>
          <mesh position={[0.12, 0.02, 0]} rotation={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.2, 0.11, 0.08]} />
            <PaintMaterial />
          </mesh>
          <mesh position={[0.15, 0.022, -0.046]} rotation={[0, 0.2, 0]}>
            <planeGeometry args={[0.18, 0.09]} />
            <meshStandardMaterial color="#c5d0d6" metalness={0.92} roughness={0.08} />
          </mesh>
        </group>
      )}

      <mesh position={[-0.02, panelY, -length / 2]} receiveShadow>
        <boxGeometry args={[0.048, panelH, length - 0.04]} />
        <meshStandardMaterial color={COLORS.cabin} roughness={0.65} />
      </mesh>
      <mesh position={[-0.012, 1.0, -length / 2]}>
        <boxGeometry args={[0.028, 0.032, length - 0.16]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.38} />
      </mesh>
      <mesh position={[-0.03, 0.58, -length / 2 + 0.08]}>
        <boxGeometry args={[0.018, 0.14, length * 0.5]} />
        <meshStandardMaterial color={COLORS.amber} emissive={COLORS.amber} emissiveIntensity={0.5} />
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
  const length = row === 'front' ? 1.16 : 1.0
  const hingeZ = row === 'front' ? 1.06 : -0.1
  const hingeX = 0.92 * side

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
          <DoorMeshes length={length} hasMirror={row === 'front'} row={row} />
        </group>
      </group>
    </group>
  )
}

export default function DriverDoor({ isOpen, onToggle }) {
  return <DoorUnit side={1} row="front" interactive isOpen={isOpen} onToggle={onToggle} />
}
