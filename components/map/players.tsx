import useSWR from "swr";
import { motion } from "motion/react";

import { acronym, fetcher } from "@/lib/utils";
import type { PlayerInfo } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Players() {
  const { data, error, isLoading } = useSWR<PlayerInfo>(
    "/api/players",
    fetcher
  );

  if (error) return null;
  if (isLoading || !data) return null;

  // if there are no players, don't show anything
  if (data.online === 0) return null;

  return (
    <motion.div
      className="w-48 flex flex-col box p-2 gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col">
        <span className="font-medium text-sm">Players Online</span>
        <span className="text-xs text-muted-foreground">
          {data.online}/{data.max}
        </span>
      </div>
      <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
        {data.players.map((player) => (
          <div
            className="flex items-center gap-1.5 text-xs"
            key={player.uuid}
          >
            <Avatar>
              <AvatarImage
                src={player.avatar}
                draggable={false}
              />
              <AvatarFallback>{acronym(player.name)}</AvatarFallback>
            </Avatar>
            <span>{player.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
