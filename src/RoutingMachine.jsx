import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]), // Start (Truck Location)
        L.latLng(end[0], end[1])      // End (Warehouse/Destination)
      ],
      routeWhileDragging: false,
      addWaypoints: false,            // Disable adding new points
      draggableWaypoints: false,      // Disable dragging
      fitSelectedRoutes: false,       // Don't auto-zoom drastically
      showAlternatives: false,        // Just one route
      createMarker: function() { return null; }, // HIDE default markers (we use our own)
      lineOptions: {
        styles: [{ color: "#004d40", weight: 4, opacity: 0.7 }] // Dark Green Route Line
      }
    }).addTo(map);

    // Remove the routing controls box (the white text box on top right)
    // We only want the visual line.
    routingControl._container.style.display = "none";

    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
};

export default RoutingMachine;