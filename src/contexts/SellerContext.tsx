import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SellerContextType {
  sellerId: string | null;
  vendorHandle: string | null;
  loading: boolean;
  error: string | null;
  setSeller: (idOrHandle: string) => void;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

interface SellerProviderProps {
  children: ReactNode;
}

export function SellerProvider({ children }: SellerProviderProps) {
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [vendorHandle, setVendorHandle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSeller();
  }, []);

  async function initializeSeller() {
    try {
      setLoading(true);
      setError(null);

      // Option 1: Get from URL params (primary method for MVP)
      const params = new URLSearchParams(window.location.search);
      const vendorParam = params.get('vendor');

      if (vendorParam) {
        console.log('[SellerContext] Found vendor in URL:', vendorParam);
        setVendorHandle(vendorParam);
        // For MVP, we use vendor handle directly
        // In production, we'd look up vendor_id from BigQuery
        setSellerId(vendorParam);
        return;
      }

      // Option 2: Get from environment (fallback for development)
      const defaultVendor = import.meta.env.VITE_DEFAULT_VENDOR;
      if (defaultVendor) {
        console.log('[SellerContext] Using default vendor from env:', defaultVendor);
        setVendorHandle(defaultVendor);
        setSellerId(defaultVendor);
        return;
      }

      // Option 3: Get from localStorage (for persistence across sessions)
      const storedVendor = localStorage.getItem('selectedVendor');
      if (storedVendor) {
        console.log('[SellerContext] Found vendor in localStorage:', storedVendor);
        setVendorHandle(storedVendor);
        setSellerId(storedVendor);
        return;
      }

      // No seller found
      setError('No seller specified. Please add ?vendor=handle to the URL');
    } catch (err) {
      console.error('[SellerContext] Error initializing seller:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize seller');
    } finally {
      setLoading(false);
    }
  }

  function setSeller(idOrHandle: string) {
    console.log('[SellerContext] Setting seller:', idOrHandle);
    setVendorHandle(idOrHandle);
    setSellerId(idOrHandle);
    // Persist to localStorage
    localStorage.setItem('selectedVendor', idOrHandle);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('vendor', idOrHandle);
    window.history.pushState({}, '', url.toString());
  }

  const value: SellerContextType = {
    sellerId,
    vendorHandle,
    loading,
    error,
    setSeller,
  };

  return (
    <SellerContext.Provider value={value}>
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (context === undefined) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}
