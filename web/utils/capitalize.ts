export function capitalize(s: string) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function capitalizeViaSeparator(s: string, sep: string) {
  return s.split(sep).map(capitalize).join(' ');
}
