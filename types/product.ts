export interface Product {
  id: number;
  name: string;
  stock: number;
  unit_id: number;
  borrowed: boolean;
  borrowed_amount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  unit: {
    id: number;
    name: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface ProductPayload {
  name: string;
  stock: number;
  unit_id: number;
}
