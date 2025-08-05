import React from "react";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MapPreview: React.FC = () => {
  return (
    <div style={{ height: "500px", width: "100%", margin: "40px 0" }}>
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 10.0,
          latitude: 50.0,
          zoom: 3.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      />
    </div>
  );
};

export default MapPreview;

