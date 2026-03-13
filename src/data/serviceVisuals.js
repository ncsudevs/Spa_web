const DEFAULT_IMAGE = "/placeholder-service.svg";

export function getImageUrl(path) {
  if (!path) return DEFAULT_IMAGE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${import.meta.env.VITE_BASE_API}${path}`;
}

export function mapServiceForUi(service) {
  return {
    ...service,
    category: service.categoryName || "General",
    shortDescription:
      service.description?.slice(0, 90) || "Professional spa service for your wellness journey.",
    imageUrl: getImageUrl(service.imageUrl),
  };
}
