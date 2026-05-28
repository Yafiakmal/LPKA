export interface Taking {
  id: number;
  user_id: number;
  product_id: number;
  amount: number;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
  };
}

export interface TakingsResponse {
  success: boolean;
  message: string;
  data: Taking[];
}

export interface TakingPayload {
  amount: number;
  user_id: number;
  product_id: number;
  description: string;
}
