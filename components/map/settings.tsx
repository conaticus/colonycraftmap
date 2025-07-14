import { SettingsIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type { Settings as SettingsType } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

export function Settings({
  markersLength,
  settings,
  setSettings,
  removeMarkers,
}: {
  markersLength: number;
  settings: SettingsType;
  setSettings: (settings: SettingsType) => void;
  removeMarkers: () => void;
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setOpen}
      modal
    >
      <DialogTrigger className="size-11 flex flex-col justify-center items-center box">
        <SettingsIcon className="size-5" />
      </DialogTrigger>
      <DialogContent className="font-sans sm:max-h-[min(640px,80vh)] sm:max-w-md [&>button:last-child]:top-3.5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize the map to your liking.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Setting
            label="Show Marker Names"
            description="Show the name of the marker beneath the marker."
            id="show-marker-names"
          >
            <Switch
              id="show-marker-names"
              checked={settings.showMarkerNames}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showMarkerNames: checked })
              }
            />
          </Setting>
          <Setting
            label="Show Colonies"
            description="Show the colonies on the map."
            id="show-colonies"
          >
            <Switch
              id="show-colonies"
              checked={settings.showColonies}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showColonies: checked })
              }
            />
          </Setting>
          <Setting
            label="Show Transportation"
            description="Show the transportation infrastructure on the map."
            id="show-transportation"
          >
            <Switch
              id="show-transportation"
              checked={settings.showTransportation}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showTransportation: checked })
              }
            />
          </Setting>
          <Setting
            label="Remove markers"
            description="Delete every single marker on the map that you created."
            id="remove-markers"
          >
            <Button
              className="size-7"
              variant="destructive"
              size="xs"
              id="remove-markers"
              onClick={removeMarkers}
              disabled={markersLength === 0}
            >
              <Trash2Icon />
            </Button>
          </Setting>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Setting({
  label,
  description,
  id,
  children,
}: {
  label: string;
  description: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex flex-col w-2/3">
        <label
          className="text-sm font-medium"
          htmlFor={id}
        >
          {label}
        </label>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
