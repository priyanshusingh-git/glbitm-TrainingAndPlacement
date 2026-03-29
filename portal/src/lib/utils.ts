import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { API_BASE_URL } from '@/lib/api'

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string | undefined {
 if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("https")) return path;
  if (path.startsWith("data:")) return path;
  if (path.startsWith("/api/files")) return path;

 // Ensure API_BASE_URL doesn't end with a slash
 const apiUrl = API_BASE_URL.replace(/\/+$/, '');

 // Ensure path starts with a single slash
 const cleanPath = path.startsWith('/') ? path : `/${path}`;

 return `${apiUrl}${cleanPath}`;
}
