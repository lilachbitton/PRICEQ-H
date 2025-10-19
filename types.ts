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