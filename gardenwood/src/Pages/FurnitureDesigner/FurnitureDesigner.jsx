
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import {
  FiPlus,
  FiMinus,
  FiBox,
  FiRotateCcw,
  FiLayers,
} from "react-icons/fi";

import SofaScene from "../../Components/SofaScene";
import {
  createSofaLayout,
  calculateSofaDimensions,
} from "./configurator/sofaLayoutEngine";

import "./FurnitureDesigner.css";

const FABRIC_COLORS = [
  { name: "Bej", value: "#D8C3A5" },
  { name: "Açıq boz", value: "#B8B8B5" },
  { name: "Tünd boz", value: "#55565A" },
  { name: "Qəhvəyi", value: "#795548" },
  { name: "Krem", value: "#E8DDC8" },
  { name: "Yaşıl", value: "#65745B" },
  { name: "Göy", value: "#536B80" },
  { name: "Qara", value: "#292929" },
];

const WOOD_COLORS = [
  { name: "Natural", value: "#C69B6D" },
  { name: "Tik", value: "#A66E3F" },
  { name: "Qoz", value: "#68452F" },
  { name: "Tünd qoz", value: "#3D2921" },
  { name: "Palıd", value: "#D5B98C" },
  { name: "Ağ", value: "#E8E3D9" },
  { name: "Antrasit", value: "#414347" },
  { name: "Qara", value: "#252525" },
];

const INITIAL_CONFIG = {
  layout: "straight",
  seatCount: 3,
  extensionCount: 1,

  seatWidth: 80,
  seatDepth: 85,
  seatHeight: 18,

  backHeight: 60,
  backThickness: 15,

  armWidth: 18,
  armHeight: 55,

  leftArm: true,
  rightArm: true,

  chaise: false,
  ottoman: false,

  legHeight: 12,
};

const LIMITS = {
  seatWidth: { min: 60, max: 100, step: 5 },
  seatDepth: { min: 70, max: 110, step: 5 },
  seatHeight: { min: 15, max: 25, step: 1 },
  backHeight: { min: 40, max: 80, step: 5 },
  armWidth: { min: 12, max: 25, step: 1 },
  armHeight: { min: 40, max: 70, step: 5 },
  legHeight: { min: 5, max: 25, step: 1 },
};

const LAYOUTS = [
  { id: "straight", name: "Düz divan", symbol: "━" },
  { id: "left", name: "L-sol", symbol: "┏" },
  { id: "right", name: "L-sağ", symbol: "┓" },
  { id: "u", name: "U-forma", symbol: "⊔" },
];

const clamp = (value, min, max) =>
  Math.min(Math.max(Number(value), min), max);

function Counter({ value, onDecrease, onIncrease, min, max }) {
  return (
    <div className="counter-control">
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Azalt"
      >
        <FiMinus />
      </button>

      <strong>{value}</strong>

      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        aria-label="Artır"
      >
        <FiPlus />
      </button>
    </div>
  );
}

function ColorPicker({ colors, selected, onChange }) {
  return (
    <div className="color-options">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.name}
          aria-label={color.name}
          className={
            selected === color.value
              ? "color-swatch active"
              : "color-swatch"
          }
          style={{ backgroundColor: color.value }}
          onClick={() => onChange(color.value)}
        />
      ))}
    </div>
  );
}

function DimensionControl({ label, property, config, onChange }) {
  const limit = LIMITS[property];

  return (
    <div className="dimension-group">
      <label htmlFor={`dimension-${property}`}>{label}</label>

      <div className="dimension-input">
        <input
          id={`dimension-${property}`}
          type="number"
          min={limit.min}
          max={limit.max}
          step={limit.step}
          value={config[property]}
          onChange={(event) => {
            if (event.target.value === "") return;

            onChange(
              property,
              clamp(event.target.value, limit.min, limit.max)
            );
          }}
        />
        <span>sm</span>
      </div>

      <small>
        {limit.min} – {limit.max} sm
      </small>
    </div>
  );
}

export default function FurnitureDesigner() {
  const { id } = useParams();

  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [selectedId, setSelectedId] = useState("main-0-cushion");

  const [fabricColor, setFabricColor] = useState("#D8C3A5");
  const [woodColor, setWoodColor] = useState("#A66E3F");
  const [customColors, setCustomColors] = useState({});

  const [activeTab, setActiveTab] = useState("structure");

  const parts = useMemo(
    () => createSofaLayout(config),
    [config]
  );

  const dimensions = useMemo(
    () => calculateSofaDimensions(config),
    [config]
  );

  const selectedPart = parts.find(
    (part) => part.id === selectedId
  );

  const updateConfig = (property, value) => {
    setConfig((current) => ({
      ...current,
      [property]: value,
    }));
  };

  const updateSelectedColor = (color) => {
    if (!selectedPart) return;

    setCustomColors((current) => ({
      ...current,
      [selectedPart.id]: color,
    }));
  };

  const resetSelectedColor = () => {
    if (!selectedPart) return;

    setCustomColors((current) => {
      const next = { ...current };
      delete next[selectedPart.id];
      return next;
    });
  };

  const resetDesign = () => {
    setConfig({ ...INITIAL_CONFIG });
    setSelectedId("main-0-cushion");
    setFabricColor("#D8C3A5");
    setWoodColor("#A66E3F");
    setCustomColors({});
    setActiveTab("structure");
  };

  const changeSeatCount = (amount) => {
    updateConfig(
      "seatCount",
      clamp(config.seatCount + amount, 2, 4)
    );
    setSelectedId("main-0-cushion");
  };

  const changeExtensionCount = (amount) => {
    updateConfig(
      "extensionCount",
      clamp(config.extensionCount + amount, 1, 2)
    );
  };

  const isWoodPart =
    selectedPart &&
    ["wood", "leg"].includes(selectedPart.type);

  const currentColorOptions = isWoodPart
    ? WOOD_COLORS
    : FABRIC_COLORS;

  const currentSelectedColor = selectedPart
    ? customColors[selectedPart.id] ||
      (isWoodPart ? woodColor : fabricColor)
    : null;

  const selectedDimensions = selectedPart
    ? selectedPart.type === "seat" ||
      selectedPart.type === "back" ||
      selectedPart.type === "ottoman"
      ? [
          ["En", "seatWidth"],
          ["Dərinlik", "seatDepth"],
          [
            "Hündürlük",
            selectedPart.type === "back"
              ? "backHeight"
              : "seatHeight",
          ],
        ]
      : selectedPart.type === "arm"
      ? [
          ["En", "armWidth"],
          ["Dərinlik", "seatDepth"],
          ["Hündürlük", "armHeight"],
        ]
      : selectedPart.type === "leg"
      ? [["Hündürlük", "legHeight"]]
      : []
    : [];

  return (
    <div className="designer-page">
      <header className="designer-topbar">
        <div className="designer-heading">
          <Link
            to={`/products/${id}`}
            className="designer-back"
          >
            ← Məhsula qayıt
          </Link>

          <h1>Garden Wood — 3D Divan Dizayneri</h1>
          <p>Divanınızı öz zövqünüzə uyğun yaradın</p>
        </div>

        <div className="designer-topbar-right">
          <span>{parts.length} komponent</span>

          <button
            type="button"
            onClick={resetDesign}
            className="reset-design-btn"
          >
            <FiRotateCcw />
            Sıfırla
          </button>
        </div>
      </header>

      <main className="designer-workspace">
        {/* LEFT SIDEBAR */}
        <aside className="designer-sidebar">
          <h2>Konfiqurasiya</h2>

          <div className="designer-tabs">
            <button
              type="button"
              className={activeTab === "structure" ? "active" : ""}
              onClick={() => setActiveTab("structure")}
            >
              <FiLayers />
              Quruluş
            </button>

            <button
              type="button"
              className={activeTab === "materials" ? "active" : ""}
              onClick={() => setActiveTab("materials")}
            >
              <FiBox />
              Materiallar
            </button>
          </div>

          {activeTab === "structure" && (
            <div className="designer-tab-content">
              <h3>Divanın forması</h3>

              <div className="layout-options">
                {LAYOUTS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      config.layout === item.id
                        ? "layout-option active"
                        : "layout-option"
                    }
                    onClick={() => {
                      updateConfig("layout", item.id);
                      setSelectedId("main-0-cushion");
                    }}
                  >
                    <span className="layout-symbol">
                      {item.symbol}
                    </span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>

              <div className="designer-control-card">
                <h3>Əsas oturacaq sayı</h3>

                <Counter
                  value={config.seatCount}
                  min={2}
                  max={4}
                  onDecrease={() => changeSeatCount(-1)}
                  onIncrease={() => changeSeatCount(1)}
                />
              </div>

              {config.layout !== "straight" && (
                <div className="designer-control-card">
                  <h3>Yan modul sayı</h3>

                  <Counter
                    value={config.extensionCount}
                    min={1}
                    max={2}
                    onDecrease={() => changeExtensionCount(-1)}
                    onIncrease={() => changeExtensionCount(1)}
                  />
                </div>
              )}

              {config.layout === "straight" && (
                <label className="designer-checkbox">
                  <input
                    type="checkbox"
                    checked={config.chaise}
                    onChange={(event) =>
                      updateConfig("chaise", event.target.checked)
                    }
                  />
                  Şezlonq əlavə et
                </label>
              )}

              <label className="designer-checkbox">
                <input
                  type="checkbox"
                  checked={config.ottoman}
                  onChange={(event) =>
                    updateConfig("ottoman", event.target.checked)
                  }
                />
                Puf əlavə et
              </label>

              <label className="designer-checkbox">
                <input
                  type="checkbox"
                  checked={config.leftArm}
                  onChange={(event) =>
                    updateConfig("leftArm", event.target.checked)
                  }
                />
                Sol qol dayağı
              </label>

              <label className="designer-checkbox">
                <input
                  type="checkbox"
                  checked={config.rightArm}
                  onChange={(event) =>
                    updateConfig("rightArm", event.target.checked)
                  }
                />
                Sağ qol dayağı
              </label>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="designer-tab-content">
              <h3>Ümumi parça rəngi</h3>

              <ColorPicker
                colors={FABRIC_COLORS}
                selected={fabricColor}
                onChange={setFabricColor}
              />

              <div className="panel-divider" />

              <h3>Ümumi taxta rəngi</h3>

              <ColorPicker
                colors={WOOD_COLORS}
                selected={woodColor}
                onChange={setWoodColor}
              />

              <p className="panel-description">
                Fərdi rəng təyin etmək üçün 3D modeldə istədiyiniz
                hissəni seçin.
              </p>
            </div>
          )}

          <div className="component-list-section">
            <h3>Divan komponentləri</h3>

            <div className="component-list">
              {parts.map((part) => (
                <button
                  type="button"
                  key={part.id}
                  className={
                    selectedId === part.id
                      ? "component-list-item selected"
                      : "component-list-item"
                  }
                  onClick={() => setSelectedId(part.id)}
                >
                  <span>{part.label}</span>
                  <small>
                    {part.width} × {part.depth} × {part.height} sm
                  </small>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 3D VIEW */}
        <section className="designer-canvas-section">
          <div className="canvas-toolbar">
            <span>3D Önizləmə</span>
            <span>Modeli sürüşdürərək fırladın · Təkərlə yaxınlaşdırın</span>
          </div>

          <div className="designer-canvas">
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{
                position: [4, 3.2, 5],
                fov: 42,
              }}
            >
              <SofaScene
                parts={parts}
                selectedId={selectedId}
                onSelect={setSelectedId}
                fabricColor={fabricColor}
                woodColor={woodColor}
                customColors={customColors}
              />
            </Canvas>
          </div>

          <div className="canvas-footer">
            <span>Məhsul kodu: {id}</span>
            <span>Ölçü vahidi: santimetr</span>
          </div>
        </section>

        {/* RIGHT PROPERTIES */}
        <aside className="designer-properties">
          <h2>Ölçülər və detallar</h2>

          <div className="properties-content">
            <div className="selected-component-title">
              <span>Ümumi ölçülər</span>
              <small>Konfiqurasiyaya əsasən</small>
            </div>

            <div className="dimension-group">
              <label>Ümumi en</label>
              <div className="dimension-input">
                <input value={dimensions.width} readOnly />
                <span>sm</span>
              </div>
            </div>

            <div className="dimension-group">
              <label>Ümumi dərinlik</label>
              <div className="dimension-input">
                <input value={dimensions.depth} readOnly />
                <span>sm</span>
              </div>
            </div>

            <div className="panel-divider" />

            <div className="selected-component-title">
              <span>{selectedPart?.label || "Hissə seçilməyib"}</span>
              <small>
                {selectedPart ? "Seçilmiş komponent" : "3D modeldən seçin"}
              </small>
            </div>

            {selectedDimensions.map(([label, property]) => (
              <DimensionControl
                key={property}
                label={label}
                property={property}
                config={config}
                onChange={updateConfig}
              />
            ))}

            {selectedPart && (
              <>
                <div className="panel-divider" />

                <h3>Seçilmiş hissənin rəngi</h3>

                <ColorPicker
                  colors={currentColorOptions}
                  selected={currentSelectedColor}
                  onChange={updateSelectedColor}
                />

                <button
                  type="button"
                  className="reset-part-color"
                  onClick={resetSelectedColor}
                >
                  <FiRotateCcw />
                  Hissənin rəngini sıfırla
                </button>
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
