import { Cloud, Float } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';

export default function Clouds() {
    const { camera } = useThree();
    const groupRef = useRef();

    useFrame(() => {
        if (groupRef.current) {
            // Clouds will always float above camera and ahead in Z
            groupRef.current.position.set(camera.position.x, 8, camera.position.z - 5);
        }
    });

    return (    
        <group ref={groupRef}>
            <Float floatIntensity={0.1}    // Lower = slower up/down motion
                speed={1} >
            {[...Array(6)].map((_, i) => (
                <Cloud
                    key={i}
                    segments={100}
                    seed={i * 100}  
                    //   color={'#CFE1EF'}
                    position={[Math.random() * 10 - 5, -1, Math.random() * 20 - 10]}
                    scale={[4, 2, 4]}
                    volume={0.6}
                    fade={0.01}
                    color={'#B7E0FF'}
                //   frustumCulled={false}
                />
            ))}
        </Float>
        </group >
    );
}
