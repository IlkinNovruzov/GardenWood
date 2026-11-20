
import React from "react";
import { RoundedBox } from "@react-three/drei";

const cm = (value) => value / 100;

export default function SofaPart({
  part,
  selected,
  onSelect,
  fabricColor,
  woodColor,
  customColors = {},
}) {
  const isWood = ["wood", "leg"].includes(part.type);
  const defaultColor = isWood ? woodColor : fabricColor;
  const color = customColors[part.id] || defaultColor;

  const width = cm(part.width);
  const height = cm(part.height);
  const depth = cm(part.depth);

  const radius =
    part.type === "seat" || part.type === "back" || part.type === "arm"
      ? 0.045
      : 0.012;

  return (
    <group
      position={[part.x, part.y, part.z]}
      rotation={[0, part.rotation || 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(part.id);
      }}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={Math.min(
          radius,
          width / 4,
          height / 4,
          depth / 4
        )}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={selected ? "#D5A45E" : color}
          roughness={isWood ? 0.72 : 0.94}
          metalness={0}
        />
      </RoundedBox>

      {selected && (
        <mesh>
          <boxGeometry
            args={[
              width + 0.012,
              height + 0.012,
              depth + 0.012,
            ]}
          />
          <meshBasicMaterial
            color="#E5A64F"
            wireframe
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}
