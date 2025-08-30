import { apiRequest } from "./queryClient";

// Add authorization header to all requests
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  const token = localStorage.getItem("token");
  
  if (token && init) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
  } else if (token) {
    init = {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  
  return originalFetch.call(this, input, init);
};

export { apiRequest };
