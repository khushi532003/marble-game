import React, { useEffect, useRef, useState } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import useGame from "../stores/useGame";

function Player3() {
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const body = useRef();
  const { rapier, world } = useRapier();
  const rapierWorld = world;
  const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10));
  const [smoothCameraTarget] = useState(() => new THREE.Vector3());

  const { start, end, restart, blocksCount, setDragging } = useGame((state) => ({
    start: state.start,
    end: state.end,
    restart: state.restart,
    blocksCount: state.blocksCount,
    setDragging: state.setDragging,
  }));

  // Drag state
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  // Mouse drag event listener
  const handleMouseDown = (e) => {
    dragState.current.dragging = true;
    setDragging(true); // Set dragging state to true in the store
    dragState.current.startX = e.clientX;
    dragState.current.startY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.dragging) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;

    // Normalize values for drag movement
    dragState.current.deltaX = dx / window.innerWidth;
    dragState.current.deltaY = dy / window.innerHeight;
  };

  const handleMouseUp = () => {
    dragState.current.dragging = false;
    setDragging(false); // Set dragging state to false in the store
    dragState.current.deltaX = 0;
    dragState.current.deltaY = 0;
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Your existing game logic for movement, collisions, etc.

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
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color={"mediumpurple"} />
      </mesh>
    </RigidBody>
  );
}

export default Player3;
