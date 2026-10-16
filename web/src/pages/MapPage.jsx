import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import useEstablishments from "../hooks/useEstablishments";
import CategoryMarker from "../components/map/CategoryMarker";
import FilterBar from "../components/map/FilterBar";
import Legend from "../components/map/Legend";
import DetailsPanel from "../components/map/DetailsPanel";
import Spinner from "../components/ui/Spinner";
import ColorSettings from "../components/map/ColorSettings";
// Import pour centraliser les regions.
// import RegionSelect from "../components/map/RegionSelect";

import RegionSelect from "../components/map/RegionSelect"  // pour la nouvelle methode de regroupement par region.
import { DACH_VIEW, REGION_VIEWS, DEFAULT_REGION_ZOOM } from "../constants/config";  // same ---

// const DACH_CENTER = [48.5, 10.5];
// const DACH_ZOOM = 6;

// Zoome sur l'établissement sélectionné
function FlyToSelected({ provider }) {
  const map = useMap();
  useEffect(() => {
    if (provider) {
      map.flyTo([provider.coordinates.lat, provider.coordinates.lng], 12, {
        duration: 1,
      });
    }
  }, [provider, map]);
  return null;
}



// Fonction ajouter pour gerer les region

function FlyToRegion({ region, providers }) {
  const map = useMap();
  useEffect(() => {
    if (region === "All") {
      map.flyTo(DACH_VIEW.center, DACH_VIEW.zoom, { duration: 1 });
      return;
    }
    const view = REGION_VIEWS[region];
    if (view) {
      map.flyTo(view.center, view.zoom, { duration: 1 });
    } else if (providers.length) {
      const p = providers[0].coordinates;
      map.flyTo([p.lat, p.lng], DEFAULT_REGION_ZOOM, { duration: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, map]);
  return null;
}


export default function MapPage() {


  // const { providers, counts, updatedAt, filter, setFilter, selected, setSelectedId, status } =
  // useEstablishments();

  const {
  providers,
  counts,
  updatedAt,
  regions,
  region,
  setRegion,
  filter,
  setFilter,
  selected,
  setSelectedId,
  status,
} = useEstablishments();

  if (status === "error") {
    return (
      <p className="p-8 text-center text-danger">
        Die Daten konnten nicht geladen werden.
      </p>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full">
      {status === "loading" && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/70">
          <Spinner />
        </div>
      )}

      {status === "success" && providers.length === 0 && (
        <div className="absolute inset-x-0 top-20 z-[1000] flex justify-center px-3">
          <p className="rounded-lg bg-background px-4 py-2 text-sm text-muted shadow-lg">
            Keine Anbieter für diesen Filter.
          </p>
        </div>
      )}

      {/* Barre de filtre : ancien model avant le centrage par region */} 
      {/* <div className="absolute inset-x-0 top-3 z-[1000] flex justify-center px-3">
        <FilterBar filter={filter} onChange={setFilter}  counts={counts} />
      </div> */}

      {/* Région + filtres */}
        <div className="absolute inset-x-0 top-3 z-[1000] flex flex-col items-center gap-2 px-3">
          <RegionSelect region={region} regions={regions} onChange={setRegion} />
          <FilterBar filter={filter} onChange={setFilter} counts={counts} />
        </div>


        {/* Légende + couleurs */}
      <div className="absolute right-3 top-16 z-[1000] flex flex-col items-end gap-2 md:top-3">
        <Legend counts={counts} />
        <ColorSettings />
      </div>
      {/* <div className="absolute right-3 top-16 z-[1000] md:top-3">
        <Legend  counts={counts} />
      </div> */}

      {/* <MapContainer center={DACH_CENTER} zoom={DACH_ZOOM} className="h-full w-full"> */}
        <MapContainer center={DACH_VIEW.center} zoom={DACH_VIEW.zoom} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((p) => (
          <CategoryMarker
            key={p.id}
            provider={p}
            selected={selected?.id === p.id}
            onSelect={setSelectedId}
          />
        ))}

        <FlyToSelected provider={selected} />
        {/* <MapContainer center={DACH_VIEW.center} zoom={DACH_VIEW.zoom} className="h-full w-full"/> Ajout pour la centralisation par region */}
      </MapContainer>

      {updatedAt && (
        <p className="absolute bottom-2 right-2 z-[1000] rounded bg-background/90 px-2 py-1 text-xs text-muted shadow">

          Daten aktualisiert am{" "}
          {new Date(updatedAt).toLocaleString("de-DE", {
            day: "numeric",
            month: "long",
            year: "numeric",
            // hour: "2-digit",
            // minute: "2-digit",
          })}
        </p>
      )}

      <DetailsPanel provider={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}