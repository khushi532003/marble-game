import { useGLTF, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import useGame from '../stores/useGame'
import { useControls } from 'leva'

function Player2() {
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const body = useRef()
  const { rapier, world } = useRapier()
  const rapierWorld = world
  const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10))
  const [smoothCameraTarget] = useState(() => new THREE.Vector3())

  // Load player model
  const player = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/korrigan-hat/model.gltf')
  const mixerRef = useRef()

  // Leva start position controls
  const { x, y, z } = useControls('Player Start Position', {
    x: { value: 0, min: -10, max: 10, step: 0.1 },
    y: { value: 3, min: 0, max: 10, step: 0.1 },
    z: { value: 0, min: -10, max: 10, step: 0.1 }
  })

  const start = useGame((state) => state.start)
  const end = useGame((state) => state.end)
  const restart = useGame((state) => state.restart)
  const blocksCount = useGame((state) => state.blocksCount)

  const [hitSound] = useState(() => new Audio('./hit.mp3'))
  const [bgMusic] = useState(() => new Audio('./backgroundMusic.mp3'))
  const [winSound] = useState(() => new Audio('./win.mp3'))

  const jump = () => {
    const origin = body.current.translation()
    origin.y -= 2  // Ray starts a little below the player to check for ground collision
    const direction = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(origin, direction)
    const hit = rapierWorld.castRay(ray, 10, true)  // Cast a ray downwards to detect the ground
  
    if (hit?.timeOfImpact < 0.15) {  // If we're close to the ground, allow jump
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })  // Apply upward impulse
    }
  }
  
  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0 }, true)
    body.current.setLinvel({ x: 0, y: 0, z: 0 })
    body.current.setAngvel({ x: 0, y: 0, z: 0 })
  }

  useEffect(() => {
    // Play animation
    if (player.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(player.scene)
      mixer.clipAction(player.animations[0]).play()
      mixerRef.current = mixer
    }

    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === 'ready') {
          reset()
        }
      }
    )

    const unsubscribgBgMusic = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === 'playing') {
          bgMusic.currentTime = 0
          bgMusic.play()
        } else if (value === 'ready') {
          bgMusic.pause()
        }
      }
    )

    const unsubscribeWinSound = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === 'ended') {
          winSound.currentTime = 0
          winSound.play()
        } else if (value === 'ready' || value === 'playing') {
          winSound.pause()
        }
      }
    )

    const unsubscribeJump = subscribeKeys(
        (state) => state.jump,
        (value) => {
          if (value === true) {
            jump()
          }
        }
      )

    const unsubscribeAny = subscribeKeys(() => {
      start()
    })

    return () => {
      unsubscribeWinSound()
      unsubscribgBgMusic()
      unsubscribeReset()
      unsubscribeJump()
      unsubscribeAny()
    }
  }, [])

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys()
    const impulse = { x: 0, y: 0, z: 0 }
    const impulseStrength = 0.2  // Apply a smaller impulse strength for smoother movement
  
    // Impulse based on keyboard movement
    if (forward) impulse.z -= impulseStrength
    if (backward) impulse.z += impulseStrength
    if (leftward) impulse.x -= impulseStrength
    if (rightward) impulse.x += impulseStrength
  
    // Apply the impulse to the body
    if (body.current) {
      body.current.applyImpulse(impulse)
    }
  
    // Camera follow
    const bodyPosition = body.current.translation()
    const cameraPosition = new THREE.Vector3()
    cameraPosition.copy(bodyPosition)
    cameraPosition.z += 2.25
    cameraPosition.y += 0.65
  
    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(bodyPosition)
    cameraTarget.y += 0.25
  
    smoothCameraPosition.lerp(cameraPosition, 5 * delta)
    smoothCameraTarget.lerp(cameraTarget, 5 * delta)
  
    state.camera.position.copy(smoothCameraPosition)
    state.camera.lookAt(smoothCameraTarget)
  
    // Animation mixer update
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  
    if (bodyPosition.z < -(blocksCount * 4 + 2)) end()
    if (bodyPosition.y < -4) restart()
  })
  

  const collisionEnter = () => {
    hitSound.currentTime = 0
    hitSound.volume = Math.random()
    hitSound.play()
  }

  return (
    <RigidBody
  ref={body}
  colliders="cuboid" // more appropriate for humanoid shape
  lockRotations // ✅ prevents spinning
  restitution={0.2}
  position={[x, y, z]}
  friction={1}
  canSleep={false}
  linearDamping={0.5}
  angularDamping={0.5}
  onCollisionEnter={collisionEnter}
>
  <primitive object={player.scene} rotation-y={Math.PI} scale={1.5} />
</RigidBody>

  )
}

export default Player2
