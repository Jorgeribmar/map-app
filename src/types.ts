export interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
    place_id: string;
    type?: string;
    category?: string;
    importance?: number;
    address?: {
        city?: string;
        country?: string;
    };
    timestamp?: number;
}
