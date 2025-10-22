const CSRF_COOKIE = "kf.csrf";
export const CSRF_HEADER = "x-csrf-token";

export const readCsrfToken = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${CSRF_COOKIE}=`));

  if (!match) {
    return null;
  }

  const [, value] = match.split("=");

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const csrfHeader = (): Record<string, string> => {
  const token = readCsrfToken();
  return token ? { [CSRF_HEADER]: token } : {};
};
