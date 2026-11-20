
const toMeters = (value) => value / 100;

export function createSofaLayout(config) {
  const {
    layout = "straight",
    seatCount = 3,
    extensionCount = 1,
    seatWidth = 80,
    seatDepth = 85,
    seatHeight = 18,
    backHeight = 60,
    backThickness = 15,
    armWidth = 18,
    armHeight = 55,
    leftArm = true,
    rightArm = true,
    chaise = false,
    ottoman = false,
    legHeight = 12,
  } = config;

  const parts = [];

  const FRAME = 8;
  const LEG = 6;
  const GAP = 2;

  const add = (
    id,
    type,
    label,
    x,
    y,
    z,
    width,
    height,
    depth,
    rotation = 0
  ) => {
    parts.push({
      id,
      type,
      label,
      x: toMeters(x),
      y: toMeters(y),
      z: toMeters(z),
      width,
      height,
      depth,
      rotation,
    });
  };

  // Converts local coordinates to world coordinates.
  const addLocal = (
    id,
    type,
    label,
    centerX,
    centerZ,
    localX,
    y,
    localZ,
    width,
    height,
    depth,
    rotation = 0
  ) => {
    const x =
      centerX +
      localX * Math.cos(rotation) +
      localZ * Math.sin(rotation);

    const z =
      centerZ -
      localX * Math.sin(rotation) +
      localZ * Math.cos(rotation);

    add(
      id,
      type,
      label,
      x,
      y,
      z,
      width,
      height,
      depth,
      rotation
    );
  };

  const addSeatModule = ({
    id,
    x,
    z,
    rotation = 0,
    width = seatWidth,
    depth = seatDepth,
    includeBack = true,
  }) => {
    const legY = legHeight / 2;
    const frameY = legHeight + FRAME / 2;
    const cushionY = legHeight + FRAME + seatHeight / 2;

    // 1. Wooden frame: front and rear rails
    addLocal(
      `${id}-frame-front`,
      "wood",
      "Ön karkas şüası",
      x, z,
      0, frameY, depth / 2 - FRAME / 2,
      width, FRAME, FRAME,
      rotation
    );

    addLocal(
      `${id}-frame-rear`,
      "wood",
      "Arxa karkas şüası",
      x, z,
      0, frameY, -depth / 2 + FRAME / 2,
      width, FRAME, FRAME,
      rotation
    );

    // 2. Side rails
    addLocal(
      `${id}-frame-left`,
      "wood",
      "Sol yan karkas şüası",
      x, z,
      -width / 2 + FRAME / 2, frameY, 0,
      FRAME, FRAME, depth - FRAME,
      rotation
    );

    addLocal(
      `${id}-frame-right`,
      "wood",
      "Sağ yan karkas şüası",
      x, z,
      width / 2 - FRAME / 2, frameY, 0,
      FRAME, FRAME, depth - FRAME,
      rotation
    );

    // 3. Intermediate support slats
    const slatCount = Math.max(2, Math.floor(depth / 25));

    for (let i = 0; i < slatCount; i++) {
      const localZ =
        -depth / 2 +
        FRAME +
        ((depth - FRAME * 2) / (slatCount - 1)) * i;

      addLocal(
        `${id}-slat-${i}`,
        "wood",
        "Ara karkas dayağı",
        x, z,
        0, frameY, localZ,
        width - FRAME * 2, FRAME, 5,
        rotation
      );
    }

    // 4. Legs
    const legPositions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    legPositions.forEach(([sx, sz], index) => {
      const localX = sx * (width / 2 - LEG / 2);
      const localZ = sz * (depth / 2 - LEG / 2);

      addLocal(
        `${id}-leg-${index}`,
        "leg",
        "Taxta ayaq",
        x, z,
        localX, legY, localZ,
        LEG, legHeight, LEG,
        rotation
      );
    });

    // 5. Seat cushion
    addLocal(
      `${id}-cushion`,
      "seat",
      "Oturacaq yastığı",
      x, z,
      0, cushionY, 0,
      width - GAP,
      seatHeight,
      depth - GAP,
      rotation
    );

    // 6. Back cushion
    if (includeBack) {
      const backLocalZ =
        -depth / 2 + backThickness / 2;

      addLocal(
        `${id}-back`,
        "back",
        "Arxa yastıq",
        x, z,
        0,
        legHeight + FRAME + seatHeight + backHeight / 2,
        backLocalZ,
        width - GAP,
        backHeight,
        backThickness,
        rotation
      );
    }
  };

  // Armrest built from wooden posts and a top rail.
  const addArm = (id, x, z, rotation = 0, depth = seatDepth) => {
    const postDepth = 8;
    const postWidth = 8;
    const postY = legHeight + armHeight / 2;

    // Front post
    addLocal(
      `${id}-post-front`,
      "wood",
      "Qol dayağı ön dirəyi",
      x, z,
      0, postY, depth / 2 - postDepth / 2,
      armWidth,
      armHeight,
      postDepth,
      rotation
    );

    // Rear post
    addLocal(
      `${id}-post-rear`,
      "wood",
      "Qol dayağı arxa dirəyi",
      x, z,
      0, postY, -depth / 2 + postDepth / 2,
      armWidth,
      armHeight,
      postDepth,
      rotation
    );

    // Top wooden rail
    addLocal(
      `${id}-top-rail`,
      "wood",
      "Qol dayağı üst şüası",
      x, z,
      0,
      legHeight + armHeight - 4,
      0,
      armWidth,
      8,
      depth,
      rotation
    );

    // Soft armrest cushion
    addLocal(
      `${id}-cushion`,
      "arm",
      "Qol dayağı yumşaq hissəsi",
      x, z,
      0,
      legHeight + armHeight + 1,
      0,
      armWidth + 2,
      6,
      depth,
      rotation
    );
  };

  const halfWidth = (seatCount * seatWidth) / 2;

  // Main sofa row
  for (let i = 0; i < seatCount; i++) {
    const x =
      -halfWidth + seatWidth / 2 + i * seatWidth;

    addSeatModule({
      id: `main-${i}`,
      x,
      z: 0,
    });
  }

  // Left extension
  if (layout === "left" || layout === "u") {
    for (let i = 0; i < extensionCount; i++) {
      addSeatModule({
        id: `left-extension-${i}`,
        x: -halfWidth + seatWidth / 2,
        z: seatDepth / 2 + seatWidth / 2 + i * seatWidth,
        rotation: Math.PI / 2,
      });
    }
  }

  // Right extension
  if (layout === "right" || layout === "u") {
    for (let i = 0; i < extensionCount; i++) {
      addSeatModule({
        id: `right-extension-${i}`,
        x: halfWidth - seatWidth / 2,
        z: seatDepth / 2 + seatWidth / 2 + i * seatWidth,
        rotation: -Math.PI / 2,
      });
    }
  }

  // Chaise
  if (chaise && layout === "straight") {
    addSeatModule({
      id: "chaise",
      x: halfWidth - seatWidth / 2,
      z: seatDepth,
      width: seatWidth,
      depth: seatDepth * 1.5,
      includeBack: false,
    });
  }

  // Main row armrests
  if (layout === "straight") {
    if (leftArm) {
      addArm(
        "left-arm",
        -halfWidth - armWidth / 2,
        0
      );
    }

    if (rightArm) {
      addArm(
        "right-arm",
        halfWidth + armWidth / 2,
        0
      );
    }
  }

  if (layout === "left" && rightArm) {
    addArm(
      "right-arm",
      halfWidth + armWidth / 2,
      0
    );
  }

  if (layout === "right" && leftArm) {
    addArm(
      "left-arm",
      -halfWidth - armWidth / 2,
      0
    );
  }

  // Ottoman
  if (ottoman) {
    addSeatModule({
      id: "ottoman",
      x: 0,
      z: seatDepth + 20,
      includeBack: false,
    });
  }

  return parts;
}

export function calculateSofaDimensions(config) {
  const {
    layout,
    seatCount,
    extensionCount,
    seatWidth,
    seatDepth,
    armWidth,
    chaise,
    ottoman,
    leftArm,
    rightArm,
  } = config;

  let width = seatCount * seatWidth;
  let depth = seatDepth;

  if (layout === "left" || layout === "right") {
    depth += extensionCount * seatWidth;
  }

  if (layout === "u") {
    depth += extensionCount * seatWidth;
    width += seatDepth;
  }

  if (layout === "straight") {
    width +=
      (leftArm ? armWidth : 0) +
      (rightArm ? armWidth : 0);

    if (chaise) {
      depth += seatDepth;
    }
  }

  if (ottoman) {
    depth += seatDepth + 20;
  }

  return {
    width: Math.round(width),
    depth: Math.round(depth),
  };
}
