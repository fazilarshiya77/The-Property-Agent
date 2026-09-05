import type { PropertyType } from './properties';

export type AttributeInputType = 'text' | 'number' | 'select' | 'boolean';

export interface AttributeField {
  key: string;
  label: string;
  input: AttributeInputType;
  unit?: string;
  options?: string[];
  placeholder?: string;
}

// Type-specific attribute fields, shown only for the matching property type.
// Values are stored in Property.attributes as { [key]: string | number | boolean }.
export const ATTRIBUTE_SCHEMA: Record<PropertyType, AttributeField[]> = {
  plot: [
    { key: 'plotArea', label: 'Plot Area', input: 'number', unit: 'sqft' },
    { key: 'dimensions', label: 'Dimensions', input: 'text', placeholder: 'e.g. 30 x 40' },
    { key: 'roadWidth', label: 'Road Width', input: 'text', placeholder: 'e.g. 30 ft' },
    { key: 'cornerProperty', label: 'Corner Property', input: 'boolean' },
    { key: 'gatedLayout', label: 'Gated Layout', input: 'boolean' },
    { key: 'developmentStatus', label: 'Development Status', input: 'select', options: ['Fully Developed', 'Partially Developed', 'Undeveloped'] },
  ],
  land: [
    { key: 'totalLandArea', label: 'Total Land Area', input: 'number', unit: 'acres' },
    { key: 'landType', label: 'Land Type', input: 'select', options: ['Dry Land', 'Wet Land', 'Plantation', 'Mixed'] },
    { key: 'soilType', label: 'Soil Type', input: 'text', placeholder: 'e.g. Red soil, Black soil' },
    { key: 'waterAvailability', label: 'Water Availability', input: 'select', options: ['Available', 'Not Available', 'Seasonal'] },
    { key: 'borewell', label: 'Borewell', input: 'boolean' },
    { key: 'electricity', label: 'Electricity Connection', input: 'boolean' },
    { key: 'existingCrops', label: 'Existing Crops', input: 'text', placeholder: 'e.g. Areca nut, Coffee' },
    { key: 'roadAccess', label: 'Road Access', input: 'boolean' },
    { key: 'fencing', label: 'Fencing', input: 'boolean' },
    { key: 'landUsage', label: 'Land Usage', input: 'select', options: ['Agricultural', 'Farming', 'Investment', 'Plantation'] },
  ],
  farmhouse: [
    { key: 'landArea', label: 'Land Area', input: 'number', unit: 'acres' },
    { key: 'builtUpArea', label: 'Built-up Area', input: 'number', unit: 'sqft' },
    { key: 'swimmingPool', label: 'Swimming Pool', input: 'boolean' },
    { key: 'garden', label: 'Garden', input: 'boolean' },
    { key: 'borewell', label: 'Borewell', input: 'boolean' },
    { key: 'waterSource', label: 'Water Source', input: 'text', placeholder: 'e.g. Borewell + Municipal' },
    { key: 'constructionYear', label: 'Construction Year', input: 'number' },
  ],
  commercial: [
    { key: 'builtUpArea', label: 'Built-up Area', input: 'number', unit: 'sqft' },
    { key: 'frontageWidth', label: 'Frontage Width', input: 'text', placeholder: 'e.g. 40 ft' },
    { key: 'washrooms', label: 'Washrooms', input: 'number' },
    { key: 'powerLoad', label: 'Power Load', input: 'text', unit: 'kVA' },
    { key: 'fireSafetyCompliance', label: 'Fire Safety Compliance', input: 'boolean' },
  ],
  // Rent / Sale / Lease are used generically for houses & apartments — a shared
  // residential attribute set covers both without over-fitting to one sub-type.
  rent: [
    { key: 'totalFloors', label: 'Total Floors in Building', input: 'number' },
    { key: 'ageOfProperty', label: 'Age of Property', input: 'text', placeholder: 'e.g. 5 years' },
    { key: 'balcony', label: 'Balcony', input: 'boolean' },
  ],
  sale: [
    { key: 'totalFloors', label: 'Total Floors in Building', input: 'number' },
    { key: 'ageOfProperty', label: 'Age of Property', input: 'text', placeholder: 'e.g. 5 years' },
    { key: 'balcony', label: 'Balcony', input: 'boolean' },
  ],
  lease: [
    { key: 'totalFloors', label: 'Total Floors in Building', input: 'number' },
    { key: 'ageOfProperty', label: 'Age of Property', input: 'text', placeholder: 'e.g. 5 years' },
    { key: 'balcony', label: 'Balcony', input: 'boolean' },
  ],
};
