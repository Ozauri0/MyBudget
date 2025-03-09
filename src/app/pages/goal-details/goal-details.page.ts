import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalsService } from '../../services/goals.service';
import { EventsService } from '../../services/events.service';
import { Goal } from '../../models/goal.model';
import { GoalTransaction } from '../../models/goal-transaction.model';
import { HeaderComponent } from '../../components/header/header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-goal-details',
  templateUrl: './goal-details.page.html',
  styleUrls: ['./goal-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class GoalDetailsPage implements OnInit, OnDestroy {
  goal: Goal | null = null;
  transactions: GoalTransaction[] = [];
  originalGoal: Goal | null = null;
  private subscriptions: Subscription[] = [];
  showValidationError = false;
  showMaximunexceededError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private goalsService: GoalsService,
    private alertCtrl: AlertController,
    private events: EventsService
  ) {
    this.subscriptions = [
      this.events.goalUpdated$.subscribe(() => {
        if (this.goal?.id) {
          this.loadGoal(this.goal.id);
          this.loadTransactions(this.goal.id);
        }
      }),
      this.events.goalTransactionAdded$.subscribe(() => {
        if (this.goal?.id) {
          this.loadGoal(this.goal.id);
          this.loadTransactions(this.goal.id);
        }
      }),
      this.events.goalTransactionDeleted$.subscribe(() => {
        if (this.goal?.id) {
          this.loadGoal(this.goal.id);
          this.loadTransactions(this.goal.id);
        }
      }),
      this.events.databaseImported$.subscribe(() => {
        if (this.goal?.id) {
          this.loadGoal(this.goal.id);
          this.loadTransactions(this.goal.id);
        }
      })
    ];
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadGoal(parseInt(id));
      await this.loadTransactions(parseInt(id));
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadGoal(id: number) {
    try {
      this.goal = await this.goalsService.getGoal(id);
      if (this.goal) {
        this.originalGoal = { ...this.goal };
      } else {
        this.router.navigate(['/tabs/goals']);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
      this.router.navigate(['/tabs/goals']);
    }
  }

  private async loadTransactions(goalId: number) {
    try {
      this.transactions = await this.goalsService.getGoalTransactions(goalId);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  async saveChanges() {
    if (!this.goal) return;

    try {
      await this.goalsService.updateGoal(this.goal);
      this.events.emitGoalUpdated(this.goal);
      this.originalGoal = { ...this.goal };
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  }

  async editTransaction(transaction: GoalTransaction) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Transacción',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Cantidad',
          value: transaction.amount
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción',
          value: transaction.description
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.amount && this.goal) {
              try {
                await this.goalsService.updateGoalTransaction({
                  ...transaction,
                  amount: parseFloat(data.amount),
                  description: data.description
                });
                await this.loadGoal(this.goal.id!);
                await this.loadTransactions(this.goal.id!);
                this.events.emitGoalTransactionUpdated();
                this.events.emitGoalUpdated(this.goal);
              } catch (error) {
                console.error('Error updating transaction:', error);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTransaction(transaction: GoalTransaction) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar transacción?',
      message: '¿Estás seguro de que deseas eliminar esta transacción?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (this.goal && transaction.id) {
              try {
                await this.goalsService.deleteGoalTransaction(transaction.id);
                await this.loadGoal(this.goal.id!);
                await this.loadTransactions(this.goal.id!);
                this.events.emitGoalTransactionDeleted();
                this.events.emitGoalUpdated(this.goal);
              } catch (error) {
                console.error('Error deleting transaction:', error);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addProgress() {
    if (!this.goal) return;

    const alert = await this.alertCtrl.create({
      header: 'Agregar Progreso',
      message: this.showValidationError ? 'Por favor, ingrese una cantidad válida.' : '',
      inputs: [
      {
        name: 'amount',
        type: 'number',
        placeholder: 'Cantidad'
      },
      {
        name: 'description',
        type: 'text',
        placeholder: 'Descripción (opcional)'
      }
      ],
      buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Agregar',
        handler: async (data) => {
        const amount = parseFloat(data.amount);
        
        if (isNaN(amount) || amount <= 0) {
          this.showValidationError = true;
          alert.message = 'Por favor, ingrese una cantidad válida mayor que cero.';
          return false; // Prevents alert from closing
        }
        
        if (amount > 9999999999) {
          this.showValidationError = true;
          alert.message = 'La cantidad excede el límite máximo permitido.';
          return false; // Prevents alert from closing
        }
        
        this.showValidationError = false;
            if (data.amount && amount > 0 && amount <= 9999999999 && this.goal) {
              try {
                await this.goalsService.addGoalTransaction({
                  goalId: this.goal.id!,
                  amount: parseFloat(data.amount),
                  date: new Date().toISOString(),
                  description: data.description
                });
                await this.loadGoal(this.goal.id!);
                await this.loadTransactions(this.goal.id!);
                this.events.emitGoalTransactionAdded();
                this.events.emitGoalUpdated(this.goal);
              } catch (error) {
                console.error('Error adding progress:', error);
              }
            }
            return true; // Close the alert after successful operation
          }
        }
      ]
    });
    await alert.present();
  }

  getProgressPercentage(): number {
    if (!this.goal) return 0;
    return (this.goal.currentAmount / this.goal.targetAmount) * 100;
  }

  goBack() {
    this.router.navigate(['/tabs/goals']);
  }

  hasChanges(): boolean {
    if (!this.goal || !this.originalGoal) return false;
    return JSON.stringify(this.goal) !== JSON.stringify(this.originalGoal);
  }
}