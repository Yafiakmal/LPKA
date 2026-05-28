"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/fetch";
import { TakingsResponse, Taking } from "@/types/taking";

const fetcher = (url: string): Promise<TakingsResponse> =>
  apiFetch(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data taking");
    return res.json();
  });

export function useTakings() {
  const { data, error, isLoading, mutate } = useSWR<TakingsResponse>(
    "/api/takings",
    fetcher,
  );

  return {
    takings: data?.data ?? ([] as Taking[]),
    isLoading,
    isError: !!error,
    mutate,
  };
}
