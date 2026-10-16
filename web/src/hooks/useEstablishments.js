import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchProviders } from "../services/api";

const REFRESH_MS = 5 * 60 * 1000; // rafraîchissement toutes les 5 minutes

export default function useEstablishments() {
    const [providers, setProviders] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [filter, setFilter] = useState("All");
    const [selectedId, setSelectedId] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | success | error

    const [region, setRegion] = useState("All");  // Gestion de la region ou a ete collecter les informations

    const lastUpdate = useRef(null); // évite de re-render si rien n'a changé

    const load = useCallback(async (signal) => {
        try {
        const data = await fetchProviders(signal);
        if (data.updated_at !== lastUpdate.current) {
            lastUpdate.current = data.updated_at;
            setProviders(data.providers);
            setUpdatedAt(data.updated_at);
        }
        setStatus("success");
        } catch (err) {
        if (err.name === "AbortError") return;
        // En cas d'échec d'un rafraîchissement, on garde les données déjà affichées
        setStatus((s) => (s === "success" ? s : "error"));
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);

        // Rafraîchissement périodique
        const timer = setInterval(() => load(controller.signal), REFRESH_MS);

        // Rafraîchissement au retour sur l'onglet
        const onVisible = () => {
        if (document.visibilityState === "visible") load(controller.signal);
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
        controller.abort();
        clearInterval(timer);
        document.removeEventListener("visibilitychange", onVisible);
        };
    }, [load]);

    // Se qui a ete utiliser avant d'ajouter la deduction de la region

    // const filtered = useMemo(
    //     () => (filter === "All" ? providers : providers.filter((p) => p.category === filter)),
    //     [providers, filter]
    // );

    // a ete remplaser par ceci : 
    // Start -------------

    // Établissements de la région choisie (base des compteurs)
    const inRegion = useMemo(
    () => (region === "All" ? providers : providers.filter((p) => p.region === region)),
    [providers, region]
    );

    const filtered = useMemo(
    () => (filter === "All" ? inRegion : inRegion.filter((p) => p.category === filter)),
    [inRegion, filter]
    );

    // Liste des régions présentes dans les données
    const regions = useMemo(
    () => [...new Set(providers.map((p) => p.region).filter(Boolean))].sort(),
    [providers]
    );

    // End ----


    const selected = useMemo(
        () => filtered.find((p) => p.id === selectedId) ?? null,
        [filtered, selectedId]
    );

    //  Element utilisé avant le calcul de la region

    // const counts = useMemo(() => {
    //     const byCategory = {};
    //     providers.forEach((p) => {
    //     byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
    //     });
    //     return { total: providers.length, byCategory };
    // }, [providers]);

    //  a ete remplacer par :
    // Start ------

    const counts = useMemo(() => {
    const byCategory = {};
    inRegion.forEach((p) => {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
    });
    return { total: inRegion.length, byCategory };
    }, [inRegion]);

    // End ------

    return {
        providers: filtered,
        counts,
        updatedAt,
        filter,
        setFilter,
        selected,
        setSelectedId,
        status,
        regions, region, setRegion   // On ete ajouter pour la deduction de la region
    };
}
















// import { useEffect, useMemo, useState } from "react";

// export default function useEstablishments() {
//     const [providers, setProviders] = useState([]);
//     const [filter, setFilter] = useState("All");
//     const [selectedId, setSelectedId] = useState(null);
//     const [status, setStatus] = useState("loading"); // loading | success | error

//   // Chargement du fichier JSON (placé dans public/data/providers.json)
//     useEffect(() => {
//         fetch("/data/providers.json")
//         .then((res) => {
//             if (!res.ok) throw new Error("Chargement impossible");
//             return res.json();
//         })
//         .then((data) => {
//             setProviders(data.providers);
//             setStatus("success");
//         })
//         .catch(() => setStatus("error"));
//     }, []);

//     // Liste filtrée selon la catégorie choisie
//     const filtered = useMemo(
//         () =>
//         filter === "All"
//             ? providers
//             : providers.filter((p) => p.category === filter),
//         [providers, filter]
//     );

//     // Établissement sélectionné (null s'il n'est plus dans le filtre)
//     const selected = useMemo(
//         () => filtered.find((p) => p.id === selectedId) ?? null,
//         [filtered, selectedId]
//     );

//     const counts = useMemo(() => {
//     const byCategory = {};
//     providers.forEach((p) => {
//         byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
//     });
//     return { total: providers.length, byCategory };
//     }, [providers]);

//         return { providers: filtered, counts, filter, setFilter, selected, setSelectedId, status };
//     }