import { memo } from "react";

export const TooltipRow = memo(
  ({ label, value }: { label: string; value: string | React.ReactNode }) => {
    return (
      <div className="flex justify-between items-center gap-1 tabular-nums">
        <span className="w-1/3 font-medium">{label}</span>
        <span className="text-right text-xs text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap flex items-center gap-1.5">
          {value}
        </span>
      </div>
    );
  }
);
