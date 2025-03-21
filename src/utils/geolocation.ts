/**
 * Handles geolocation errors and returns user-friendly error messages
 */
export const handleGeolocationError = (error: GeolocationPositionError): string => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access was denied. Some features may be limited.';
        case error.POSITION_UNAVAILABLE:
            return 'Location information is unavailable. Please try again.';
        case error.TIMEOUT:
            return 'Location request timed out. Please try again.';
        default:
            return 'Unable to get your location. Some features may be limited.';
    }
};

/**
 * Gets the current position with a Promise-based API
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('Geolocation is not supported by your browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}; 