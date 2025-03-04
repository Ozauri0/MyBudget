export interface Goal {
    id?: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    description?: string;
    createdAt: string;
    order?: number;
  }