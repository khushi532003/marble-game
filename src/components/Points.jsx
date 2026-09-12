import { RigidBody } from '@react-three/rapier';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useState } from 'react';

function Points({ position = [0, 0.5, -2], onCollect }) {
    const coin = useLoader(THREE.TextureLoader, '/textures/coin/coin.png');
    const [collected, setCollected] = useState(false);

    if (collected) return null;

    // Collision groups: Coin is in group 2 (0x00040000), collides with group 1 (player, 0x00020000)
    const collisionGroups = 0x00040002; // Group 2, collides with group 1
    // Solver groups: Coin doesn't apply physics forces to group 1 (player)
    const solverGroups = 0x00040000; // Group 2, solves with no groups (no physics interaction)

    return (
        <RigidBody
            type="fixed"
            position={position}
            mass={0}
            userData={{
                type: 'coin',
                onCollect: () => {
                    setCollected(true);
                    onCollect?.();
                }
            }}
            friction={1}
            restitution={0}
            collisionGroups={collisionGroups}
            solverGroups={solverGroups}
        >
            <mesh scale={0.2} rotation={[Math.PI * 0.5, Math.PI * 0.5, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.1, 20]} />
                <meshBasicMaterial color={'#FFC000'} map={coin} />
            </mesh>
        </RigidBody>
    );
}

export default Points;