// Vue par défaut : toute la région DACH
export const DACH_VIEW = { center: [51.2, 10.4], zoom: 6 }; 
// Centre de chaque ville (clé = valeur du champ "region")
export const REGION_VIEWS = {
    Berlin: { center: [52.52, 13.405], zoom: 11 },
    Hamburg: { center: [53.5511, 9.9937], zoom: 11 },
    München: { center: [48.1351, 11.582], zoom: 11 },
    Köln: { center: [50.9375, 6.9603], zoom: 11 },
    Frankfurt: { center: [50.1109, 8.6821], zoom: 11 },
    Stuttgart: { center: [48.7758, 9.1829], zoom: 11 },
    Düsseldorf: { center: [51.2277, 6.7735], zoom: 11 },
    Bremen: { center: [53.0793, 8.8017], zoom: 11 },
    Hannover: { center: [52.3759, 9.732], zoom: 11 },
    Nürnberg: { center: [49.4521, 11.0767], zoom: 11 },
    Dresden: { center: [51.0504, 13.7373], zoom: 11 },
    Leipzig: { center: [51.3397, 12.3731], zoom: 11 },
};

// Zoom par défaut si la ville n'est pas listée (on centre alors sur ses établissements)
export const DEFAULT_REGION_ZOOM = 11;