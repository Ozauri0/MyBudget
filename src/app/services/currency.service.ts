import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly STORAGE_KEY = 'selected_currency';
  
  private availableCurrencies: CurrencyConfig[] = [
    { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
    { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
    { code: 'ARS', symbol: '$', name: 'Peso argentino' },
    { code: 'CLP', symbol: '$', name: 'Peso chileno' }
    // Agregar más monedas según necesidad
  ];

  private currentCurrencySubject = new BehaviorSubject<CurrencyConfig>(
    this.loadSavedCurrency() || this.availableCurrencies[0]
  );

  currentCurrency$ = this.currentCurrencySubject.asObservable();

  constructor() {}

  private loadSavedCurrency(): CurrencyConfig | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  getAllCurrencies(): CurrencyConfig[] {
    return this.availableCurrencies;
  }

  getCurrentCurrency(): CurrencyConfig {
    return this.currentCurrencySubject.value;
  }

  setCurrentCurrency(currency: CurrencyConfig) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currency));
    this.currentCurrencySubject.next(currency);
  }

  formatAmount(amount: number, includeSymbol: boolean = true): string {
    const currency = this.getCurrentCurrency();
    const formatted = new Intl.NumberFormat('en-US', {
      style: includeSymbol ? 'currency' : 'decimal',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    return includeSymbol ? formatted : formatted.replace(currency.symbol, '');
  }
}