import React, { useMemo } from 'react'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useLoader } from '@react-three/fiber'
import { BlockAxe, BlockAxe2, BlockEnd, BlockLimbo, BlockSpinner, BlockStart } from './Blocks'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
function Bounds({ length = 1 }) {
    const colorWallTexture = useLoader(THREE.TextureLoader, './textures/wall/concrete_layers_02_diff_1k.jpg');
    const armWallTexture = useLoader(THREE.TextureLoader, './textures/wall/concrete_layers_02_arm_1k.jpg');
    const normalWallTexture = useLoader(THREE.TextureLoader, './textures/wall/concrete_layers_02_nor_gl_1k.jpg');

    useMemo(() => {
        colorWallTexture.wrapS = colorWallTexture.wrapT = THREE.RepeatWrapping;
        colorWallTexture.repeat.set(length, 1);
    }, [colorWallTexture, length]);

    const texturedMaterial = useMemo(() => (
        new THREE.MeshStandardMaterial({ map: colorWallTexture, aoMap: armWallTexture, normalMap: normalWallTexture, roughnessMap: armWallTexture, metalnessMap: armWallTexture })
    ), [colorWallTexture]);

    // Collision groups: Walls are in group 0 (0x00010000), collide with group 1 (player, 0x00020000)
    const collisionGroups = 0x00010002; // Group 0, collides with group 1

    return (
        <>
            <RigidBody
                type="fixed"
                restitution={0.2}
                friction={0}
                collisionGroups={collisionGroups}
            >
                <mesh
                    castShadow
                    geometry={boxGeometry}
                    material={texturedMaterial}
                    scale={[0.3, 2, 4 * length]}
                    receiveShadow
                    position={[2.15, 1, -(length * 2) + 2]}
                />
                <mesh
                    geometry={boxGeometry}
                    material={texturedMaterial}
                    scale={[0.3, 2, 4 * length]}
                    receiveShadow
                    position={[-2.15, 1, -(length * 2) + 2]}
                />
                <mesh
                    geometry={boxGeometry}
                    material={texturedMaterial}
                    scale={[4, 2, 0.3]}
                    receiveShadow
                    position={[0, 1, -(length * 4) + 2]}
                />
            </RigidBody>
            <CuboidCollider
                args={[2, 0.1, 2 * length]}
                position={[0, -0.1, -(length * 2) + 2]}
                restitution={0.2}
                friction={1}
            />
        </>
    );
}

export function Level({ count = 5, types = [BlockSpinner, BlockAxe, BlockAxe2, BlockLimbo], seed = 0 }) {

    const color = useLoader(THREE.TextureLoader, './textures/floor/rocky_terrain_02_diff_1k.jpg');
    const arm = useLoader(THREE.TextureLoader, './textures/floor/rocky_terrain_02_arm_1k.jpg');
    const normal = useLoader(THREE.TextureLoader, './textures/floor/rocky_terrain_02_nor_gl_1k.jpg');
    const disp = useLoader(THREE.TextureLoader, './textures/floor/rocky_terrain_02_disp_1k.jpg');

    // Configure texture repeat
    useMemo(() => {
        [color, arm, normal, disp].forEach(tex => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
        });
    }, [color, arm, normal, disp]);

    // Memoize the material
    const floorMaterial = useMemo(() => (
        new THREE.MeshStandardMaterial({
            map: color,
            aoMap: arm,
            normalMap: normal,
            roughnessMap: arm,
            metalnessMap: arm,
            displacementMap: disp,
        })
    ), [color, arm, normal, disp]);

    const blocks = useMemo(() => {
        const blocks = []

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            blocks.push(type)
        }
        return blocks
    }, [count, types, seed])

    return (
        <>
            <BlockStart position={[0, 0, 0]} material={floorMaterial} />

            {blocks.map((Block, i) => <Block key={i} position={[0, 0, -(i + 1) * 4]} material={floorMaterial} />)}
            {/* <BlockSpinner position={[0, 0, 12]} />
            <BlockLimbo position={[0, 0, 8]} />
            <BlockAxe position={[0, 0, 4]} />
            <BlockEnd position={[0, 0, 0]} /> */}
            <BlockEnd position={[0, 0, -(count + 1) * 4]} material={floorMaterial} />
            <Bounds length={count + 2} />
        </>
    )
}