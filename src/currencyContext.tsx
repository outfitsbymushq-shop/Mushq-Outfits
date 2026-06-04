import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CurrencyConfig, 
  getCurrencyConfig, 
  saveCurrencyConfig, 
  getSelectedCurrencyCode, 
  setSelectedCurrencyCode as serviceSetSelectedCurrencyCode,
  convertPKRPrice,
  formatCurrencyDisplay,
  checkAndAutoUpdateRates,
  fetchLiveRates
} from './currencyService';

interface CurrencyContextType {
  selectedCurrencyCode: string;
  currencyConfig: CurrencyConfig;
  setCurrencyCode: (code: string) => void;
  updateCurrencyConfig: (newConfig: CurrencyConfig) => void;
  isLoadingRates: boolean;
  triggerManualRefresh: () => Promise<boolean>;
  formatPrice: (amountPKR: number) => string;
  convertPrice: (amountPKR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrencyCode, setSelectedCurrencyCodeState] = useState<string>(getSelectedCurrencyCode());
  const [currencyConfig, setCurrencyConfigState] = useState<CurrencyConfig>(getCurrencyConfig());
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);

  // Background check for daily automated update
  useEffect(() => {
    const handleAutoUpdate = async () => {
      await checkAndAutoUpdateRates();
      // After auto update completes, refresh our state in React
      setCurrencyConfigState(getCurrencyConfig());
    };
    handleAutoUpdate();
  }, []);

  // Listen to the custom event so multiple instances remain synced
  useEffect(() => {
    const handleCurrencyChanged = () => {
      setSelectedCurrencyCodeState(getSelectedCurrencyCode());
    };
    window.addEventListener('mushq_currency_changed', handleCurrencyChanged);
    return () => {
      window.removeEventListener('mushq_currency_changed', handleCurrencyChanged);
    };
  }, []);

  const setCurrencyCode = (code: string) => {
    serviceSetSelectedCurrencyCode(code);
    setSelectedCurrencyCodeState(code);
  };

  const updateCurrencyConfig = (newConfig: CurrencyConfig) => {
    saveCurrencyConfig(newConfig);
    setCurrencyConfigState(newConfig);
    
    // Ensure selected currency is still valid, else fall back to default
    const isSelectedEnabled = newConfig.currencies.some(c => c.code === selectedCurrencyCode && c.isEnabled);
    if (!isSelectedEnabled) {
      const activeDefault = newConfig.defaultCurrencyCode;
      setCurrencyCode(activeDefault);
    }
  };

  const triggerManualRefresh = async (): Promise<boolean> => {
    setIsLoadingRates(true);
    try {
      const updatedConfig = await fetchLiveRates();
      setCurrencyConfigState(updatedConfig);
      setIsLoadingRates(false);
      return true;
    } catch (e) {
      console.error('Manual rate update failed:', e);
      setIsLoadingRates(false);
      return false;
    }
  };

  const formatPrice = (amountPKR: number): string => {
    return formatCurrencyDisplay(amountPKR, selectedCurrencyCode, currencyConfig);
  };

  const convertPrice = (amountPKR: number): number => {
    return convertPKRPrice(amountPKR, selectedCurrencyCode, currencyConfig);
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrencyCode,
      currencyConfig,
      setCurrencyCode,
      updateCurrencyConfig,
      isLoadingRates,
      triggerManualRefresh,
      formatPrice,
      convertPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used inside a CurrencyProvider');
  }
  return context;
};
