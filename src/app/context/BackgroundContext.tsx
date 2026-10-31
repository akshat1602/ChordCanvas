"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type BgTheme = "acoustic" | "electric" | "neutral";

interface BackgroundContextType {
  bgTheme: BgTheme;
  setBgTheme: (theme: BgTheme) => void;
  triggerPulse: () => void;
  pulseKey: number;
}

const BackgroundContext = createContext<BackgroundContextType>({
  bgTheme: "neutral",
  setBgTheme: () => {},
  triggerPulse: () => {},
  pulseKey: 0,
});

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [bgTheme, setBgTheme] = useState<BgTheme>("neutral");
  const [pulseKey, setPulseKey] = useState(0);

  const triggerPulse = () => {
    setPulseKey(prev => prev + 1);
  };

  return (
    <BackgroundContext.Provider value={{ bgTheme, setBgTheme, triggerPulse, pulseKey }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export const useBackground = () => useContext(BackgroundContext);