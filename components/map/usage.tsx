import {
  ArrowUpRightIcon,
  CopyIcon,
  LayersIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
      modal
    >
      <DialogTrigger className="size-11 flex flex-col justify-center items-center box">
        <span className="text-xl font-bold select-none">?</span>
      </DialogTrigger>
      <DialogContent className="font-sans sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How do I use the map?</DialogTitle>
          <DialogDescription>
            Some information about how to use the map.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col prose-headings:mb-3 prose-headings:mt-0 prose-p:mt-0 prose-p:mb-3 prose-ul:mb-3 prose prose-sm prose-invert [&_svg]:size-3.5 [&_li]:flex [&_li]:gap-2 [&_li]:items-center [&_svg]:inline [&_ul]:list-none [&_ul]:pl-0 [&_span]:size-5 [&_span]:bg-secondary [&_span]:rounded-sm [&_span]:inline-flex [&_span]:justify-center [&_span]:items-center [&_a]:hover:opacity-80 [&_a]:transition-opacity">
          <h2>Joining the server</h2>
          <p>
            You can join the server using <b>mc.colonycraft.org</b> and
            Minecraft version <b>1.21.5</b>.
          </p>
          <h2>Coordinates</h2>
          <p>
            Wherever you move the cursor, the corresponding coordinates are
            shown in the bottom left.
          </p>
          <p>
            You can find your current coordinates in-game by pressing the{" "}
            <kbd>F3</kbd> key and checking the top left of the screen.
          </p>
          <p>
            Additionally, you can enter coordinates in the two input fields at
            the bottom left to locate them on the map with a marker.
          </p>
          <h2>Markers</h2>
          <p>
            Click and drag to move a marker. Click on a marker to view
            information about it and to edit it. Clicking on the marker, you'll
            see a list of available actions.
          </p>
          <h3>Actions</h3>
          <ul className="list-none">
            <li>
              <span>
                <Share2Icon />
              </span>
              Copy marker coordinates as URL
            </li>
            <li>
              <span>
                <CopyIcon />
              </span>
              Copy coordinates (e.g X 134, Z 567)
            </li>
            <li>
              <span>
                <Trash2Icon />
              </span>
              Remove marker
            </li>
          </ul>
          <h2>Ores</h2>
          <p>
            In the top right, you'll see a button with an icon of
            <span className="mx-1">
              <LayersIcon />
            </span>
            which when hovered over, will show a list of ore layers. You can
            select them to show or hide them. Ores are covered in greater detail
            in the{" "}
            <Link
              className="inline-flex gap-1 items-center"
              href="https://colonycraft.org/docs/ore-spawns#special-ores"
              target="_blank"
            >
              wiki
              <ArrowUpRightIcon />
            </Link>
            .
          </p>
          <h2>Colonies</h2>
          <p>
            By default, you'll see colored rectangles representing colonies on
            the map. Hovering over a colony will show information about it.
          </p>
          <h2>Settings</h2>
          <p>
            In the bottom right (just below the button you've just clicked),
            you'll see a button with a gear icon, which will open the settings
            window, where you can customize the map to your liking.
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
              <ArrowUpRightIcon />
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
