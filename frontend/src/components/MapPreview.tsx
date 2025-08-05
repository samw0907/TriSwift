import React, { useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/mapPreview.css";

interface MapPreviewProps {
  fromCoord: [number, number];
  toCoord: [number, number];
}

const MapPreview: React.FC<MapPreviewProps> = ({ fromCoord, toCoord }) => {
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");

  const isSatellite = mapStyle.includes("satellite");
  const isLightMode = mapStyle.includes("streets-v11");

  const lineColor = isSatellite ? "#00bfff" : "#fb8122";

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
      "line-color": lineColor,
      "line-width": 4,
      "line-dasharray": [2, 1],
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

  const bounds = [
    [Math.min(fromCoord[0], toCoord[0]), Math.min(fromCoord[1], toCoord[1])],
    [Math.max(fromCoord[0], toCoord[0]), Math.max(fromCoord[1], toCoord[1])]
  ];

  return (
    <div className="map-preview-wrapper">
      <div className={`map-style-toggle ${isLightMode ? "light" : "dark"}`}>
        <label>
          <input
            type="radio"
            name="map-style"
            value="satellite"
            checked={isSatellite}
            onChange={() => handleMapStyleChange("satellite")}
          />
          Satellite
        </label>
        <label>
          <input
            type="radio"
            name="map-style"
            value="dark"
            checked={mapStyle.includes("dark")}
            onChange={() => handleMapStyleChange("dark")}
          />
          Dark
        </label>
        <label>
          <input
            type="radio"
            name="map-style"
            value="light"
            checked={isLightMode}
            onChange={() => handleMapStyleChange("light")}
          />
          Light
        </label>
      </div>

      <div className="map-container">
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          bounds={bounds}
          fitBoundsOptions={{ padding: 60 }}
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
