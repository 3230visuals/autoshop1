export const parseVehicleName = (name: string): { year: string; make: string; model: string } => {
    // Expected format: "Year Make Model..." (e.g., "2022 Ford Mustang")
    const parts = name.trim().split(' ');

    // Check if the first part is a 4-digit year
    const hasYear = parts[0] && /^\d{4}$/.test(parts[0]);

    if (hasYear) {
        return {
            year: parts[0],
            make: parts[1] || '',
            model: parts.slice(2).join(' ') || ''
        };
    }

    // Fallback if no year found
    return {
        year: '',
        make: parts[0] || '',
        model: parts.slice(1).join(' ') || ''
    };
};
