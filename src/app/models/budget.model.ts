export interface Budget {
    id?: number;
    userId: number;
    month: string; // Format: YYYY-MM
    baseSalary: number;
    currentBalance: number;
  }