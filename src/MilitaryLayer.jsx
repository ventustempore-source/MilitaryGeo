import { useEffect, useState, useRef, useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import axios from "axios";

const MILITARY_TYPES = ["primary", "barracks", "airfield", "bunker", "checkpoint", "danger_area", "naval_base", "office", "range", "shelter"];

const MILITARY_LABELS = {
    all: "Wszystkie", // all/everything
    primary: "Główne", barracks: "Koszary", airfield: "Lotniska", bunker: "Bunkry",
    checkpoint: "Checkpointy", danger_area: "Strefy", naval_base: "Bazy",
    office: "Biura", range: "Poligony", shelter: "Schrony"
};

export default function MilitaryOSMLayer() {
    const [militaryType, setMilitaryType] = useState("all"); 
    const [allData, setAllData] = useState({});
    const [isReady, setIsReady] = useState(false);
    // color
    const [color, setColor] = useState("#ff0000");
    const [weight, setWeight] = useState(6);
    const [opacity, setOpacity] = useState(0.4);

    const layerRef = useRef(null);
    const map = useMap();

    useEffect(() => {
        const loadAllData = async () => {
            const dataCache = {};
            const promises = MILITARY_TYPES.map(async (type) => {
                try {
                    const res = await axios.get(`/data/${type}.json`);
                    dataCache[type] = res.data;
                } catch (e) {
                    console.error(`Brak pliku: ${type}.json`);
                }
            });
            await Promise.all(promises);
            setAllData(dataCache);
            setIsReady(true);
        };
        loadAllData();
    }, []);

    // Sum to all
    const currentGeoJson = useMemo(() => {
        if (!isReady) return null;
        
        if (militaryType === "all") {
            // all to one object
            const allFeatures = Object.values(allData).flatMap(data => data.features || []);
            return {
                type: "FeatureCollection",
                features: allFeatures
            };
        }
        return allData[militaryType];
    }, [militaryType, allData, isReady]);

    // sum for objects
    const featureCount = useMemo(() => {
        return currentGeoJson?.features?.length || 0;
    }, [currentGeoJson]);

    useEffect(() => {
        if (isReady && currentGeoJson && layerRef.current) {
            try {
                const bounds = layerRef.current.getBounds();
                if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
            } catch (e) { }
        }
    }, [militaryType, isReady, map, currentGeoJson]);

    if (!isReady) return null;

    const panelStyle = {
        position: "absolute",
        zIndex: 1000,
        background: "white",
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        fontFamily: "sans-serif",
        color: "#1a2b3c"
    };

    return (
        <>
            {/* All menu "Wszystkie" */}
            <div style={{ ...panelStyle, top: "10px", left: "60px", display: "flex", flexWrap: "wrap", gap: "5px", maxWidth: "400px" }}>
                <button
                    onClick={() => setMilitaryType("all")}
                    style={{
                        padding: "6px 10px", fontSize: "12px", cursor: "pointer",
                        backgroundColor: militaryType === "all" ? "#cc0000" : "#444",
                        color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold"
                    }}
                >
                    {MILITARY_LABELS.all}
                </button>
                {MILITARY_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setMilitaryType(type)}
                        style={{
                            padding: "6px 10px", fontSize: "12px", cursor: "pointer",
                            backgroundColor: militaryType === type ? "#0056b3" : "#f0f0f0",
                            color: militaryType === type ? "#fff" : "#333",
                            border: "none", borderRadius: "6px"
                        }}
                    >
                        {MILITARY_LABELS[type]}
                    </button>
                ))}
            </div>

            {/* Styl warstwy */}
            <div style={{ ...panelStyle, bottom: "20px", left: "20px", width: "220px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Styl warstwy</h3>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "100%", height: "30px", marginBottom: "10px" }} />
                <label style={{ fontSize: "12px" }}>Grubość: {weight}</label>
                <input type="range" min="1" max="15" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} style={{ width: "100%" }} />
                <label style={{ fontSize: "12px" }}>Przezroczystość: {opacity}</label>
                <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} style={{ width: "100%" }} />
            </div>

            {/* Legenda */}
            <div style={{ ...panelStyle, bottom: "20px", right: "20px", minWidth: "150px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Legenda</h3>
                <p style={{ margin: "4px 0", fontSize: "14px" }}><strong>Typ:</strong> {MILITARY_LABELS[militaryType]}</p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}><strong>Obiektów:</strong> {featureCount}</p>
            </div>

            {currentGeoJson && (
                <GeoJSON
                    key={`${militaryType}-${color}-${weight}-${opacity}`}
                    data={currentGeoJson}
                    ref={layerRef}
                    style={{
                        color: color,
                        weight: weight,
                        fillColor: color,
                        fillOpacity: opacity,
                        opacity: opacity
                    }}
                    onEachFeature={(feature, layer) => {
                        const name = feature.properties?.tags?.name || "Obiekt wojskowy";
                        const type = feature.properties?.tags?.military || "Nieznany";
                        layer.bindPopup(`<strong>${name}</strong><br/>Typ OSM: ${type}`);
                    }}
                />
            )}
        </>
    );
}