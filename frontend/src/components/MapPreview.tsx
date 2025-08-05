import React, { useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapPreviewProps {
  fromCoord: [number, number];
  toCoord: [number, number];
}

const MapPreview: React.FC<MapPreviewProps> = ({ fromCoord, toCoord }) => {
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");

  const center = [
    (fromCoord[0] + toCoord[0]) / 2,
    (fromCoord[1] + toCoord[1]) / 2,
  ];

  const lineGeoJSON = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [fromCoord, toCoord],
    },
  };

  const lineLayer = {
    id: "route-line",
    type: "line",
    paint: {
      "line-color": "#fb8122",
      "line-width": 4,
      "line-dasharray": [1, 2],
    },
  };

  const handleMapStyleChange = (styleKey: string) => {
    const styleMap: Record<string, string> = {
      satellite: "mapbox://styles/mapbox/satellite-streets-v12",
      dark: "mapbox://styles/mapbox/dark-v11",
      light: "mapbox://styles/mapbox/streets-v11",
    };
    setMapStyle(styleMap[styleKey]);
  };

  const isLightMode = mapStyle.includes("streets-v11");
  const isDarkMode = mapStyle.includes("dark") || mapStyle.includes("satellite");

  return (
    <div style={{ margin: "40px 0", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          zIndex: 1,
          background: isLightMode ? "#000" : "#fff",
          color: isLightMode ? "#fff" : "#000",
          padding: "6px 10px",
          borderRadius: "8px",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "0.8rem",
          display: "flex",
          gap: "10px",
        }}
      >
        <label style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="map-style"
            value="satellite"
            checked={mapStyle.includes("satellite")}
            onChange={() => handleMapStyleChange("satellite")}
          />
          Satellite
        </label>
        <label style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="map-style"
            value="dark"
            checked={mapStyle.includes("dark")}
            onChange={() => handleMapStyleChange("dark")}
          />
          Dark
        </label>
        <label style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="map-style"
            value="light"
            checked={mapStyle.includes("streets-v11")}
            onChange={() => handleMapStyleChange("light")}
          />
          Light
        </label>
      </div>

      <div style={{ height: "500px", width: "100%" }}>
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          initialViewState={{
            longitude: center[0],
            latitude: center[1],
            zoom: 4,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
        >
          <Marker longitude={fromCoord[0]} latitude={fromCoord[1]} color="#f00" />
          <Marker longitude={toCoord[0]} latitude={toCoord[1]} color="#f00" />

          <Source id="city-line" type="geojson" data={lineGeoJSON}>
            <Layer {...lineLayer} />
          </Source>
        </Map>
      </div>
    </div>
  );
};

export default MapPreview;
