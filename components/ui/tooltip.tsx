import { Tooltip as LeafletTooltip, type TooltipProps } from "react-leaflet";

export function Tooltip(props: TooltipProps) {
  return (
    <LeafletTooltip
      {...props}
      className="!bg-background/50 !p-1 !shadow-none !text-foreground !border-none before:!border-none !leading-none !text-[0.65rem] max-w-24 truncate"
      direction="bottom"
    />
  );
}
