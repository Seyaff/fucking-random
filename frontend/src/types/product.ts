export interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  unit: string;
  category: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  importedFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnMap {
  [key: string]: string;
}

export interface DetectResult {
  headers: string[];
  columnMap: ColumnMap;
  preview: Array<Record<string, string | number | undefined>>;
  totalRows: number;
}

export interface ImportResult {
  imported: number;
  columnMap: ColumnMap;
  preview: Array<Record<string, string | number | undefined>>;
}
