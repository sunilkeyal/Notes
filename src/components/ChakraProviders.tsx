"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/app/system";

export function ChakraProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
