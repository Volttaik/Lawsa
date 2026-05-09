"use client";
import { useLayoutEffect } from "react";

function getAuthToken(): string | null {
  try {
    return localStorage.getItem("lawsa_auth_token");
  } catch {
    return null;
  }
}

export function FetchInterceptor() {
  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : (input as Request).url;

      const isApiCall = url.startsWith("/api/") || url.includes("/api/");

      if (isApiCall) {
        const token = getAuthToken();
        if (token) {
          const headers = new Headers((init?.headers as HeadersInit) || {});
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          init = { ...init, headers };
        }
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
