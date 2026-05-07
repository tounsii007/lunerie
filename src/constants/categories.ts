export const PLACE_CATEGORIES = [
  'viewpoint',
  'photo_spot',
  'nature',
  'beach',
  'mountain',
  'lake',
  'waterfall',
  'historic',
  'park',
  'cultural',
  'hidden_gem',
] as const;

export const CATEGORY_COLORS: Record<(typeof PLACE_CATEGORIES)[number], string> = {
  viewpoint: '#f59e0b',
  photo_spot: '#fb7185',
  nature: '#34d399',
  beach: '#38bdf8',
  mountain: '#a78bfa',
  lake: '#22d3ee',
  waterfall: '#60a5fa',
  historic: '#f97316',
  park: '#4ade80',
  cultural: '#e879f9',
  hidden_gem: '#facc15',
};
