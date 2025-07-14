export async function GET() {
  const response = await fetch(
    "https://wiki.colonycraft.org/api/colony-chunks"
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
