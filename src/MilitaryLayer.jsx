import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import axios from "axios";

const MILITARY_TYPES = ["primary", "barracks", "airfield", "bunker", "checkpoint", "danger_area", "naval_base", "office", "range", "shelter"];

const MILITARY_LABELS = {
    primary: "Główne", barracks: "Koszary", airfield: "Lotniska", bunker: "Bunkry",
    checkpoint: "Checkpointy", danger_area: "Strefy", naval_base: "Bazy",
    office: "Biura", range: "Poligony", shelter: "Schrony"
};

export default function MilitaryOSMLayer() {
    const [militaryType, setMilitaryType] = useState("primary");
    const [allData, setAllData] = useState({}); // Cache dla wszystkich typów
    const [isReady, setIsReady] = useState(false);
    
    const layerRef = useRef(null);
    const map = useMap();

    // Ładowanie WSZYSTKIEGO na starcie (Klucz do trybu offline)
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

    // Centrowanie po zmianie warstwy
    useEffect(() => {
        if (isReady && allData[militaryType] && layerRef.current) {
            try {
                const bounds = layerRef.current.getBounds();
                if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
            } catch (e) { }
        }
    }, [militaryType, isReady, map]);

    if (!isReady) return null;

    return (
        <>
            <div style={{
                position: "absolute", top: "10px", left: "60px", zIndex: 1000,
                background: "white", padding: "10px", borderRadius: "8px",
                display: "flex", flexWrap: "wrap", gap: "5px", maxWidth: "300px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
            }}>
                {MILITARY_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setMilitaryType(type)}
                        style={{
                            padding: "5px 8px", fontSize: "11px", cursor: "pointer",
                            backgroundColor: militaryType === type ? "#cc0000" : "#fff",
                            color: militaryType === type ? "#fff" : "#000",
                            border: "1px solid #ccc", borderRadius: "4px"
                        }}
                    >
                        {MILITARY_LABELS[type]}
                    </button>
                ))}
            </div>

            {allData[militaryType] && (
                <GeoJSON
                    key={militaryType} // Wymusza odświeżenie grafiki
                    data={allData[militaryType]}
                    ref={layerRef}
                    style={{
                        color: "red",
                        weight: 3,
                        fillOpacity: 0.4
                    }}
                    onEachFeature={(feature, layer) => {
                        const name = feature.properties?.tags?.name || "Obiekt wojskowy";
                        layer.bindPopup(`<strong>${name}</strong>`);
                    }}
                />
            )}
        </>
    );
}