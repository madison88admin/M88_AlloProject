export interface Column {
    key: string;
    label: string;
    type: 'text' | 'select' | 'boolean';
    options?: string[];
    required?: boolean;
    width?: string;
  }
 
  export interface DataRecord {
    id: number;
    all_brand: string;
    brand_visible_to_factory?: string;
    brand_classification?: 'Top' | 'Growth' | 'Emerging' | 'Maintain' | 'Divest';
    status?: 'Active' | 'Inactive' | 'In Development' | 'On hold';
    terms_of_shipment?: 'FOB' | 'LDP';
    lead_pbd?: string;
    support_pbd?: string;
    [key: string]: any;
  }
 
  export interface Filters {
    status: string;
    brand_classification: string;
    terms_of_shipment: string;
  }
 
  export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc' | '';
  }
 
  export interface Analytics {
    total: number;
    active: number;
    topTier: number;
    filtered: number;
  }