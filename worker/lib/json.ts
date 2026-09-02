/** JSON レスポンス。index.ts と contact.ts の循環 import を避けるため独立ファイルにする */
export const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
