export function requireAdminToken(headers: Headers) {
  const expected = process.env.ADMIN_TOKEN || "";
  const got = headers.get("authorization")?.replace("Bearer ", "") || "";
  if (!expected || got !== expected) {
    return false;
  }
  return true;
}
