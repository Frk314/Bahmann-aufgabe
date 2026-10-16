import normalizeProvider from "../utils/normalizeProvider";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchProviders(signal) {
    const res = await fetch(`${BASE_URL}/api/providers`, { signal });
    if (!res.ok) throw new Error(`Erreur API (${res.status})`);

    const data = await res.json();
    if (!Array.isArray(data.providers)) throw new Error("Format de réponse invalide");

    return {
        ...data,
        providers: data.providers.map(normalizeProvider).filter(Boolean),
    };
}








// const BASE_URL = import.meta.env.VITE_API_URL;

// export async function fetchProviders(signal) {
//     const res = await fetch(`${BASE_URL}/api/providers`, { signal });
//     if (!res.ok) throw new Error(`Erreur API (${res.status})`);

//     const data = await res.json();
//     if (!Array.isArray(data.providers)) throw new Error("Format de réponse invalide");

//     return data; // { providers, updated_at }
// }