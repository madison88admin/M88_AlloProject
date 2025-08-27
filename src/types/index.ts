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
  brand_classification?: 'Top' | 'Growth' | 'Emerging' | 'Maintain' | 'Divest' | 'Early Engagement' | 'Growth/Divest';
  status?: 'Active' | 'Inactive' | 'In Development' | 'On hold';
  terms_of_shipment?: 'FOB' | 'LDP';
  lead_pbd?: string;
  support_pbd?: string;
  td?: string;
  nyo_planner?: string;
  indo_m88_md?: string;
  m88_qa?: string;
  mlo_planner?: string;
  mlo_logistic?: string;
  mlo_purchasing?: string;
  mlo_costing?: string;
  wuxi_moretti?: string;
  hz_u_jump?: string;
  pt_u_jump?: string;
  korea_mel?: string;
  singfore?: string;
  heads_up?: string;
  hz_pt_u_jump_senior_md?: string;
  pt_ujump_local_md?: string;
  hz_u_jump_shipping?: string;
  pt_ujump_shipping?: string;
  factory?: string;
  allocation?: string;
  [key: string]: any;
}

export interface ColumnVisibility {
  [key: string]: boolean;
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