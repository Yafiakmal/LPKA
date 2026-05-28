"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/fetch";
import { UnitsResponse, Unit } from "@/types/unit";

const fetcher = (url: string): Promise<UnitsResponse> =>
  apiFetch(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data unit");
    return res.json();
  });

export function useUnits() {
  const { data, error, isLoading, mutate } = useSWR<UnitsResponse>(
    "/api/units",
    fetcher,
  );

  return {
    units: data?.data ?? ([] as Unit[]),
    isLoading,
    isError: !!error,
    mutate,
  };
}
