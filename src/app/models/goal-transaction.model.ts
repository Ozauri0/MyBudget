export interface GoalTransaction {
    id?: number;
    goalId: number;
    amount: number;
    date: string;
    description?: string;
  }