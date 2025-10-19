export enum UnitOfMeasure {
  UNIT = "יח'",
  METER = 'מטר',
  SQUARE_METER = 'מ"ר',
  GENERAL = 'כללי',
}

export interface WorkItem {
  id: string;
  description: string;
  unit: UnitOfMeasure;
  quantity: number;
  price: number;
}

export interface PaymentTerm {
  id: string;
  percentage: number;
  milestone: string;
}

export interface ClientDetails {
  firstName: string;
  lastName: string;
  idNumber: string;
}

// FIX: Added missing type definitions.
export interface SubcontractorDetails {
  name: string;
  idNumber: string;
  address: string;
  managerName: string;
}

export interface MaterialClause {
  included: boolean;
  provider: 'main_contractor' | 'sub_contractor';
}

export interface SubcontractorSignatoryDetails {
  fullName: string;
  idNumber: string;
}
