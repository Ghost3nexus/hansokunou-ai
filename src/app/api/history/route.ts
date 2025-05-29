export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify({ items: [] }), {
    headers: { 'content-type': 'application/json' },
  });
}
