import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useLoader } from '@react-three/fiber';
import { Float, Text, useGLTF } from '@react-three/drei';
import Points from './Points';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    
export function BlockStart({ position = [0, 0, 0], material }) {
    return (
        <group position={position}>
            <Float floatIntensity={0.25} rotationIntensity={0.25}>
                <Text
                    castShadow
                    fontSize={0.7}
                    font='./BebasNeue-Regular.ttf'
                    position={[0, 1.1, 0]}
                    scale={0.5}
                    textAlign='center'
                    rotation-y={-0.25}
                >
                    Racing Game
                    <meshBasicMaterial toneMapped={false} />
                </Text>
            </Float>
            <mesh geometry={boxGeometry} material={material} scale={[4, 0.2, 4]} receiveShadow position={[0, -0.1, 0]} />
        </group>
    )
}

// ... Export all other blocks the same way:
export function BlockSpinner({ position = [0, 0, 0], material }) {

    const color = useLoader(THREE.TextureLoader, './textures/wood/weathered_brown_planks_diff_1k.jpg');
    const arm = useLoader(THREE.TextureLoader, './textures/wood/weathered_brown_planks_arm_1k.jpg');
    const normal = useLoader(THREE.TextureLoader, './textures/wood/weathered_brown_planks_nor_gl_1k.jpg');

    // Configure texture repeat
    useMemo(() => {
        [color, arm, normal].forEach(tex => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
        });
    }, [color, arm, normal]);

    // Memoize the material
    const floorMaterial = useMemo(() => (
        new THREE.MeshStandardMaterial({
            map: color,
            aoMap: arm,
            normalMap: normal,
            roughnessMap: arm,
            metalnessMap: arm,
        })
    ), [color, arm, normal]);

    const obstacle = useRef()
    const [speed] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1))

    useFrame((state) => {
        const time = state.clock.elapsedTime
        const euler = new THREE.Euler(0, time * speed, 0);
        const quartenion = new THREE.Quaternion();
        quartenion.setFromEuler(euler)

        obstacle.current.setNextKinematicRotation(quartenion);
    })
    return <>
        <group position={position}>
            <mesh geometry={boxGeometry} material={material} scale={[4, 0.2, 4]} receiveShadow position={[0, -0.1, 0]} />
            <RigidBody ref={obstacle} type='kinematicPosition' position={[0, 0.3, 0]} restitution={0.2} friction={0}>
                <mesh geometry={boxGeometry} material={floorMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />
            </RigidBody>
            {[...Array(5)].map((_, i) => (
                <Points key={i} position={[-1, 0.2, i * -2]} />
            ))}

        </group>
    </>
}

export function BlockLimbo({ position = [0, 0, 0], material }) {

    const color = useLoader(THREE.TextureLoader, './textures/limbo/dry_riverbed_rock_diff_1k.jpg');
    const arm = useLoader(THREE.TextureLoader, './textures/limbo/dry_riverbed_rock_arm_1k.jpg');
    const normal = useLoader(THREE.TextureLoader, './textures/limbo/dry_riverbed_rock_nor_gl_1k.jpg');

    // Configure texture repeat
    useMemo(() => {
        [color, arm, normal].forEach(tex => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
        });
    }, [color, arm, normal]);

    // Memoize the material
    const floorMaterial = useMemo(() => (
        new THREE.MeshStandardMaterial({
            map: color,
            aoMap: arm,
            normalMap: normal,
            roughnessMap: arm,
            metalnessMap: arm,
        })
    ), [color, arm, normal]);

    const obstacle = useRef()
    const [timeOffset] = useState(() => Math.random() * (Math.PI * 2))

    useFrame((state) => {
        const time = state.clock.elapsedTime

        const y = Math.sin(time + timeOffset) + 1.15

        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] })
    })
    return <>
        <group position={position}>
            <mesh geometry={boxGeometry} material={material} scale={[4, 0.2, 4]} receiveShadow position={[0, -0.1, 0]} />
            <RigidBody ref={obstacle} type='kinematicPosition' position={[0, 0.3, 0]} restitution={0.2} friction={0}>
                <mesh geometry={boxGeometry} material={floorMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />
            </RigidBody>
            {[...Array(5)].map((_, i) => (
                <Points key={i} position={[1, 0.2, i * -2]} />
            ))}

        </group>
    </>
}

export function BlockAxe({ position = [0, 0, 0], material }) {

    const axe = useGLTF('/textures/brick/axe.glb')

    // const color = useLoader(THREE.TextureLoader, './textures/brick/granite_tile_diff_1k.jpg');
    // const arm = useLoader(THREE.TextureLoader, './textures/brick/granite_tile_arm_1k.jpg');
    // const normal = useLoader(THREE.TextureLoader, './textures/brick/granite_tile_nor_gl_1k.jpg');

    // Configure texture repeat
    // useMemo(() => {
    //     [color, arm, normal].forEach(tex => {
    //         tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    //         tex.repeat.set(1, 1);
    //     });
    // }, [color, arm, normal]);

    // Memoize the material
    // const floorMaterial = useMemo(() => (
    //     new THREE.MeshStandardMaterial({
    //         map: color,
    //         aoMap: arm,
    //         normalMap: normal,
    //         roughnessMap: arm,
    //         metalnessMap: arm,
    //     })
    // ), [color, arm, normal]);

    const obstacle = useRef()
    const [timeOffset] = useState(() => Math.random() * (Math.PI * 2))

    useFrame((state) => {
        const time = state.clock.elapsedTime

        const x = Math.sin(time + timeOffset) * 1.25

        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] })
    })
    useEffect(() => {
        axe.scene.position.set(0, 1, 0); // fix model position relative to physics body
    }, [axe])

    return <>
        <group position={position}>
            <mesh geometry={boxGeometry} material={material} scale={[4, 0.2, 4]} receiveShadow position={[0, -0.1, 0]} />
            <RigidBody
                castShadow
                ref={obstacle}
                colliders="hull"
                type="kinematicPosition"
                position={[0, 0.75, 0]} // match visual height
                restitution={0.2}
                friction={0}
                userData={{ type: "axe" }}
            >
                <primitive object={axe.scene} scale={3} rotation-x={Math.PI} />
            </RigidBody>
            {[...Array(5)].map((_, i) => (
                <Points key={i} position={[0, 0.2, i * -2]} />
            ))}

        </group>
    </>
}

export function BlockAxe2({ position = [0, 0, 0], material }) {

    const color = useLoader(THREE.TextureLoader, './textures/brick/granite_tile_diff_1k.jpg');
    const arm = useLoader(THREE.TextureLoader, './textures/brick/granite_tile_arm_1k.jpg');
    const normal = useLoader(THREE.TextureLoader, './textures/brick/granite_tile_nor_gl_1k.jpg');

    // Configure texture repeat
    useMemo(() => {
        [color, arm, normal].forEach(tex => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
        });
    }, [color, arm, normal]);

    // Memoize the material
    const floorMaterial = useMemo(() => (
        new THREE.MeshStandardMaterial({
            map: color,
            aoMap: arm,
            normalMap: normal,
            roughnessMap: arm,
            metalnessMap: arm,
        })
    ), [color, arm, normal]);

    const obstacle = useRef()
    const [timeOffset] = useState(() => Math.random() * (Math.PI * 2))

    useFrame((state) => {
        const time = state.clock.elapsedTime

        const x = Math.sin(time + timeOffset) * 1.25

        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] })
    })
    return <>
        <group position={position}>
            <mesh geometry={boxGeometry} material={material} scale={[4, 0.2, 4]} receiveShadow position={[0, -0.1, 0]} />
            <RigidBody ref={obstacle} type='kinematicPosition' position={[0, 0.3, 0]} restitution={0.2} friction={0}>
                <mesh geometry={boxGeometry} material={floorMaterial} scale={[1.5, 1.5, 0.3]} castShadow receiveShadow />
            </RigidBody>
            {[...Array(5)].map((_, i) => (
                <Points key={i} position={[-1, 0.2, i * -2]} />
            ))}

        </group>
    </>
}

export function BlockEnd({ position = [0, 0, 0], material }) {

    const burger = useGLTF('./hamburger.glb')
    burger.scene.children.forEach((mesh) => {
        mesh.castShadow = true
    })
    return <>
        <group position={position}>
            <Text
                font='./BebasNeue-Regular.ttf'
                position={[0, 1.5, 2]}
                scale={1}>
                Finish
                <meshBasicMaterial />
            </Text>
            <mesh geometry={boxGeometry} material={material} scale={[4, 0.2, 4]} receiveShadow position={[0, 0, 0]} />
            <RigidBody type='fixed' colliders='hull' position={[0, 0.25, 0]} restitution={0.2} friction={0}>
                <primitive object={burger.scene} scale={0.15} />
            </RigidBody>
        </group>
    </>
}