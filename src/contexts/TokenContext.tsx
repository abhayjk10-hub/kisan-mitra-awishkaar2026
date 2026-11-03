'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export type TokenStatus = 'waiting' | 'approaching' | 'now' | 'completed' | 'no-show' | 'waitlisted' | 'cancelled' | null;

export interface TokenData {
  tokenNumber: string;
  mandiName: string;
  currentToken: number;
  totalAhead: number;
  status: TokenStatus;
  estimatedWaitMinutes: number;
  slotTime: string;
  bookingDate?: string;
  dayOfWeek?: string;
  cropName?: string;
  quantity?: number;
  bookingId?: string;
  farmerPhone?: string;
}

interface TokenContextType {
  token: TokenData | null;
  setToken: (data: TokenData | null) => void;
  clearToken: () => void;
}

const TokenContext = createContext<TokenContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
});

const TOKEN_STORAGE_KEY = 'kisan_mitra_token';

function getInitialToken(): TokenData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TokenData) : null;
  } catch {
    return null;
  }
}

export function TokenProvider({ children }: { children: ReactNode }) {
  // Lazy state initialization fixes react-hooks/set-state-in-effect (Q2)
  const [token, setTokenState] = useState<TokenData | null>(getInitialToken);

  // Subscribe to farmer's booking via Supabase Realtime across all pages (H10)
  useEffect(() => {
    if (!token?.bookingId) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`token_realtime_${token.bookingId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'slot_bookings',
            filter: `id=eq.${token.bookingId}`,
          },
          (payload) => {
            const updated = payload.new as { status?: string };
            if (!updated?.status) return;

            let mapped: TokenStatus = 'waiting';
            if (updated.status === 'active') mapped = 'now';
            else if (updated.status === 'completed') mapped = 'completed';
            else if (updated.status === 'no-show') mapped = 'no-show';
            else if (updated.status === 'cancelled') mapped = 'cancelled';
            else if (updated.status === 'waitlisted') mapped = 'waitlisted';

            setTokenState((prev) => {
              if (!prev) return null;
              const nextVal: TokenData = {
                ...prev,
                status: mapped,
                totalAhead: mapped === 'now' ? 0 : prev.totalAhead,
                estimatedWaitMinutes: mapped === 'now' ? 0 : prev.estimatedWaitMinutes,
              };
              try {
                localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(nextVal));
              } catch {
                // ignore
              }
              return nextVal;
            });
          }
        )
        .subscribe();
    } catch {
      // ignore
    }

    // Also handle in-browser / cross-tab broadcast events and approaching threshold (H10)
    const handleUpdate = (e: Event) => {
      const payload = (e as CustomEvent<{ payload?: { bookingId?: string; id?: string; status?: string; totalAhead?: number } }>).detail?.payload;
      if (!payload || (payload.bookingId !== token.bookingId && payload.id !== token.bookingId)) return;

      const newStatus = payload.status;
      let mappedStatus: TokenStatus = token.status;
      if (newStatus === 'active') mappedStatus = 'now';
      else if (newStatus === 'completed') mappedStatus = 'completed';
      else if (newStatus === 'no-show') mappedStatus = 'no-show';
      else if (newStatus === 'waiting') mappedStatus = 'waiting';
      else if (newStatus === 'waitlisted') mappedStatus = 'waitlisted';
      else if (newStatus === 'cancelled') mappedStatus = 'cancelled';

      const totalAhead = payload.totalAhead ?? token.totalAhead;
      // Set 'approaching' when 1 to 2 farmers remain ahead (H10)
      if (mappedStatus === 'waiting' && (totalAhead === 1 || totalAhead === 2)) {
        mappedStatus = 'approaching';
      }

      setTokenState((prev) => {
        if (!prev) return null;
        const updated: TokenData = {
          ...prev,
          status: mappedStatus,
          totalAhead: mappedStatus === 'now' ? 0 : totalAhead,
          estimatedWaitMinutes: mappedStatus === 'now' ? 0 : totalAhead * 15,
        };
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    };

    window.addEventListener('km_sync_event', handleUpdate);

    return () => {
      window.removeEventListener('km_sync_event', handleUpdate);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [token?.bookingId, token?.status, token?.totalAhead]);

  const setToken = useCallback((data: TokenData | null) => {
    setTokenState(data);
    try {
      if (data) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const clearToken = useCallback(() => {
    setTokenState(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  return useContext(TokenContext);
}
