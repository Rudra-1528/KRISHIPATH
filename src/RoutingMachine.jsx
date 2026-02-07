import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const isValidCoord = (coord) => Array.isArray(coord)
  && coord.length === 2
  && Number.isFinite(coord[0])
  && Number.isFinite(coord[1]);

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !isValidCoord(start) || !isValidCoord(end)) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]), // Truck Location
        L.latLng(end[0], end[1])      // Destination
      ],
      lineOptions: {
        styles: [{ color: "#2e7d32", weight: 6, opacity: 0.8 }] // Professional Green Route
      },
      show: false,             // Hide text instructions
      addWaypoints: false,     // Disable user dragging
      routeWhileDragging: false,
      fitSelectedRoutes: true, // Auto-zoom to fit the path
      
      // CRITICAL: We return null here so the routing machine adds NO icons.
      // We will add our own beautiful Truck Icons in the Dashboard file.
      createMarker: function() { return null; } 
    }).addTo(map);

    return () => {
      if (!routingControl) return;
      try {
        routingControl.remove();
      } catch {
        if (map && map.removeControl) {
          map.removeControl(routingControl);
        }
      }
    };

  }, [map, start, end]); // Re-draws whenever start/end changes

  return null;
};

export default RoutingMachine;