import { memo } from "react";

export const TooltipRow = memo(
  ({ label, value }: { label: string; value: string }) => {
    return (
      <div className="flex justify-between items-center gap-1 tabular-nums">
        <span className="w-1/3 font-medium">{label}</span>
        <span className="text-right text-xs text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap">
          {value}
        </span>
      </div>
    );
  }
);
