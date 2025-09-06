import type { ColoniesEndpointResponse } from "@/lib/types";

export async function GET() {
  try {
    const response = await fetch("http://localhost:3000/api/colonies");

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, data } as ColoniesEndpointResponse),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
      } as ColoniesEndpointResponse),
      {
        status: 500,
      }
    );
  }
}
