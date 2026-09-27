export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    // Laravel stores files without /storage/ prefix, add it if needed
    if (path.startsWith('/storage/')) {
        return `${baseUrl}${path}`;
    }
    if (path.startsWith('storage/')) {
        return `${baseUrl}/${path}`;
    }
    if (path.startsWith('/')) {
        return `${baseUrl}${path}`;
    }
    return `${baseUrl}/storage/${path}`;
};
