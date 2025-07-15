import type { Colony } from "@/lib/types";

export type ColoniesEndpointResponse =
  | {
      success: true;
      data: Colony[];
    }
  | {
      success: false;
      message: string;
      data: [];
    };

export async function GET() {
  try {
    const response = await fetch(
      "https://wiki.colonycraft.org/api/colony-chunks"
    );

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
