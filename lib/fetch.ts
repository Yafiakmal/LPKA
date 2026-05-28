// lib/fetch.ts
// Wrapper fetch untuk semua API call di client side.
// Otomatis redirect ke /login jika token expired (401).

type FetchOptions = RequestInit & {
  // Opsional: skip redirect ke login (misal untuk halaman publik)
  skipAuthRedirect?: boolean;
};

export async function apiFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { skipAuthRedirect = false, ...fetchOptions } = options;

  const res = await fetch(url, fetchOptions);

  if (res.status === 401 && !skipAuthRedirect) {
    const redirect = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?redirect=${redirect}`;
  }

  return res;
}

// Helper untuk JSON response — throw jika tidak ok
export async function apiFetchJson<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const res = await apiFetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok && res.status !== 401) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message ?? `Request gagal: ${res.status}`);
  }

  return res.json();
}
