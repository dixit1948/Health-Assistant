import { MEDICINE_DATABASE } from '../data/medicines';

/**
 * Levenshtein distance — measures how many edits needed to transform word A into B
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Validate and match a medicine name against the 250-medicine database.
 * Returns: { matched: string|null, status: 'valid'|'fuzzy'|'invalid', original: string }
 */
export function validateMedicine(input) {
  if (!input) return { matched: null, status: 'invalid', original: input };

  const inputLower = input.trim().toLowerCase();

  // Exact match (case insensitive)
  const exactMatch = MEDICINE_DATABASE.find(
    m => m.toLowerCase() === inputLower
  );
  if (exactMatch) return { matched: exactMatch, status: 'valid', original: input };

  // Contains match (e.g. "dolo" matches "Dolo 650")
  const containsMatch = MEDICINE_DATABASE.find(
    m => m.toLowerCase().includes(inputLower) || inputLower.includes(m.toLowerCase())
  );
  if (containsMatch) return { matched: containsMatch, status: 'fuzzy', original: input };

  // Fuzzy match via Levenshtein
  let bestMatch = null;
  let minDist = Infinity;
  for (const med of MEDICINE_DATABASE) {
    const dist = levenshtein(inputLower, med.toLowerCase());
    if (dist < minDist) {
      minDist = dist;
      bestMatch = med;
    }
  }

  // Threshold: allow up to 4 character edits for fuzzy
  if (minDist <= 4) return { matched: bestMatch, status: 'fuzzy', original: input };

  return { matched: null, status: 'invalid', original: input };
}

/**
 * Validate an array of medicines from AI output
 */
export function validateMedicines(medicines = []) {
  return medicines.map(med => ({
    ...med,
    validation: validateMedicine(med.name)
  }));
}
