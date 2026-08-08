"use client";

import { useWhatsAppConnectionContext } from "@/context/WhatsAppConnectionContext";

export function useWhatsAppConnection() {
  return useWhatsAppConnectionContext();
}