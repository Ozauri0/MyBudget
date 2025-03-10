import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import { Goal } from '../models/goal.model';
import { GoalTransaction } from '../models/goal-transaction.model';
import { EventsService } from '../services/events.service';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private initialized: boolean = false;

  constructor(
    private events: EventsService
  ) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializePlugin(): Promise<void> {
    try {
      this.db = await this.sqlite.createConnection(
        'mybudget',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      await this.createTables();
      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        baseSalary DECIMAL NOT NULL,
        profileImage TEXT,
        gradientId INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount DECIMAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        isRecurrent INTEGER DEFAULT 0,
        recurrenceType TEXT,
        nextDueDate TEXT
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        targetAmount REAL NOT NULL,
        currentAmount REAL DEFAULT 0,
        deadline TEXT,
        description TEXT,
        createdAt TEXT NOT NULL,
        \`order\` INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS goal_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goalId INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY(goalId) REFERENCES goals(id) ON DELETE CASCADE
      );
    `;
    await this.db.execute(schema);
  }

  async executeQuery(query: string, values: any[] = []): Promise<any> {
    try {
      if (!this.initialized) await this.initializePlugin();
      console.log('Executing query:', query);
      console.log('With values:', values);
      const result = await this.db.run(query, values);
      console.log('Query result:', result);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async executeSelect(query: string, values: any[] = []): Promise<any> {
    try {
      if (!this.initialized) await this.initializePlugin();
      console.log('Executing select:', query);
      console.log('With values:', values);
      const result = await this.db.query(query, values);
      console.log('Select result:', result);
      return result;
    } catch (error) {
      console.error('Error executing select:', error);
      throw error;
    }
  }

  async addUser(user: User): Promise<void> {
    const query = 'INSERT INTO users (name, baseSalary, profileImage) VALUES (?, ?, ?)';
    const values = [user.name, user.baseSalary, user.profileImage || null];
    await this.executeQuery(query, values);
  }

  async getUser(): Promise<User | null> {
    const result = await this.executeSelect('SELECT * FROM users LIMIT 1', []);
    return result.values?.length ? result.values[0] as User : null;
  }

  async updateUser(user: User): Promise<void> {
    const query = `
      UPDATE users 
      SET name = ?, 
          baseSalary = ?, 
          profileImage = ?,
          gradientId = ?
      WHERE id = ?
    `;
    const values = [
      user.name,
      user.baseSalary,
      user.profileImage || null,
      user.gradientId,
      user.id
    ];
    await this.executeQuery(query, values);
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    const query = `
      INSERT INTO transactions (name, amount, category, date, isRecurrent, recurrenceType, nextDueDate) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      transaction.name,
      transaction.amount,
      transaction.category,
      transaction.date,
      transaction.isRecurrent ? 1 : 0,
      transaction.recurrenceType,
      transaction.nextDueDate
    ];
    await this.executeQuery(query, values);
  }

  async getTransactions(): Promise<Transaction[]> {
    const result = await this.executeSelect('SELECT * FROM transactions ORDER BY date DESC', []);
    return result.values as Transaction[];
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const query = `
      UPDATE transactions 
      SET name = ?, 
          amount = ?, 
          category = ?, 
          date = ?,
          isRecurrent = ?,
          recurrenceType = ?,
          nextDueDate = ?
      WHERE id = ?
    `;
    const values = [
      transaction.name,
      transaction.amount,
      transaction.category,
      transaction.date,
      transaction.isRecurrent ? 1 : 0,
      transaction.recurrenceType,
      transaction.nextDueDate,
      transaction.id
    ];
    await this.executeQuery(query, values);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.executeQuery('DELETE FROM transactions WHERE id = ?', [id]);
  }

  async addGoal(goal: Goal): Promise<void> {
    const query = `
      INSERT INTO goals (name, targetAmount, currentAmount, deadline, description, createdAt, \`order\`) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      goal.name,
      goal.targetAmount,
      goal.currentAmount || 0,
      goal.deadline,
      goal.description,
      goal.createdAt,
      goal.order || 0
    ];
    await this.executeQuery(query, values);
  }

  async getGoals(): Promise<Goal[]> {
    const result = await this.executeSelect('SELECT * FROM goals ORDER BY `order` ASC', []);
    return result.values as Goal[];
  }

  async getGoal(id: number): Promise<Goal | null> {
    const result = await this.executeSelect('SELECT * FROM goals WHERE id = ?', [id]);
    return result.values?.length ? result.values[0] as Goal : null;
  }

  async updateGoal(goal: Goal): Promise<void> {
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
    await this.executeQuery(query, values);
  }

  async deleteGoal(id: number): Promise<void> {
    await this.executeQuery('DELETE FROM goals WHERE id = ?', [id]);
  }

  async getGoalTransactions(goalId: number): Promise<GoalTransaction[]> {
    const result = await this.executeSelect(
      'SELECT * FROM goal_transactions WHERE goalId = ? ORDER BY date DESC',
      [goalId]
    );
    return result.values as GoalTransaction[];
  }

  async addGoalTransaction(transaction: GoalTransaction): Promise<void> {
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
    await this.executeQuery(query, values);

    const updateQuery = `
      UPDATE goals 
      SET currentAmount = currentAmount + ?
      WHERE id = ?
    `;
    await this.executeQuery(updateQuery, [transaction.amount, transaction.goalId]);
  }

  async updateGoalTransaction(transaction: GoalTransaction): Promise<void> {
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
    await this.executeQuery(query, values);

    const difference = transaction.amount - oldTransaction.amount;
    const updateQuery = `
      UPDATE goals 
      SET currentAmount = currentAmount + ?
      WHERE id = ?
    `;
    await this.executeQuery(updateQuery, [difference, transaction.goalId]);
  }

  async deleteGoalTransaction(transactionId: number): Promise<void> {
    const transaction = await this.getGoalTransaction(transactionId);
    
    await this.executeQuery('DELETE FROM goal_transactions WHERE id = ?', [transactionId]);
    
    const updateQuery = `
      UPDATE goals 
      SET currentAmount = currentAmount - ?
      WHERE id = ?
    `;
    await this.executeQuery(updateQuery, [transaction.amount, transaction.goalId]);
  }

  private async getGoalTransaction(id: number): Promise<GoalTransaction> {
    const result = await this.executeSelect('SELECT * FROM goal_transactions WHERE id = ?', [id]);
    if (!result.values?.length) {
      throw new Error('Transaction not found');
    }
    return result.values[0] as GoalTransaction;
  }

  async exportDatabase(): Promise<string> {
    try {
      if (!this.initialized) await this.initializePlugin();
  
      const date = new Date();
      const timestamp = `${date.getTime()}`; // Añadir timestamp para nombre único
      const backupName = `mybudget_backup_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${timestamp}.db`;
      
      console.log('Iniciando exportación de la base de datos...');
      console.log('Nombre del archivo:', backupName);
  
      try {
        // Obtener ruta de destino en el directorio de documentos
        const downloadPath = `/storage/emulated/0/Documents/${backupName}`;
        
        // Ejecutar backup directo a la carpeta de documentos
        await this.db.query('PRAGMA journal_mode = DELETE');
        await this.db.query(`VACUUM INTO '${downloadPath}'`);
        
        console.log('Base de datos exportada exitosamente');
        console.log('La base de datos se encuentra en:', downloadPath);
  
        // Leer el archivo exportado y convertirlo a base64
        const fileData = await Filesystem.readFile({
          path: backupName,
          directory: Directory.Documents
        });
  
        return fileData.data as string; // Retornar los datos en base64
  
      } catch (copyError) {
        console.error('Error copiando archivo:', copyError);
        throw copyError;
      }
  
    } catch (error) {
      console.error('Error al exportar la base de datos:', error);
      throw error;
    }
  }
  async getExportPath(): Promise<string> {
    try {
      if (!this.initialized) await this.initializePlugin();
      
      const date = new Date();
      const backupName = `mybudget_backup_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.db`;
      
      return `/storage/emulated/0/Download/${backupName}`;
    } catch (error) {
      console.error('Error obteniendo ruta de exportación:', error);
      throw error;
    }
  }

  async importDatabase(newDbPath: string): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initializePlugin();
      }
  
      // Cerrar todas las conexiones existentes
      try {
        await this.sqlite.closeConnection('mybudget', false);
        await this.sqlite.closeConnection('backup_temp', false);
      } catch (e) {
        console.warn('No hay conexión previa que cerrar');
      }
  
      // Crear nueva conexión
      this.db = await this.sqlite.createConnection(
        'mybudget',
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();
  
      // Borrar datos existentes primero
      await this.db.execute(`
        DELETE FROM goal_transactions;
        DELETE FROM goals;
        DELETE FROM transactions;
        DELETE FROM users;
      `);
  
      // Obtener la ruta correcta sin el prefijo file:///
      const fullPath = newDbPath.replace('file:///', '');
  
      try {
        // Primero intentar adjuntar la base de datos
        await this.db.execute(`ATTACH DATABASE '${fullPath}' AS backup`);
  
        try {
          // Copiar datos en operaciones separadas
          await this.db.execute(`INSERT INTO users SELECT * FROM backup.users`);
          await this.db.execute(`INSERT INTO transactions SELECT * FROM backup.transactions`);
          await this.db.execute(`INSERT INTO goals SELECT * FROM backup.goals`);
          await this.db.execute(`INSERT INTO goal_transactions SELECT * FROM backup.goal_transactions`);
  
        } finally {
          // Intentar desvincular sin importar el resultado
          try {
            await this.db.execute('DETACH DATABASE backup');
          } catch (detachError) {
            console.warn('No se pudo desvincular la base de datos:', detachError);
          }
        }
  
        console.log('Base de datos importada exitosamente');
        // Emitir evento después de importación exitosa
        this.events.emitDatabaseImported();
  
      } catch (importError) {
        console.error('Error durante la importación:', importError);
        throw importError;
      }
    } catch (error) {
      console.error('Error al reemplazar la base de datos:', error);
      throw error;
    }
  }
}