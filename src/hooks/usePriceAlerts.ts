import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  targetPrice: number;
  condition: "above" | "below";
  createdAt: string;
  triggered: boolean;
}

const STORAGE_KEY = "crypto-price-alerts";

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = useCallback((
    coinId: string,
    coinName: string,
    coinSymbol: string,
    coinImage: string,
    targetPrice: number,
    condition: "above" | "below"
  ) => {
    const newAlert: PriceAlert = {
      id: `${coinId}-${Date.now()}`,
      coinId,
      coinName,
      coinSymbol,
      coinImage,
      targetPrice,
      condition,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    
    setAlerts(prev => [...prev, newAlert]);
    
    toast({
      title: "Alert Created! 🔔",
      description: `You'll be notified when ${coinSymbol.toUpperCase()} goes ${condition} $${targetPrice.toLocaleString()}`,
    });
    
    return newAlert;
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast({
      title: "Alert Removed",
      description: "Price alert has been deleted",
    });
  }, []);

  const checkAlerts = useCallback((prices: Record<string, number>) => {
    setAlerts(prev => {
      let hasChanges = false;
      const updated = prev.map(alert => {
        if (alert.triggered) return alert;
        
        const currentPrice = prices[alert.coinId];
        if (!currentPrice) return alert;
        
        const shouldTrigger = 
          (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
          (alert.condition === "below" && currentPrice <= alert.targetPrice);
        
        if (shouldTrigger) {
          hasChanges = true;
          
          // Show notification
          toast({
            title: `🚨 Price Alert Triggered!`,
            description: `${alert.coinName} (${alert.coinSymbol.toUpperCase()}) is now ${alert.condition} $${alert.targetPrice.toLocaleString()} at $${currentPrice.toLocaleString()}`,
            duration: 10000,
          });
          
          // Play sound if available
          try {
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2SlIGAdX19jp+dm46Ff3t7g5Gfn5WHgHp2eICRoJ+Xh4B3dHqAjp2gnIqBd3J3foyboJuNgndxdn2Ll56ajoV2cXZ8ipifm5CGenNze4iWn5ySh3t0c3mHlZ+dkoZ7dHN4hpSfnpOHe3R0eIaTn56TiHt0dHiGk5+ek4h8dHR4hpOfnpOIfHR0eIaTn56Th3xzdHiFk56dlId7c3N3hJOenZWHe3Nzd4OSnp2VhnpzcnaDkp6dlYZ6c3J1g5GenZaGenJydYORnp2WhnpycnWDkZ6dloZ6cnJ1g5GenZaGenJydYORnp2Wh3pycXWDkZ6dl4d6cXF1gpCenZeHenFxdIKQnp2Xh3pxcXSCkJ6dl4d6cXF0gpCenZeHenFxdIKQnp2Xh3pxcXSCkJ6dl4d6cXF0gpCenZeHenFxdIKQnp2Xh3pxcXSCkJ6dl4d6cXF0gpCenZeHenFxdIKQnp2Xh3pxcXSCkJ6dl4d6cXFzgpCenZeHenBwc4KQnp2Yh3pwcHOCj56dmId6cHBzgo+enZiHenBwc4KPnp2Yh3pwcHOCj56dmId6cHBzgo+enZiIenBwcoGPnp2YiHpwcHKBj52cmIh5b3BygY+dnJmIeW9wcYGOngAA");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {}
          
          return { ...alert, triggered: true };
        }
        
        return alert;
      });
      
      return hasChanges ? updated : prev;
    });
  }, []);

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  const clearTriggered = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.triggered));
  }, []);

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    addAlert,
    removeAlert,
    checkAlerts,
    clearTriggered,
  };
}
