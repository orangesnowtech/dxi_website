// Helper to get valid env value or fallback
function getEnvValue(key: string, fallback: string): string {
  const value = process.env[key];
  // Return fallback if value is undefined, null, empty string, or only whitespace
  if (!value || value.trim() === '') {
    return fallback;
  }
  const trimmed = value.trim();
  
  // For projectId, validate it only contains allowed characters
  if (key === 'NEXT_PUBLIC_SANITY_PROJECT_ID') {
    // Sanity projectId can only contain a-z, 0-9, and dashes
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      console.warn(`Invalid projectId format in ${key}: "${trimmed}". Using fallback.`);
      return fallback;
    }
  }
  
  return trimmed;
}

export const apiVersion = getEnvValue(
  'NEXT_PUBLIC_SANITY_API_VERSION',
  '2025-12-02'
)

export const dataset = getEnvValue(
  'NEXT_PUBLIC_SANITY_DATASET',
  'production'
)

export const projectId = getEnvValue(
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'ece1ws9f'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === '') {
    throw new Error(errorMessage)
  }

  return v
}
