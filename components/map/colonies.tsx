"use client";

import { FeatureGroup, Tooltip, Polygon } from "react-leaflet";
import useSWR from "swr";
import { memo, useState, useEffect } from "react";

import type { ColoniesEndpointResponse, ProcessedColony } from "@/lib/types";
import { convertMinecraftToLeaflet } from "@/lib/map";
import { acronym, fetcher } from "@/lib/utils";

import { COLORS } from "@/constants/colors";
import { PLAYER_AVATAR_URL } from "@/constants/player";

import { TooltipRow } from "../tooltip-row";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const COLONIES_API_URL = new URL(
  "/api/colonies",
  process.env.NEXT_PUBLIC_URL
).toString();

const CHUNK_SIZE = 16;

function createColonyPolygon(
  chunks: { x: number; z: number }[]
): [number, number][] {
  const chunkSet = new Set(chunks.map((chunk) => `${chunk.x},${chunk.z}`));

  const edges: Array<{ start: [number, number]; end: [number, number] }> = [];

  for (const chunk of chunks) {
    const xIndex = chunk.x;
    const zIndex = chunk.z;

    // calculate world coordinates of the bottom-left corner of the chunk
    const x = xIndex * CHUNK_SIZE;
    const z = zIndex * CHUNK_SIZE;

    // south edge: if no chunk to the south (zIndex - 1)
    if (!chunkSet.has(`${xIndex},${zIndex - 1}`)) {
      edges.push({
        start: [x, z],
        end: [x + CHUNK_SIZE, z],
      });
    }

    // east edge: if no chunk to the east (xIndex + 1)
    if (!chunkSet.has(`${xIndex + 1},${zIndex}`)) {
      edges.push({
        start: [x + CHUNK_SIZE, z],
        end: [x + CHUNK_SIZE, z + CHUNK_SIZE],
      });
    }

    // north edge: if no chunk to the north (zIndex + 1)
    if (!chunkSet.has(`${xIndex},${zIndex + 1}`)) {
      edges.push({
        start: [x + CHUNK_SIZE, z + CHUNK_SIZE],
        end: [x, z + CHUNK_SIZE],
      });
    }

    // west edge: if no chunk to the west (xIndex - 1)
    if (!chunkSet.has(`${xIndex - 1},${zIndex}`)) {
      edges.push({
        start: [x, z + CHUNK_SIZE],
        end: [x, z],
      });
    }
  }

  if (edges.length === 0) return [];

  const polygon: [number, number][] = [];
  let currentEdge = edges[0];
  polygon.push(currentEdge.start);

  const usedEdges = new Set([0]);

  while (usedEdges.size < edges.length) {
    polygon.push(currentEdge.end);

    const nextEdgeIndex = edges.findIndex(
      (edge, index) =>
        !usedEdges.has(index) &&
        edge.start[0] === currentEdge.end[0] &&
        edge.start[1] === currentEdge.end[1]
    );

    if (nextEdgeIndex === -1) break;

    currentEdge = edges[nextEdgeIndex];
    usedEdges.add(nextEdgeIndex);
  }

  return polygon;
}

export const ColoniesLayer = memo(
  ({ showColonies }: { showColonies: boolean }) => {
    const { data, error, isLoading } = useSWR<ColoniesEndpointResponse>(
      COLONIES_API_URL,
      fetcher,
      {
        fallbackData: { success: false, data: [] } as ColoniesEndpointResponse,
        errorRetryCount: 3,
        isPaused: () => !showColonies,
      }
    );

    const [processedColonies, setProcessedColonies] = useState<
      ProcessedColony[]
    >([]);

    useEffect(() => {
      if (!data || !data.success) return;

      const { data: colonies } = data;

      const getColonySize = (chunkCount: number): string => {
        if (chunkCount <= 3) return "Tiny";
        if (chunkCount <= 5) return "Small";
        if (chunkCount <= 10) return "Medium";
        if (chunkCount <= 20) return "Large";
        if (chunkCount <= 40) return "Very Large";
        if (chunkCount <= 70) return "Huge";
        return "Massive";
      };

      const fetchLeaderName = async (leaderId: string): Promise<string> => {
        try {
          const response = await fetch(
            `https://api.ashcon.app/mojang/v2/user/${leaderId}`
          );
          const { username }: { username: string } = await response.json();
          return username;
        } catch {
          return "Unknown Player";
        }
      };

      const processColonies = async () => {
        const processed = await Promise.all(
          colonies.map(async (colony) => {
            const size = getColonySize(colony.chunks.length);
            const polygonCoords = createColonyPolygon(colony.chunks);

            const leafletCoords = polygonCoords.map(([x, z]) => {
              const leafletPoint = convertMinecraftToLeaflet(x, z);
              return [leafletPoint.lat, leafletPoint.lng] as [number, number];
            });

            const leaderName = await fetchLeaderName(colony.leaderId);

            return {
              ...colony,
              leafletCoords,
              size,
              area: colony.chunks.length * CHUNK_SIZE * CHUNK_SIZE,
              colour: COLORS[colony.colour as keyof typeof COLORS],
              leader: {
                id: colony.leaderId,
                name: leaderName,
                avatar: PLAYER_AVATAR_URL(colony.leaderId),
              },
            };
          })
        );

        setProcessedColonies(processed);
      };

      processColonies();
    }, [data]);

    if (error) {
      console.error(error);
      return <div>Failed to load colonies</div>;
    }

    if (isLoading || !data || !showColonies) return null;

    return (
      <FeatureGroup>
        {processedColonies.map((colony) => (
          <Polygon
            positions={colony.leafletCoords}
            pathOptions={{
              color: colony.colour,
              weight: 1.5,
              fillColor: colony.colour,
              fillOpacity: 0.2,
              interactive: true,
            }}
            key={colony.name}
          >
            <Tooltip
              className="box !w-52 !opacity-100 before:!border-t-background !animate-none"
              direction="top"
              permanent={false}
              sticky
            >
              <TooltipRow
                label="Name"
                value={colony.name}
              />
              <TooltipRow
                label="Leader"
                value={
                  <>
                    <Avatar className="size-3.5">
                      <AvatarImage
                        src={colony.leader.avatar}
                        draggable={false}
                      />
                      <AvatarFallback>
                        {acronym(colony.leader.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{colony.leader.name}</span>
                  </>
                }
              />
              <TooltipRow
                label="Chunks"
                value={String(colony.chunks.length)}
              />
              <TooltipRow
                label="Area"
                value={`${colony.area} m² (${colony.size})`}
              />
            </Tooltip>
          </Polygon>
        ))}
      </FeatureGroup>
    );
  }
);
