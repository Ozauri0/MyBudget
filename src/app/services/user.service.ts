import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private database: DatabaseService) {}

  async createUser(user: User): Promise<void> {
    const query = `
      INSERT INTO users (name, baseSalary)
      VALUES (?, ?)
    `;
    const values = [user.name, user.baseSalary];
    
    try {
      await this.database.executeQuery(query, values);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    const query = 'SELECT * FROM users LIMIT 1';
    try {
      const result = await this.database.executeSelect(query, []);
      return result.values?.length ? result.values[0] as User : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
}