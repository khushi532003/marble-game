import { Canvas } from '@react-three/fiber'
import React, { Suspense, useState } from 'react'
import Experience from './components/Experience'
import { KeyboardControls } from '@react-three/drei'
import Interface from './components/Interface'
import Clouds from './components/Clouds'
import Loader from './components/Loader' 

function App() {
  const [loaded, setLoaded] = useState(false)

  const cameraSettings = {
    fov : 75,
    near : 0.1,
    far : 100,
    position : [1,2,5]
  }

  return (
    <>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
          { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
          { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
          { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <Canvas shadows camera={cameraSettings}>
          <Suspense fallback={null}>
            <Clouds />
            <Experience />
            <Loader onLoaded={() => setLoaded(true)} />
          </Suspense>
        </Canvas>

        {loaded && (
          <Suspense fallback={null}>
            <Interface />
          </Suspense>
        )}
      </KeyboardControls>
    </>
  )
}

export default App;