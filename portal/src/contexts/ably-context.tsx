"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Ably from "ably";
import { useAuth } from "@/contexts/auth-context";

interface RealtimeContextType {
  isConnected: boolean;
  client: Ably.Realtime | null;
}

const RealtimeContext = createContext<RealtimeContextType>({ isConnected: false, client: null });

export const useRealtime = () => useContext(RealtimeContext);

/**
 * A lazily-accessed reference to the singleton Ably client.
 * This is NOT created at module load time to avoid SSR failures and auth races.
 * Access it via `getAblyClient()` only inside browser-side `useEffect` hooks.
 */
let _ablyClientInstance: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime | null {
  // Guard: never run on the server
  if (typeof window === "undefined") return null;

  if (!_ablyClientInstance) {
    _ablyClientInstance = new Ably.Realtime({
      authUrl: "/api/ably/auth",
      autoConnect: false, // We explicitly call .connect() after auth
    });
  }
  return _ablyClientInstance;
}

export function AblyRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only connect when user is authenticated in the browser
    if (!isAuthenticated) {
      // If user logs out, close existing connection gracefully
      if (_ablyClientInstance && _ablyClientInstance.connection.state === "connected") {
        _ablyClientInstance.close();
        _ablyClientInstance = null;
        setClient(null);
        setIsConnected(false);
        initialized.current = false;
      }
      return;
    }

    // Already initialized - don't create a second client
    if (initialized.current) return;
    initialized.current = true;

    const ablyClient = getAblyClient();
    if (!ablyClient) return;

    setClient(ablyClient);

    // Handlers
    const onConnected = () => {
      setIsConnected(true);
      console.log("[Ably] Secure real-time connection established.");
    };
    const onDisconnected = () => {
      setIsConnected(false);
      console.warn("[Ably] Disconnected. Will retry automatically.");
    };
    const onSuspended = () => {
      setIsConnected(false);
      console.warn("[Ably] Connection suspended (likely a transient auth/network issue). Retrying...");
      // Re-authenticate and reconnect
      ablyClient.connect();
    };
    const onFailed = () => {
      console.error("[Ably] Connection permanently failed.");
      setIsConnected(false);
    };

    ablyClient.connection.on("connected", onConnected);
    ablyClient.connection.on("disconnected", onDisconnected);
    ablyClient.connection.on("suspended", onSuspended);
    ablyClient.connection.on("failed", onFailed);

    // Only connect if not already connecting/connected
    const state = ablyClient.connection.state;
    if (state === "initialized" || state === "closed" || state === "suspended") {
      ablyClient.connect();
    }

    return () => {
      // Clean up only the listeners we added, never kill the singleton
      ablyClient.connection.off("connected", onConnected);
      ablyClient.connection.off("disconnected", onDisconnected);
      ablyClient.connection.off("suspended", onSuspended);
      ablyClient.connection.off("failed", onFailed);
    };
  }, [isAuthenticated]);

  return (
    <RealtimeContext.Provider value={{ isConnected, client }}>
      {children}
    </RealtimeContext.Provider>
  );
}
