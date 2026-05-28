export interface Borrow {
  id: string;
  user_id: number;
  product_id: number;
  amount: number;
  returned: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products: {
    name: string;
    stock: number;
  };
  user: {
    username: string;
  };
}

export interface BorrowResponse {
  success: boolean;
  message: string;
  data: Borrow[];
}

export interface CreateBorrowPayload {
  user_id: number;
  product_id: number;
  amount: number;
  description: string;
}
