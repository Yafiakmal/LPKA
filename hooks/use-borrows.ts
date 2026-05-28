"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/fetch";
import { BorrowResponse, Borrow } from "@/types/borrow";

const fetcher = (url: string): Promise<BorrowResponse> =>
  apiFetch(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data borrowing");
    return res.json();
  });

export function useBorrows() {
  const { data, error, isLoading, mutate } = useSWR<BorrowResponse>(
    "/api/borrows",
    fetcher,
  );

  return {
    borrows: data?.data ?? ([] as Borrow[]),
    isLoading,
    isError: !!error,
    mutate,
  };
}
