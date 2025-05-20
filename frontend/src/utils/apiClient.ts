export type ApiResponseType = 'json' | 'blob';

export interface ApiFetchOptions extends RequestInit {
  responseType?: ApiResponseType;
}

export async function apiFetch<T>(url: string, options?: ApiFetchOptions): Promise<T> {
  const { responseType = 'json', ...init } = options || {};
  const res = await fetch(url, { ...init, credentials: 'include' });
  
  if (res.status === 401) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('Unauthorized');
  }
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  
  if (responseType === 'blob') {
    return res.blob() as unknown as T;
  }
  
  return res.json();
}
