import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react'

function Spinner() {
  const spin = useRef();


  return (
    <>
      <mesh ref={spin} type='kinematicPosition' scale={[0.2, 0.2, 2]} position-y={0.1}>
        <boxGeometry />
        <meshStandardMaterial color={'red'} />
      </mesh>
    </>
  )
}

export default Spinner;