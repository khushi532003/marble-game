import React, { useEffect, useRef, useState } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import useGame from '../stores/useGame';

function Player() {
    const [subscribeKeys, getKeys] = useKeyboardControls();
    const body = useRef();
    const { rapier, world } = useRapier();
    const rapierWorld = world;
    const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10));
    const [smoothCameraTarget] = useState(() => new THREE.Vector3());

    const start = useGame((state) => state.start);
    const end = useGame((state) => state.end);
    const restart = useGame((state) => state.restart);
    const resetPoint = useGame((state) => state.resetPoints);
    const blocksCount = useGame((state) => state.blocksCount);
    const phase = useGame((state) => state.phase);

    // Sound effects
    const [hitSound] = useState(() => new Audio('./hit.mp3'));
    const [bgMusic] = useState(() => new Audio('./backgroundMusic.mp3'));
    const [winSound] = useState(() => new Audio('./win.mp3'));
    const [gameOverSound] = useState(() => new Audio('./game-over.mp3'));
    const [bonusSound] = useState(() => new Audio('./bonus.mp3'));

    const jump = () => {
        const origin = body.current.translation();
        origin.y -= 0.31;
        const direction = { x: 0, y: -1, z: 0 };
        const ray = new rapier.Ray(origin, direction);
        const hit = rapierWorld.castRay(ray, 10, true);

        if (hit.timeOfImpact < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
        }
    };

    const reset = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 });
        body.current.setLinvel({ x: 0, y: 0, z: 0 });
        body.current.setAngvel({ x: 0, y: 0, z: 0 });
    };

    useEffect(() => {
        if (phase === 'playing' && body.current) {
            const bodyPosition = body.current.translation();
            smoothCameraPosition.set(bodyPosition.x, bodyPosition.y + 0.65, bodyPosition.z + 2.25);
            smoothCameraTarget.set(bodyPosition.x, bodyPosition.y + 0.25, bodyPosition.z);
        }
    }, [phase, smoothCameraPosition, smoothCameraTarget]);

    useEffect(() => {
        // Call reset immediately if the initial phase is "ready"
        if (phase === 'ready' && body.current) {
            reset();
        }

        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'ready') {
                    reset();
                }
            }
        );
        const unsubscribgBgMusic = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'playing') {
                    bgMusic.currentTime = 0;
                    bgMusic.loop = true;
                    bgMusic.play();
                } else if (value === 'ready') {
                    bgMusic.pause();
                }
            }
        );

        const unsubscribeWinSound = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'ended') {
                    winSound.currentTime = 0;
                    winSound.play();
                } else if (value === 'ready' || value === 'playing') {
                    winSound.pause();
                }
            }
        );

        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) => {
                if (value && phase === 'playing') {
                    jump();
                }
            }
        );

        return () => {
            unsubscribeWinSound();
            unsubscribgBgMusic();
            unsubscribeReset();
            unsubscribeJump();
        };
    }, [phase]);

    useFrame((state, delta) => {
        if (phase !== 'playing') return;

        const { forward, backward, leftward, rightward } = getKeys();
        const impulse = { x: 0, y: 0, z: 0 };
        const torque = { x: 0, y: 0, z: 0 };

        const impulseStrength = 0.6 * delta;
        const torqueStrength = 0.2 * delta;

        if (forward) {
            impulse.z -= impulseStrength;
            torque.x -= torqueStrength;
        }
        if (backward) {
            impulse.z += impulseStrength;
            torque.x += torqueStrength;
        }
        if (leftward) {
            impulse.x -= impulseStrength;
            torque.z += torqueStrength;
        }
        if (rightward) {
            impulse.x += impulseStrength;
            torque.z -= torqueStrength;
        }

        body.current.applyImpulse(impulse);
        body.current.applyTorqueImpulse(torque);

        const bodyPosition = body.current.translation();

        const cameraPosition = new THREE.Vector3();
        cameraPosition.copy(bodyPosition);
        cameraPosition.z += 2.25;
        cameraPosition.y += 0.65;

        const cameraTarget = new THREE.Vector3();
        cameraTarget.copy(bodyPosition);
        cameraTarget.y += 0.25;

        smoothCameraPosition.lerp(cameraPosition, 5 * delta);
        smoothCameraTarget.lerp(cameraTarget, 5 * delta);

        state.camera.position.copy(smoothCameraPosition);
        state.camera.lookAt(smoothCameraTarget);

        if (bodyPosition.z < -(blocksCount * 4 + 2)) end();

        if (bodyPosition.y < -4) {
            restart();
            resetPoint();
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }
    });

    const collisionEnter = ({ other }) => {
        hitSound.currentTime = 0;
        hitSound.volume = Math.random();
        hitSound.play();

        const userData = other.rigidBodyObject?.userData;

        if (userData?.type === 'axe') {
            useGame.getState().gameover();
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }

        if (userData?.type === 'coin') {
            useGame.getState().addPoint();
            userData.onCollect?.();
            bonusSound.currentTime = 0;
            bonusSound.play();
        }
    };

    // Collision groups: Player is in group 1 (0x00020000), collides with group 0 (default, 0x00010000) and group 2 (coins, 0x00040000)
    const collisionGroups = 0x00020005; // Group 1, collides with groups 0 and 2

    return (
        <RigidBody
            ref={body}
            colliders="ball"
            position={[0, 1, 0]}
            restitution={0.2}
            friction={1}
            canSleep={false}
            linearDamping={0.5}
            angularDamping={0.5}
            onCollisionEnter={collisionEnter}
            collisionGroups={collisionGroups}
        >
            <mesh castShadow>
                <icosahedronGeometry args={[0.3, 1]} />
                <meshStandardMaterial flatShading color={'mediumpurple'} />
            </mesh>
        </RigidBody>
    );
}

export default Player;