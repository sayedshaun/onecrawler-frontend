export interface JwtClaims {
  sub: string;
  email: string;
  user_type: string;
  name: string;
  exp: number;
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function isExpired(claims: JwtClaims): boolean {
  return claims.exp * 1000 <= Date.now();
}
