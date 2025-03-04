import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Goal } from '../models/goal.model';
import { GoalTransaction } from '../models/goal-transaction.model';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  constructor(private database: DatabaseService) {
    this.initializeTables();
  }

  private async initializeTables() {
    try {
      // Tabla de metas
      const goalsQuery = `
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          targetAmount REAL NOT NULL,
          currentAmount REAL DEFAULT 0,
          deadline TEXT,
          description TEXT,
          createdAt TEXT NOT NULL,
          \`order\` INTEGER DEFAULT 0
        )
      `;
      await this.database.executeQuery(goalsQuery);

      // Tabla de transacciones de metas
      const transactionsQuery = `
        CREATE TABLE IF NOT EXISTS goal_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goalId INTEGER,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          description TEXT,
          FOREIGN KEY(goalId) REFERENCES goals(id) ON DELETE CASCADE
        )
      `;
      await this.database.executeQuery(transactionsQuery);
      console.log('Tables initialized successfully');
    } catch (error) {
      console.error('Error initializing tables:', error);
      throw error;
    }
  }

  async addGoal(goal: Goal): Promise<void> {
    try {
      console.log('Adding goal:', goal);
      const query = `
        INSERT INTO goals (name, targetAmount, currentAmount, deadline, description, createdAt, \`order\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const maxOrderQuery = 'SELECT MAX(\`order\`) as maxOrder FROM goals';
      const orderResult = await this.database.executeSelect(maxOrderQuery);
      const maxOrder = orderResult.values[0]?.maxOrder || 0;
      
      const values = [
        goal.name,
        goal.targetAmount,
        goal.currentAmount || 0,
        goal.deadline,
        goal.description,
        goal.createdAt,
        maxOrder + 1
      ];
      await this.database.executeQuery(query, values);
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  }

  async getGoals(): Promise<Goal[]> {
    try {
      console.log('Getting all goals');
      const query = 'SELECT * FROM goals ORDER BY id DESC';
      const result = await this.database.executeSelect(query);
      return result.values as Goal[];
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  }

  async getGoal(id: number): Promise<Goal | null> {
    try {
      console.log('Getting goal with id:', id);
      const query = 'SELECT * FROM goals WHERE id = ?';
      const result = await this.database.executeSelect(query, [id]);
      return result.values?.length ? result.values[0] as Goal : null;
    } catch (error) {
      console.error('Error getting goal:', error);
      throw error;
    }
  }

  async updateGoal(goal: Goal): Promise<void> {
    try {
      console.log('Updating goal:', goal);
      const query = `
        UPDATE goals 
        SET name = ?, 
            targetAmount = ?, 
            deadline = ?,
            description = ?,
            \`order\` = ?
        WHERE id = ?
      `;
      const values = [
        goal.name,
        goal.targetAmount,
        goal.deadline,
        goal.description,
        goal.order || 0,
        goal.id
      ];
      await this.database.executeQuery(query, values);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  async deleteGoal(id: number): Promise<void> {
    try {
      console.log('Deleting goal with id:', id);
      const query = 'DELETE FROM goals WHERE id = ?';
      await this.database.executeQuery(query, [id]);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  async addGoalTransaction(transaction: GoalTransaction): Promise<void> {
    try {
      console.log('Adding transaction:', transaction);
      const query = `
        INSERT INTO goal_transactions (goalId, amount, date, description)
        VALUES (?, ?, ?, ?)
      `;
      const values = [
        transaction.goalId,
        transaction.amount,
        transaction.date,
        transaction.description
      ];
      await this.database.executeQuery(query, values);

      // Actualizar el monto actual de la meta
      const updateQuery = `
        UPDATE goals 
        SET currentAmount = currentAmount + ?
        WHERE id = ?
      `;
      await this.database.executeQuery(updateQuery, [transaction.amount, transaction.goalId]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async getGoalTransactions(goalId: number): Promise<GoalTransaction[]> {
    try {
      console.log('Getting transactions for goal:', goalId);
      const query = `
        SELECT * FROM goal_transactions 
        WHERE goalId = ? 
        ORDER BY date DESC
      `;
      const result = await this.database.executeSelect(query, [goalId]);
      return result.values as GoalTransaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  async updateGoalTransaction(transaction: GoalTransaction): Promise<void> {
    try {
      console.log('Updating transaction:', transaction);
      const oldTransaction = await this.getGoalTransaction(transaction.id!);
      
      const query = `
        UPDATE goal_transactions 
        SET amount = ?, 
            date = ?,
            description = ?
        WHERE id = ?
      `;
      const values = [
        transaction.amount,
        transaction.date,
        transaction.description,
        transaction.id
      ];
      await this.database.executeQuery(query, values);

      // Actualizar el monto actual de la meta
      const difference = transaction.amount - oldTransaction.amount;
      const updateQuery = `
        UPDATE goals 
        SET currentAmount = currentAmount + ?
        WHERE id = ?
      `;
      await this.database.executeQuery(updateQuery, [difference, transaction.goalId]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteGoalTransaction(transactionId: number): Promise<void> {
    try {
      console.log('Deleting transaction:', transactionId);
      const transaction = await this.getGoalTransaction(transactionId);
      
      const query = 'DELETE FROM goal_transactions WHERE id = ?';
      await this.database.executeQuery(query, [transactionId]);

      // Actualizar el monto actual de la meta
      const updateQuery = `
        UPDATE goals 
        SET currentAmount = currentAmount - ?
        WHERE id = ?
      `;
      await this.database.executeQuery(updateQuery, [transaction.amount, transaction.goalId]);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  private async getGoalTransaction(id: number): Promise<GoalTransaction> {
    try {
      console.log('Getting transaction with id:', id);
      const query = 'SELECT * FROM goal_transactions WHERE id = ?';
      const result = await this.database.executeSelect(query, [id]);
      if (!result.values?.length) {
        throw new Error('Transaction not found');
      }
      return result.values[0] as GoalTransaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }
}