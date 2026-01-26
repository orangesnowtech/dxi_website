// Helper to get valid env value or fallback
function getEnvValue(key: string, fallback: string): string {
  const value = process.env[key];
  // Return fallback if value is undefined, null, empty string, or only whitespace
  if (!value || value.trim() === '') {
    return fallback;
  }
  return value.trim();
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
