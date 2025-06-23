import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function InlineEdit({
  id,
  name,
  onRename,
}: {
  id: number;
  name: string;
  onRename: (id: number, newName: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [spanWidth, setSpanWidth] = useState(0);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(value.length, value.length);
    }
  }, [isEditing, value.length]);

  /* biome-ignore lint/correctness/useExhaustiveDependencies: not required */
  useEffect(() => {
    if (spanRef.current) {
      setSpanWidth(spanRef.current.getBoundingClientRect().width);
    }
  }, [name, isEditing]);

  function handleSave() {
    if (value !== name) {
      onRename(id, value);
    }

    setIsEditing(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    }
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditing(true);
  }

  const commonClassName =
    "max-w-28 line-clamp-3 field-sizing-content break-all";

  return (
    <>
      {isEditing ? (
        <textarea
          className={cn(
            commonClassName,
            "text-xs text-foreground text-right border-none bg-transparent outline-none p-0 m-0 box-border min-h-0 resize-none"
          )}
          placeholder="Unnamed"
          maxLength={48}
          value={value}
          ref={textareaRef}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: spanWidth > 0 ? spanWidth : "auto",
          }}
        />
      ) : (
        <span
          className={cn(
            commonClassName,
            "text-xs text-muted-foreground text-right cursor-pointer hover:text-foreground transition-colors"
          )}
          ref={spanRef}
          onClick={handleClick}
        >
          {name}
        </span>
      )}
    </>
  );
}
