const DEFAULTS = {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
};

export default async (url, props = {}) => {
  const response = await fetch(url, { ...DEFAULTS, ...props });

  return response ? response.json() : undefined;
};
