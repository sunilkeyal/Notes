"use client";

import { Box, chakra } from "@chakra-ui/react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function ResizableImageComponent({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const currentFloat = (node.attrs.float as string) ?? "none";
  const isFloated = currentFloat !== "none";
  const marginLeft = (node.attrs.marginLeft as number) ?? 0;

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
    const vert = corner.includes("n") ? { top: "0", marginTop: "-0.375rem" } : { bottom: "0", marginBottom: "-0.375rem" };
    const horiz = corner.includes("w") ? { left: "0", marginLeft: "-0.375rem" } : { right: "0", marginRight: "-0.375rem" };
    const cursor = corner.includes("n") || corner.includes("s") ? "ns-resize" : corner.includes("e") || corner.includes("w") ? "ew-resize" : `${corner}-resize`;
    return { position: "absolute", width: "0.75rem", height: "0.75rem", bg: "white", border: "2px solid var(--chakra-colors-accent)", borderRadius: "0.125rem", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", zIndex: 10, cursor, ...vert, ...horiz };
  };

  return (
    <NodeViewWrapper data-image-node>
      <Box
        position="relative"
        display="inline-block"
        css={{
          ...(isFloated
            ? currentFloat === "left"
              ? { float: "left", marginRight: "1rem", marginBottom: "0.5rem" }
              : { float: "right", marginLeft: "1rem", marginBottom: "0.5rem" }
            : {}),
          lineHeight: 0,
        }}
        style={marginLeft > 0 ? { marginLeft: `${marginLeft}px` } : undefined}
      >
        <chakra.img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          title={node.attrs.title ?? ""}
          width={node.attrs.width ?? undefined}
          height={node.attrs.height ?? undefined}
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "0.5rem",
            userSelect: "none",
            ...(selected ? { boxShadow: "0 0 0 2px var(--chakra-colors-accent)" } : {}),
          }}
          draggable={false}
        />
        {selected && ["se", "sw", "ne", "nw"].map((corner) => (
          <Box
            as="span"
            key={corner}
            data-resize-handle
            css={cornerClass(corner)}
            onMouseDown={(e) => handleResizeStart(e, corner)}
          />
        ))}
      </Box>
    </NodeViewWrapper>
  );
}
