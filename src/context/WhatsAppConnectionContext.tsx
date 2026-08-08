"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createWhatsAppInstance,
  getWhatsAppQrCode,
} from "@/services";
import type { WhatsAppInstanceInput } from "@/lib/whatsappSchemas";

type Operation = "create" | "reconnect";

export type ConnectionQrCode = {
  instanceName: string;
  dataUrl: string;
  source: Operation;
};

export type ConnectionState =
  | { status: "idle" }
  | { status: "loading"; operation: Operation; instanceName: string }
  | { status: "success"; operation: Operation; instanceName: string }
  | {
      status: "error";
      operation: Operation;
      instanceName: string;
      message: string;
      retryable: boolean;
    };

type WhatsAppConnectionValue = {
  state: ConnectionState;
  qrCode: ConnectionQrCode | null;
  createInstance: (input: WhatsAppInstanceInput) => Promise<boolean>;
  loadQrCode: (instanceName: string) => Promise<boolean>;
  clear: () => void;
};

const WhatsAppConnectionContext =
  createContext<WhatsAppConnectionValue | null>(null);

export function WhatsAppConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>({ status: "idle" });
  const [qrCode, setQrCode] = useState<ConnectionQrCode | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const begin = (operation: Operation, instanceName: string) => {
    controller.current?.abort();
    controller.current = new AbortController();
    requestId.current += 1;
    setQrCode(null);
    setState({ status: "loading", operation, instanceName });
    return { id: requestId.current, signal: controller.current.signal };
  };

  const createInstance = async (input: WhatsAppInstanceInput) => {
    const request = begin("create", input.instanceName);
    const result = await createWhatsAppInstance(
      { tenant_id: input.tenantId, instance_name: input.instanceName },
      request.signal,
    );
    if (request.id !== requestId.current) return false;

    if (!result.ok) {
      setState({
        status: "error",
        operation: "create",
        instanceName: input.instanceName,
        message: result.message,
        retryable: result.retryable,
      });
      return false;
    }

    setQrCode({
      instanceName: result.instanceName,
      dataUrl: result.qrCode,
      source: "create",
    });
    setState({
      status: "success",
      operation: "create",
      instanceName: result.instanceName,
    });
    return true;
  };

  const loadQrCode = async (instanceName: string) => {
    const request = begin("reconnect", instanceName);
    const result = await getWhatsAppQrCode(instanceName, request.signal);
    if (request.id !== requestId.current) return false;

    if (!result.ok) {
      setState({
        status: "error",
        operation: "reconnect",
        instanceName,
        message: result.message,
        retryable: result.retryable,
      });
      return false;
    }

    setQrCode({
      instanceName: result.instanceName,
      dataUrl: result.qrCode,
      source: "reconnect",
    });
    setState({
      status: "success",
      operation: "reconnect",
      instanceName: result.instanceName,
    });
    return true;
  };

  const clear = () => {
    controller.current?.abort();
    requestId.current += 1;
    setQrCode(null);
    setState({ status: "idle" });
  };

  return (
    <WhatsAppConnectionContext.Provider
      value={{ state, qrCode, createInstance, loadQrCode, clear }}
    >
      {children}
    </WhatsAppConnectionContext.Provider>
  );
}

export function useWhatsAppConnectionContext(): WhatsAppConnectionValue {
  const context = useContext(WhatsAppConnectionContext);
  if (!context) {
    throw new Error(
      "useWhatsAppConnection must be used inside WhatsAppConnectionProvider",
    );
  }
  return context;
}