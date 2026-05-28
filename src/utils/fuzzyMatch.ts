/**
 * Calculates the similarity between two strings using Levenshtein distance.
 * Returns a value between 0 and 1.
 */
export function getSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();

  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}

/**
 * Common synonyms for mapping fields
 */
const SYNONYMS: Record<string, string[]> = {
  code: ['codigo', 'referencia'],
  price: ['precio'],
  stock: ['cantidad', 'existencia', 'stock'],
  description: ['descripcion', 'nombre', 'detalle'],
  supplier: ['proveedor'],
  brand: ['marca'],
};

export interface FuzzyMatchResult {
  targetField: string;
  sourceHeader: string;
  confidence: number;
}

/**
 * Suggests mappings for headers based on target fields.
 */
export function fuzzyMatch(headers: string[], targetFields: string[]): Record<string, string | null> {
  const mappings: Record<string, string | null> = {};

  targetFields.forEach((target) => {
    let bestMatch: string | null = null;
    let highestConfidence = 0;

    headers.forEach((header) => {
      // 1. Direct match
      let confidence = getSimilarity(target, header);

      // 2. Synonym match
      const synonyms = SYNONYMS[target] || [];
      synonyms.forEach((syn) => {
        const synConfidence = getSimilarity(syn, header);
        if (synConfidence > confidence) confidence = synConfidence;
      });

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = header;
      }
    });

    // Only suggest if confidence is > 85% as requested
    if (highestConfidence >= 0.85) {
      mappings[target] = bestMatch;
    } else {
      mappings[target] = null;
    }
  });

  return mappings;
}
