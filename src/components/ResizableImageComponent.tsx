"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function ResizableImageComponent({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const img = (e.currentTarget as HTMLElement)
      .closest("[data-image-node]")
      ?.querySelector("img");
    if (!img) return;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner.includes("e")) newWidth = Math.max(60, startWidth + dx);
      if (corner.includes("w")) newWidth = Math.max(60, startWidth - dx);
      if (corner.includes("s")) newHeight = Math.max(40, startHeight + dy);
      if (corner.includes("n")) newHeight = Math.max(40, startHeight - dy);

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const cornerClass = (corner: string) => {
    const base =
      "absolute w-3 h-3 bg-white border-2 border-[var(--accent)] rounded-sm shadow-sm z-10";
    const vert = corner.includes("n") ? "top-0 -mt-1.5" : "bottom-0 -mb-1.5";
    const horiz = corner.includes("w") ? "left-0 -ml-1.5" : "right-0 -mr-1.5";
    const cursor = `cursor-${corner}-resize`;
    return `${base} ${vert} ${horiz} ${cursor}`;
  };

  return (
    <NodeViewWrapper
      data-image-node
      data-drag-handle
      className={`relative inline-block max-w-full leading-none cursor-grab active:cursor-grabbing ${
        selected ? "ring-2 ring-[var(--accent)] ring-offset-2 rounded-lg" : ""
      }`}
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? ""}
        width={node.attrs.width ?? undefined}
        height={node.attrs.height ?? undefined}
        className="max-w-full h-auto rounded-lg select-none"
        draggable={false}
      />
      {selected && ["se", "sw", "ne", "nw"].map((corner) => (
        <span
          key={corner}
          className={cornerClass(corner)}
          onMouseDown={(e) => handleResizeStart(e, corner)}
        />
      ))}
    </NodeViewWrapper>
  );
}
