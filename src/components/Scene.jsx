import { useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, MeshReflectorMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { COLORS } from '../theme.js'
import CarModel from './CarModel.jsx'

const INITIAL_CAMERA = [4.55, 1.9, 5.2]
const INITIAL_TARGET = [0, 0.72, 0]

function CameraRig({ cameraApi }) {
  const { camera } = useThree()
  const controls = useRef(null)

  useLayoutEffect(() => {
    cameraApi.current = {
      reset() {
        camera.position.set(...INITIAL_CAMERA)
        if (controls.current) {
          controls.current.target.set(...INITIAL_TARGET)
          controls.current.update()
        }
      },
    }
  }, [camera, cameraApi])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={3.2}
      maxDistance={9.5}
      maxPolarAngle={Math.PI / 2 - 0.04}
      target={INITIAL_TARGET}
    />
  )
}

function StudioEnvironment() {
  const { gl, scene } = useThree()

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04)
    scene.environment = env.texture
    room.dispose()
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  return null
}

function Studio() {
  return (
    <>
      <color attach="background" args={[COLORS.studio]} />
      <fog attach="fog" args={[COLORS.studio, 14, 32]} />
      <hemisphereLight intensity={0.7} color="#f4f6f8" groundColor="#b8bcc2" />
      <ambientLight intensity={0.5} />
      <spotLight
        position={[6, 8, 6]}
        angle={0.45}
        penumbra={0.7}
        intensity={2.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight position={[-5, 5, -4]} angle={0.5} penumbra={0.8} intensity={1.4} color="#dfe6ee" />
      <directionalLight position={[4, 5, 4]} intensity={1.15} color="#fff7ea" />
      <directionalLight position={[-3, 4, 5]} intensity={0.7} color="#e8f0ff" />
      <StudioEnvironment />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={256}
          mixBlur={0.8}
          mixStrength={0.28}
          roughness={0.95}
          depthScale={0.6}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.4}
          color={COLORS.floor}
          metalness={0.08}
        />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.42} scale={10} blur={2.4} far={5} />
    </>
  )
}

export default function Scene({ doorOpen, onToggleDoor, cameraApi }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ position: INITIAL_CAMERA, fov: 32, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(COLORS.studio, 1)
        gl.toneMappingExposure = 1.18
      }}
    >
      <Studio />
      <CarModel doorOpen={doorOpen} onToggleDoor={onToggleDoor} />
      <CameraRig cameraApi={cameraApi} />
    </Canvas>
  )
}
