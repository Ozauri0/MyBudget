export interface Transaction {
    id?: number;
    name: string;
    amount: number;
    category: string;
    date: string;
    isRecurrent?: boolean;
    recurrenceType?: 'monthly' | 'yearly';
    nextDueDate?: string;
    isPaid?: boolean;
    originalTransactionId?: number;
  }
  
  export const CATEGORIES = [
    'Supermercado',
    'Entretenimiento',
    'Transporte',
    'Servicios básicos',
    'Salud',
    'Educación',
    'Restaurantes',
    'Ropa',
    'Otros'
  ];