
import React from "react";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Grid,
} from "@react-three/drei";

import SofaPart from "./SofaPart";

export default function SofaScene({
  parts,
  selectedId,
  onSelect,
  fabricColor,
  woodColor,
  customColors,
}) {
  return (
    <>
      <color attach="background" args={["#eeeae4"]} />

      <ambientLight intensity={0.75} />

      <directionalLight
        position={[4, 7, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <directionalLight
        position={[-4, 4, -3]}
        intensity={0.6}
      />

      {parts.map((part) => (
        <SofaPart
          key={part.id}
          part={part}
          selected={selectedId === part.id}
          onSelect={onSelect}
          fabricColor={fabricColor}
          woodColor={woodColor}
          customColors={customColors}
        />
      ))}

      <Grid
        position={[0, -0.006, 0]}
        args={[10, 10]}
        cellSize={0.25}
        cellThickness={0.5}
        cellColor="#c7c1b8"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#aaa39a"
        fadeDistance={10}
        infiniteGrid
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={8}
        blur={2}
        far={4}
      />

      <Environment preset="city" />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={1.8}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.65, 0]}
      />
    </>
  );
}
