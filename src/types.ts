export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
}

export interface CompanyProfile {
  name: string;
  phone: string;
  email: string;
  address?: string;
  taxId?: string; // RUT, CUIT, RFC, NIF, etc.
}

export interface Budget {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  currency: string;
  items: BudgetItem[];
  client: ClientInfo;
  notes: string;
  taxRate: number; // percentage, e.g. 0, 10, 16, 21
  discountRate: number; // percentage
  status?: 'draft' | 'sent' | 'approved';
  createdAt: string;
}

export type CurrencyOption = {
  code: string;
  symbol: string;
  name: string;
};
