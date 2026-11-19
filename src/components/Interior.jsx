import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { makeScreenTexture } from '../geometries.js'
import { COLORS } from '../theme.js'

function Leather({ roughness = 0.55 }) {
  return (
    <meshPhysicalMaterial
      color={COLORS.leather}
      roughness={roughness}
      metalness={0.04}
      clearcoat={0.22}
      clearcoatRoughness={0.42}
    />
  )
}

function BucketSeat({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.5, 0.12, 0.52]} radius={0.045} position={[0, 0.56, 0.02]} castShadow>
        <Leather />
      </RoundedBox>
      <RoundedBox
        args={[0.5, 0.58, 0.12]}
        radius={0.045}
        position={[0, 0.9, -0.23]}
        rotation={[-0.12, 0, 0]}
        castShadow
      >
        <Leather />
      </RoundedBox>
      <RoundedBox args={[0.32, 0.1, 0.09]} radius={0.03} position={[0, 1.22, -0.25]} castShadow>
        <Leather roughness={0.5} />
      </RoundedBox>
      <mesh position={[0.21, 0.57, 0.08]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.05, 0.018, 0.28]} />
        <meshStandardMaterial color={COLORS.leatherDark} roughness={0.6} />
      </mesh>
    </group>
  )
}

function SteeringWheel() {
  return (
    <group position={[0.38, 0.9, 0.7]} rotation={[0.36, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.165, 0.018, 12, 40]} />
        <meshPhysicalMaterial color={COLORS.leather} roughness={0.45} clearcoat={0.3} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.22, 0.016, 0.028]} />
        <meshPhysicalMaterial color={COLORS.leatherDark} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.07, 0]} rotation={[0, 0, 0.34]}>
        <boxGeometry args={[0.028, 0.12, 0.022]} />
        <meshPhysicalMaterial color={COLORS.leatherDark} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.07, 0]} rotation={[0, 0, -0.34]}>
        <boxGeometry args={[0.028, 0.12, 0.022]} />
        <meshPhysicalMaterial color={COLORS.leatherDark} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.055, 24]} />
        <meshPhysicalMaterial color={COLORS.leatherDark} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.028, 0.0045, 8, 28]} />
        <meshStandardMaterial
          color={COLORS.gold}
          emissive={COLORS.gold}
          emissiveIntensity={1.7}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}

export default function Interior() {
  const screenMap = useMemo(() => makeScreenTexture(), [])

  return (
    <group>
      <mesh position={[0, 0.36, -0.12]} receiveShadow>
        <boxGeometry args={[1.7, 0.04, 2.75]} />
        <meshStandardMaterial color="#6F6A64" roughness={0.85} />
      </mesh>

      <RoundedBox args={[1.72, 0.44, 0.44]} radius={0.045} position={[0, 0.92, 0.96]} receiveShadow>
        <meshStandardMaterial color={COLORS.cabin} roughness={0.62} />
      </RoundedBox>
      <mesh position={[0, 0.99, 0.78]}>
        <boxGeometry args={[1.64, 0.042, 0.1]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.78, 0.76]}>
        <boxGeometry args={[1.52, 0.014, 0.038]} />
        <meshStandardMaterial color={COLORS.amber} emissive={COLORS.amber} emissiveIntensity={0.58} />
      </mesh>

      <mesh position={[0, 1.13, 0.76]} castShadow>
        <boxGeometry args={[0.56, 0.33, 0.028]} />
        <meshStandardMaterial color="#111214" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.13, 0.778]}>
        <planeGeometry args={[0.52, 0.29]} />
        <meshBasicMaterial map={screenMap} toneMapped={false} />
      </mesh>

      <RoundedBox args={[0.34, 0.28, 0.72]} radius={0.03} position={[0, 0.58, 0.2]}>
        <meshStandardMaterial color="#8C8680" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.08, 0.44]} radius={0.03} position={[0, 0.74, 0.06]}>
        <meshPhysicalMaterial color={COLORS.leather} roughness={0.5} />
      </RoundedBox>
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
          <meshStandardMaterial color="#4A4743" roughness={0.4} />
        </mesh>
      ))}

      <SteeringWheel />
      <BucketSeat position={[0.38, 0, 0.1]} />
      <BucketSeat position={[-0.38, 0, 0.1]} />

      <RoundedBox args={[1.14, 0.12, 0.5]} radius={0.04} position={[0, 0.56, -0.94]} castShadow>
        <Leather />
      </RoundedBox>
      <RoundedBox
        args={[1.14, 0.46, 0.12]}
        radius={0.04}
        position={[0, 0.82, -1.14]}
        rotation={[-0.08, 0, 0]}
        castShadow
      >
        <Leather />
      </RoundedBox>

      <mesh position={[0, 1.5, -0.18]} rotation={[0.015, 0, 0]}>
        <boxGeometry args={[1.36, 0.024, 1.55]} />
        <meshStandardMaterial color="#2C3034" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.38, 0.5]}>
        <boxGeometry args={[0.16, 0.035, 0.07]} />
        <meshStandardMaterial color="#2A2C2E" roughness={0.35} />
      </mesh>

      <pointLight position={[0.72, 0.5, 0.32]} color={COLORS.amber} intensity={1.05} distance={1.8} />
      <pointLight position={[-0.72, 0.5, 0.32]} color={COLORS.amber} intensity={0.65} distance={1.8} />
      <pointLight position={[0, 1.15, 0.18]} color="#FFF6E8" intensity={0.32} distance={2.4} />
    </group>
  )
}
