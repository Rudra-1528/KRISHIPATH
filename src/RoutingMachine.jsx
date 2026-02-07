import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const toNumberCoord = (coord) => {
  if (!Array.isArray(coord) || coord.length !== 2) return null;
  const lat = Number(coord[0]);
  const lng = Number(coord[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

const isValidCoord = (coord) => Boolean(toNumberCoord(coord));

const RoutingMachine = ({ start, end, serviceUrl }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!routingControlRef.current) {
      const router = serviceUrl ? L.Routing.osrmv1({ serviceUrl }) : undefined;
      routingControlRef.current = L.Routing.control({
        waypoints: [],
        router,
        lineOptions: {
          styles: [{ color: "#2e7d32", weight: 6, opacity: 0.8 }] // Professional Green Route
        },
        show: false,             // Hide text instructions
        addWaypoints: false,     // Disable user dragging
        routeWhileDragging: false,
        fitSelectedRoutes: true, // Auto-zoom to fit the path
        createMarker: function() { return null; }
      }).addTo(map);
    }

    return () => {
      const control = routingControlRef.current;
      if (!control) return;
      try {
        try {
          control.off();
          const plan = control.getPlan ? control.getPlan() : null;
          if (plan && plan.setWaypoints) {
            plan.setWaypoints([]);
          }
        } catch {}
        control.remove();
      } catch {
        if (map && map.removeControl) {
          map.removeControl(control);
        }
      }
      routingControlRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const control = routingControlRef.current;
    if (!control || !control._map || control._map !== map) return;
    const startCoord = toNumberCoord(start);
    const endCoord = toNumberCoord(end);
    if (!startCoord || !endCoord) return;

    const waypoints = [L.latLng(startCoord[0], startCoord[1]), L.latLng(endCoord[0], endCoord[1])];
    try {
      control.setWaypoints(waypoints);
    } catch {}
  }, [start, end, map]);

  return null;
};

export default RoutingMachine;