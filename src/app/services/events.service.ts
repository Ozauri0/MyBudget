import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../models/user.model';
import { Goal } from '../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  // Subjects para usuarios
  private userCreated = new Subject<void>();
  private userUpdated = new Subject<User>();

  // Subjects para transacciones
  private transactionAdded = new Subject<void>();
  private transactionUpdated = new Subject<void>();
  private transactionDeleted = new Subject<void>();

  // Subjects para metas
  private goalAdded = new Subject<void>();
  private goalUpdated = new Subject<Goal>();
  private goalDeleted = new Subject<void>();
  private goalTransactionAdded = new Subject<void>();
  private goalTransactionUpdated = new Subject<void>();
  private goalTransactionDeleted = new Subject<void>();

  //subject para importes
  private databaseImported = new Subject<void>();

  // Observables para usuarios
  userCreated$ = this.userCreated.asObservable();
  userUpdated$ = this.userUpdated.asObservable();

  // Observables para transacciones
  transactionAdded$ = this.transactionAdded.asObservable();
  transactionUpdated$ = this.transactionUpdated.asObservable();
  transactionDeleted$ = this.transactionDeleted.asObservable();

  // Observables para metas
  goalAdded$ = this.goalAdded.asObservable();
  goalUpdated$ = this.goalUpdated.asObservable();
  goalDeleted$ = this.goalDeleted.asObservable();
  goalTransactionAdded$ = this.goalTransactionAdded.asObservable();
  goalTransactionUpdated$ = this.goalTransactionUpdated.asObservable();
  goalTransactionDeleted$ = this.goalTransactionDeleted.asObservable();

  // Observables para importes
  databaseImported$ = this.databaseImported.asObservable();

  // Métodos para usuarios
  emitUserCreated() {
    this.userCreated.next();
  }

  emitUserUpdated(user: User) {
    this.userUpdated.next(user);
  }

  // Métodos para transacciones
  emitTransactionAdded() {
    this.transactionAdded.next();
  }

  emitTransactionUpdated() {
    this.transactionUpdated.next();
  }

  emitTransactionDeleted() {
    this.transactionDeleted.next();
  }

  // Métodos para metas
  emitGoalAdded() {
    this.goalAdded.next();
  }

  emitGoalUpdated(goal: Goal) {
    this.goalUpdated.next(goal);
  }

  emitGoalDeleted() {
    this.goalDeleted.next();
  }

  emitGoalTransactionAdded() {
    this.goalTransactionAdded.next();
  }

  emitGoalTransactionUpdated() {
    this.goalTransactionUpdated.next();
  }

  emitGoalTransactionDeleted() {
    this.goalTransactionDeleted.next();
  }
  emitDatabaseImported() {
    this.databaseImported.next();
  }
}