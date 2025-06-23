import { SettingsIcon } from "lucide-react";
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
  settings,
  setSettings,
}: {
  settings: SettingsType;
  setSettings: (settings: SettingsType) => void;
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
        <div className="flex flex-col">
          <Setting
            label="Show marker names"
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
