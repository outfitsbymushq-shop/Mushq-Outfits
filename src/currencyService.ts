export interface CurrencyInfo {
  code: string;
  symbol: string;
  flag: string;
  country: string;
  rate: number; // 1 PKR to target currency rate
  isEnabled: boolean;
}

export interface CurrencyConfig {
  currencies: CurrencyInfo[];
  defaultCurrencyCode: string; // Default shop currency
  autoUpdateDaily: boolean;
  lastUpdated: string; // ISO timestamp
}

export const INITIAL_CURRENCIES: CurrencyInfo[] = [
  { code: 'PKR', symbol: 'Rs.', flag: '🇵🇰', country: 'Pakistan', rate: 1.0, isEnabled: true },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', country: 'United Kingdom', rate: 0.0028, isEnabled: true },
  { code: 'USD', symbol: '$', flag: '🇺🇸', country: 'United States', rate: 0.0036, isEnabled: true },
  { code: 'CAD', symbol: '$', flag: '🇨🇦', country: 'Canada', rate: 0.0049, isEnabled: true },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪', country: 'United Arab Emirates', rate: 0.013, isEnabled: true },
  { code: 'SAR', symbol: '﷼', flag: '🇸🇦', country: 'Saudi Arabia', rate: 0.0134, isEnabled: true },
  { code: 'QAR', symbol: '﷼', flag: '🇶🇦', country: 'Qatar', rate: 0.013, isEnabled: true },
  { code: 'KWD', symbol: 'د.ك', flag: '🇰🇼', country: 'Kuwait', rate: 0.0011, isEnabled: true },
  { code: 'OMR', symbol: 'ر.ع.', flag: '🇴🇲', country: 'Oman', rate: 0.0014, isEnabled: true },
  { code: 'EUR', symbol: '€', flag: '🇩🇪', country: 'Germany', rate: 0.0033, isEnabled: true },
  { code: 'INR', symbol: '₹', flag: '🇮🇳', country: 'India', rate: 0.30, isEnabled: true }
];

const CONFIG_KEY = 'mushq_currencies_config_v1';
const SELECTED_CURRENCY_KEY = 'mushq_selected_currency_code';

export const getCurrencyConfig = (): CurrencyConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure basic structure is intact
      if (parsed && Array.isArray(parsed.currencies)) {
        return parsed as CurrencyConfig;
      }
    }
  } catch (e) {
    console.warn('Failed to parse currency config:', e);
  }

  // Return default configuration
  const defaultConfig: CurrencyConfig = {
    currencies: INITIAL_CURRENCIES,
    defaultCurrencyCode: 'PKR',
    autoUpdateDaily: true,
    lastUpdated: new Date().toISOString()
  };
  
  // Persist it
  saveCurrencyConfig(defaultConfig);
  return defaultConfig;
};

export const saveCurrencyConfig = (config: CurrencyConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save currency config:', e);
  }
};

export const getSelectedCurrencyCode = (): string => {
  try {
    const saved = localStorage.getItem(SELECTED_CURRENCY_KEY);
    if (saved) {
      return saved;
    }
  } catch {}
  
  const config = getCurrencyConfig();
  return config.defaultCurrencyCode;
};

export const setSelectedCurrencyCode = (code: string): void => {
  try {
    localStorage.setItem(SELECTED_CURRENCY_KEY, code);
    // Dispatch a custom event so other components know the currency changed
    window.dispatchEvent(new Event('mushq_currency_changed'));
  } catch (e) {
    console.warn('Failed to set selected currency code:', e);
  }
};

// Fetch live rates and update
export const fetchLiveRates = async (): Promise<CurrencyConfig> => {
  const config = getCurrencyConfig();
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/PKR');
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    
    const data = await res.json();
    if (data && data.result === 'success' && data.rates) {
      const rates = data.rates;
      
      const updatedCurrencies = config.currencies.map(curr => {
        // Base currency PKR is always 1.0 (some APIs return it as 1.0)
        if (curr.code === 'PKR') {
          return { ...curr, rate: 1.0 };
        }
        
        // If API has the target code, use its exchange rate
        if (rates[curr.code] !== undefined) {
          return { ...curr, rate: Number(rates[curr.code]) };
        }
        
        return curr;
      });
      
      config.currencies = updatedCurrencies;
      config.lastUpdated = new Date().toISOString();
      saveCurrencyConfig(config);
    }
  } catch (e) {
    console.error('System failed to fetch live exchange rates, falling back to cache:', e);
    throw e;
  }
  return config;
};

// Auto update check: if last update was > 24 hours ago and auto-update is true
export const checkAndAutoUpdateRates = async (): Promise<void> => {
  const config = getCurrencyConfig();
  if (!config.autoUpdateDaily) return;
  
  try {
    const lastUpdateDate = new Date(config.lastUpdated).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (now - lastUpdateDate > twentyFourHours) {
      console.log('Initiating automated daily exchange rate refresh...');
      await fetchLiveRates();
    }
  } catch (e) {
    console.warn('Automatic daily exchange rate refresh failed silently:', e);
  }
};

// Helper to convert PKR to selected currency
export const convertPKRPrice = (amountPKR: number, selectedCode: string, config: CurrencyConfig): number => {
  const currency = config.currencies.find(c => c.code === selectedCode);
  if (!currency) return amountPKR;
  return amountPKR * currency.rate;
};

// Helper for display formatting
export const formatCurrencyDisplay = (amountPKR: number, selectedCode: string, config: CurrencyConfig): string => {
  const currency = config.currencies.find(c => c.code === selectedCode);
  if (!currency) {
    // Fallback to default styling
    return `PKR ${amountPKR.toLocaleString('en-PK')}`;
  }
  
  const converted = amountPKR * currency.rate;
  
  // Clean decimal rounding
  let formattedValue = '';
  if (currency.code === 'PKR') {
    formattedValue = Math.round(converted).toLocaleString('en-PK');
    return `PKR ${formattedValue}`;
  } else if (currency.code === 'INR') {
    formattedValue = Math.round(converted).toLocaleString('en-IN');
  } else if (converted >= 1000) {
    formattedValue = Math.round(converted).toLocaleString('en-US');
  } else {
    // If very small (less than 10) or fractional, show up to 2 decimals
    formattedValue = converted < 10 && converted % 1 !== 0
      ? converted.toFixed(2)
      : Math.round(converted).toLocaleString('en-US');
  }
  
  // Format as requested: Code + Space + Symbol + Value (e.g., USD $30, GBP £24, AED د.إ110)
  return `${currency.code} ${currency.symbol}${formattedValue}`;
};
