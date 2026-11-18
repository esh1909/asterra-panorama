import { useRef, useState } from 'react'
import HUD from './components/HUD.jsx'
import Scene from './components/Scene.jsx'

export default function App() {
  const [doorOpen, setDoorOpen] = useState(false)
  const cameraApi = useRef(null)

  return (
    <>
      <Scene
        doorOpen={doorOpen}
        onToggleDoor={() => setDoorOpen((open) => !open)}
        cameraApi={cameraApi}
      />
      <HUD
        doorOpen={doorOpen}
        onToggleDoor={() => setDoorOpen((open) => !open)}
        onResetCamera={() => cameraApi.current?.reset()}
      />
    </>
  )
}
