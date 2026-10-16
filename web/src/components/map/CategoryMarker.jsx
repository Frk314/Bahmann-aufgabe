import { Marker } from "react-leaflet";
import L from "leaflet";
import { getColor } from "../../utils/categories";

// Pastille colorée selon la catégorie (agrandie si sélectionnée)
const makeIcon = (category, selected) => {
  const size = selected ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${getColor(category)};
      border:2px solid white;
      box-shadow:0 0 4px rgba(0,0,0,0.4);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function CategoryMarker({ provider, selected, onSelect }) {
  return (
    <Marker
      position={[provider.coordinates.lat, provider.coordinates.lng]}
      icon={makeIcon(provider.category, selected)}
      eventHandlers={{ click: () => onSelect(provider.id) }}
    />
  );
}