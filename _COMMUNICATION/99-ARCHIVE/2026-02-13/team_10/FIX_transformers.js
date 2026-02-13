export const apiToReact = (apiData) => {
  const transform = (obj) => {
    if (Array.isArray(obj)) return obj.map(transform);
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        let value = transform(obj[key]);
        if (key.includes('balance') || key.includes('price') || key.includes('amount')) {
          acc[camelKey] = value !== null ? Number(value) : 0;
        } else { acc[camelKey] = value ?? null; }
        return acc;
      }, {});
    }
    return obj;
  };
  return transform(apiData);
};