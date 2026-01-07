import type { Category } from './category';


export type Supplier = {
  companyName: string;
  supplierPassword: string;
  rfc: string;
  businessTransaction: string;
  fiscalAddress: string;
  commercialEmail: string;
  billingEmail: string;
  supplierPhone: string;
  bankName: string;
  bankAccount: string;
  registeredName: string;
  categories: Partial<Category>[] | string[];
  supplierFile: File[];
  id: string;
}


export type SupplierDTO = {
  companyName: string;
  supplierPassword: string;
  rfc: string;
  businessTransaction: string;
  fiscalAddress: string;
  commercialEmail: string;
  billingEmail: string;
  supplierPhone: string;
  bankName: string;
  bankAccount: string;
  registeredName: string;
  categories: Partial<Category>[] | string[];
  supplierFile: File[];
};

export type KeyofSupplier = keyof SupplierDTO;
