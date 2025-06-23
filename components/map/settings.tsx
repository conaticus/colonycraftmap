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
      <DialogContent className="font-sans sm:max-h-[min(640px,80vh)] sm:max-w-xs [&>button:last-child]:top-3.5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize the map.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <Setting
            label="Show marker names?"
            id="show-marker-names"
          >
            <input
              type="checkbox"
              id="show-marker-names"
              checked={settings.showMarkerNames}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  showMarkerNames: e.target.checked,
                })
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
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <label
        className="text-sm"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
