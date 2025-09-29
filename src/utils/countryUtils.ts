
// A simplified list for demonstration. A real app would use a library.
const countryMap: { [key: string]: string } = {
  'USA': 'US', 'United States': 'US', 'United States of America': 'US',
  'Thailand': 'TH',
  'Portugal': 'PT',
  'Italy': 'IT',
  'Iceland': 'IS',
  'Netherlands': 'NL',
  'CA': 'US' // Simple mapping for "CA, USA"
};

// Function to get country name from a location string
export const getCountryFromLocation = (location: string): string | null => {
  const parts = location.split(',').map(p => p.trim());
  const countryPart = parts[parts.length - 1];

  for (const countryName in countryMap) {
    if (countryPart.toLowerCase().includes(countryName.toLowerCase())) {
      // Find the display name from the map's keys using the code
      const code = countryMap[countryName];
      const displayName = Object.keys(countryMap).find(key => countryMap[key] === code && key.length > 2) || Object.keys(countryMap).find(key => countryMap[key] === code);
      return displayName || null;
    }
  }
  
  if (countryMap[countryPart]) {
    return countryPart;
  }
  return null;
};

// Function to convert country name to a flag image URL
export const getFlagUrl = (countryName: string): string | null => {
  const countryCode = countryMap[countryName];
  if (!countryCode) return null;
  // Using flagcdn.com for flag images, w40 specifies a width of 40px
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};
