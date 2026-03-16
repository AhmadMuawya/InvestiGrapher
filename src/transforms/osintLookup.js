// OSINT Industries lookups — calls /api/osint (Vite proxy)
// Extracts found modules and flattens spec_format into dynamic attributes

async function osintRequest(type, query) {
  const res = await fetch('/api/osint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      query,
      timeout: '60',
      exact_match: 'true',
      premium: 'false',
      premium_modules_only: 'false',
    }),
  });

  if (!res.ok) throw new Error(`OI API returned ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // Keep only "found" results
  return data
    .filter((item) => item.status === 'found')
    .map((item) => {
      const record = {
        module: item.module ? item.module.charAt(0).toUpperCase() + item.module.slice(1) : '',
        category: item.category?.name || '',
        status: item.status || '',
      };

      // Extract simple values from spec_format[0]
      const spec = item.spec_format?.[0];
      if (spec) {
        for (const [key, entry] of Object.entries(spec)) {
          if (key === 'platform_variables') continue;
          const val = entry?.value;
          if (val === undefined || val === null) continue;
          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            record[key] = String(val);
          }
        }
      }

      return record;
    });
}

function createLookup(type, queryExtractor) {
  return async (attributes) => {
    const query = queryExtractor(attributes);
    if (!query) return [];
    return osintRequest(type, query);
  };
}

export const emailLookup = createLookup('email', (a) => (a.email || '').trim());

export const nameLookup = createLookup('name', (a) => {
  const first = (a.first_name || '').trim();
  const last = (a.last_name || '').trim();
  if (first && last) return `${first} ${last}`;
  return first || last || '';
});

export const usernameLookup = createLookup('username', (a) => (a.username || '').trim());

export const phoneLookup = createLookup('phone', (a) => (a.phone_number || '').trim());
