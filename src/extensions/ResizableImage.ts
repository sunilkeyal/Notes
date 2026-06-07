import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ResizableImageComponent from "@/components/ResizableImageComponent";

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      marginLeft: {
        default: 0,
        parseHTML: (el) => Number(el.getAttribute("data-ml")) || 0,
        renderHTML: (attrs) => {
          if (!attrs.marginLeft) return {};
          return { "data-ml": attrs.marginLeft, style: `margin-left:${attrs.marginLeft}px` };
        },
      },
      float: {
        default: "none",
        parseHTML: (el) => el.getAttribute("data-float") ?? "none",
        renderHTML: (attrs) => {
          if (!attrs.float || attrs.float === "none") return {};
          return { "data-float": attrs.float };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent, {
      className: "w-fit",
    });
  },
});
