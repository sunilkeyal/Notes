"use client";

import { createPortal } from "react-dom";
import { Box, HStack, Text, Button } from "@chakra-ui/react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return createPortal(
    <Box
      position="fixed"
      inset="0"
      zIndex="50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      css={{ bg: "overlay", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <Box
        css={{ bg: "bg.subtle", border: "1px solid", borderColor: "border" }}
        borderRadius="xl"
        boxShadow="2xl"
        w="320px"
        p="6"
        onClick={(e) => e.stopPropagation()}
      >
        <Text fontSize="sm" fontWeight="semibold" css={{ color: "fg" }} mb="2">
          {title}
        </Text>
        <Text fontSize="sm" css={{ color: "fg.subtle" }} mb="5" lineHeight="relaxed">
          {message}
        </Text>
        <HStack justify="flex-end" gap="2">
          <Button
            variant="outline"
            size="sm"
            css={{ color: "fg.subtle", borderColor: "border", _hover: { bg: "bg.muted" } }}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            css={{ bg: "danger", color: "white", _hover: { bg: "danger.hover" } }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </HStack>
      </Box>
    </Box>,
    document.body
  );
}
