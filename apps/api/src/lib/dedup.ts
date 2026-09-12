// Simple deduplication utility using URL and name matching
export function calculateStringSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().trim();
  const aNorm = normalize(a);
  const bNorm = normalize(b);

  if (aNorm === bNorm) return 1;

  // Levenshtein-like distance for fuzzy matching
  const aWords = aNorm.split(/\s+/);
  const bWords = bNorm.split(/\s+/);
  const commonWords = aWords.filter((w) => bWords.includes(w)).length;
  const totalWords = Math.max(aWords.length, bWords.length);

  return totalWords > 0 ? commonWords / totalWords : 0;
}

export function areSimilar(a: string, b: string, threshold = 0.8): boolean {
  return calculateStringSimilarity(a, b) >= threshold;
}
