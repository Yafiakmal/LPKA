"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/fetch";
import { Product } from "@/types/product";

const fetcher = async (url: string): Promise<Product[]> => {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data produk");
  const json = await res.json();
  return json.data;
};

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    "/api/products",
    fetcher,
  );

  return {
    products: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
