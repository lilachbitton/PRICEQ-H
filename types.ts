// FIX: Removed self-import of `UnitOfMeasure` which was causing a circular dependency and declaration conflict.
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
  signature: string;
}

// FIX: Add shared data structures for proposals.
export interface ProposalData {
  documentId: string;
  leadId: string;
  customerName: string;
  customerAddress: string;
  proposalDate: string;
  workItems: WorkItem[];
  paymentTerms: PaymentTerm[];
  totalProposalAmount: number;
  finalPaymentAmount: number;
  customerType: string;
}

export interface FinalProposalData extends ProposalData {
    clientDetails: ClientDetails;
    clientSignature: string;
}

export interface SubcontractorProposalData {
    documentId: string;
    proposalDate: string;
    workTitle: string;
    projectAddress: string;
    clientName: string;
    subcontractor: SubcontractorDetails;
    workStartDate: string;
    materials: MaterialClause;
    workItems: WorkItem[];
    paymentTerms: PaymentTerm[];
    totalAmount: number;
    subcontractorId: string;
    projectId: string;
}

export interface FinalSubcontractorProposalData extends SubcontractorProposalData {
    signatory: SubcontractorSignatoryDetails;
}