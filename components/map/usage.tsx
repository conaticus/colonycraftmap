import {
  ArrowUpRightIcon,
  CopyIcon,
  SaveIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Control from "react-leaflet-custom-control";

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

export function Usage() {
  const [isOpen, setOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setOpen}
    >
      <DialogTrigger>
        <Control
          container={{
            className:
              "tabular-nums size-11 -translate-x-0.5 flex flex-col rounded-[3px] flex justify-center items-center ring-2 ring-[#0003]",
          }}
          position="topright"
          // prepend
        >
          <span className="text-xl font-bold select-none">?</span>
        </Control>
      </DialogTrigger>
      <DialogContent className="font-sans sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How do I use the map?</DialogTitle>
          <DialogDescription>
            Some information about how to use the map.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col prose-headings:mb-3 prose-headings:mt-0 prose-p:mt-0 prose-p:mb-3 prose-ul:mb-3 prose prose-sm prose-invert [&_svg]:size-4 [&_li]:flex [&_li]:gap-2 [&_li]:items-center [&_svg]:inline [&_ul]:list-none [&_ul]:pl-0">
          <h2>Coordinates</h2>
          <p>
            Wherever you move the cursor, the corresponding coordinates are
            shown in the bottom left.
          </p>
          <p>
            Additionally, you can enter coordinates in the two input fields at
            the bottom left to locate them on the map with a marker.
          </p>
          <h2>Markers</h2>
          <p>
            Click and drag to move a marker. Click on a marker to view
            information about it and to edit it. Clicking on the marker you'll
            see a list of available actions.
          </p>
          <h3>Actions</h3>
          <ul className="list-none">
            <li>
              <Share2Icon />
              Copy marker coordinates as URL
            </li>
            <li>
              <CopyIcon />
              Copy coordinates (e.g X 134, Z 567)
            </li>
            <li>
              <SaveIcon /> Save marker locally
            </li>
            <li>
              <Trash2Icon /> Remove marker
            </li>
          </ul>
          <h2>Ores</h2>
          <p>
            In the top right of the map, you'll see a button which when hovered
            will show a list of ore layers. You can select them to show or hide
            them.
          </p>
          <h2>Other</h2>
          <p>
            For information about the server in general, visit{" "}
            <Link
              className="inline-flex gap-1 items-center"
              href="https://colonycraft.org"
              target="_blank"
            >
              colonycraft.org
              <ArrowUpRightIcon className="!size-3.5" />
            </Link>
            .
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
