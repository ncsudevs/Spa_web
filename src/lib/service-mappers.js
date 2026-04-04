const DEFAULT_IMAGE = '/placeholder-service.svg';

// Converts relative image paths from the API into a full URL usable by the browser.
export function getServiceImageUrl(path) {
  if (!path) return DEFAULT_IMAGE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${import.meta.env.VITE_BASE_API}${path}`;
}

// Normalizes raw service data so customer and admin screens can consume a stable UI shape.
export function mapServiceForUi(service) {
  return {
    ...service,
    category: service.categoryName || 'General',
    shortDescription:
      service.description?.slice(0, 90) ||
      'Professional spa service for your wellness journey.',
    imageUrl: getServiceImageUrl(service.imageUrl),
    status: (service.status || 'ACTIVE').toUpperCase(),
  };
}

// Maps every service item in a collection with the same UI normalization rules.
export function mapServiceCollectionForUi(services) {
  return (services || []).map(mapServiceForUi);
}

// Helper used when UI logic needs to explicitly check customer visibility.
export function isServiceVisible(service) {
  return (service?.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
}
