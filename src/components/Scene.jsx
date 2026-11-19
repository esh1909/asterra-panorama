import { useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, MeshReflectorMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { COLORS } from '../theme.js'
import { VIEWS } from '../views.js'
import CarModel from './CarModel.jsx'

const INITIAL_CAMERA = VIEWS.threeQuarter.pos
const INITIAL_TARGET = VIEWS.threeQuarter.target

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
      minPolarAngle={0.55}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
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
      <fog attach="fog" args={[COLORS.studio, 16, 36]} />
      <hemisphereLight intensity={1.15} color="#f7f8fa" groundColor="#c5c8cc" />
      <ambientLight intensity={0.72} />
      <spotLight
        position={[7, 9, 6]}
        angle={0.48}
        penumbra={0.75}
        intensity={3.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight position={[-6, 6, -3]} angle={0.55} penumbra={0.85} intensity={1.6} color="#e8eef4" />
      <directionalLight position={[5, 6, 4]} intensity={1.35} color="#fff8ee" />
      <directionalLight position={[-4, 5, 6]} intensity={0.85} color="#eef3ff" />
      <StudioEnvironment />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <MeshReflectorMaterial
          blur={[280, 70]}
          resolution={512}
          mixBlur={0.75}
          mixStrength={0.22}
          roughness={0.96}
          depthScale={0.5}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.4}
          color={COLORS.floor}
          metalness={0.06}
        />
      </mesh>
      <ContactShadows position={[0, 0.012, 0]} opacity={0.38} scale={11} blur={2.6} far={5.5} />
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
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ position: INITIAL_CAMERA, fov: VIEWS.threeQuarter.fov, near: 0.1, far: 60 }}
      onCreated={({ gl, scene, camera, size }) => {
        gl.setClearColor(COLORS.studio, 1)
        gl.toneMappingExposure = 1.32
        gl.setSize(size.width, size.height, false)
        window.__vega = {
          scene,
          camera,
          gl,
          setView(name) {
            const view = VIEWS[name]
            if (!view) return
            camera.up.set(0, 1, 0)
            camera.position.set(...view.pos)
            camera.fov = view.fov
            camera.lookAt(...view.target)
            camera.updateProjectionMatrix()
            gl.render(scene, camera)
          },
        }
      }}
    >
      <Studio />
      <CarModel doorOpen={doorOpen} onToggleDoor={onToggleDoor} />
      <CameraRig cameraApi={cameraApi} />
    </Canvas>
  )
}
