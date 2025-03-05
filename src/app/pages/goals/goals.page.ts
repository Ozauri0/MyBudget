import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GoalsService } from '../../services/goals.service';
import { EventsService } from '../../services/events.service';
import { Goal } from '../../models/goal.model';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { addOutline} from 'ionicons/icons';

@Component({
  selector: 'app-add-goal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nueva Meta</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-input 
            label="Nombre de la meta"
            labelPlacement="floating"
            [(ngModel)]="goal.name" 
            placeholder="Nombre de la meta">
          </ion-input>
        </ion-item>
        
        <ion-item>
          <ion-input 
            type="number" 
            label="Cantidad objetivo"
            labelPlacement="floating"
            [(ngModel)]="goal.targetAmount" 
            placeholder="0.00">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            type="date"
            label="Fecha límite (opcional)"
            labelPlacement="floating"
            [(ngModel)]="goal.deadline">
          </ion-input>
        </ion-item>

      </ion-list>

      <ion-button expand="block" (click)="submit()">
        Crear Meta
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddGoalComponent {
  goal = {
    name: '',
    targetAmount: '',
    deadline: '',
    description: ''
  };

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss();
  }

  submit() {
    const targetAmount = parseFloat(this.goal.targetAmount);
    if (this.goal.name && targetAmount > 0 && targetAmount <= 999999999) {
      this.modalCtrl.dismiss(this.goal);
    } else {
      console.error('El monto objetivo debe ser un número positivo y no mayor a 99 millones.');
    }
  }
  }

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class GoalsPage implements OnInit, OnDestroy {
  goals: Goal[] = [];
  private subscriptions: Subscription[] = [];
  addOutline = addOutline;

  constructor(
    private goalsService: GoalsService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private events: EventsService
  ) {
    this.subscriptions = [
      this.events.goalUpdated$.subscribe(() => {
        this.loadGoals();
      }),
      this.events.goalTransactionAdded$.subscribe(() => {
        this.loadGoals();
      }),
      this.events.goalTransactionUpdated$.subscribe(() => {
        this.loadGoals();
      }),
      this.events.goalTransactionDeleted$.subscribe(() => {
        this.loadGoals();
      }),
      // Agregar suscripción para la importación de base de datos
      this.events.databaseImported$.subscribe(() => {
        this.loadGoals();
      })
    ];
  }

  ngOnInit() {
    this.loadGoals();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async loadGoals() {
    this.goals = await this.goalsService.getGoals();
  }

  async addGoal() {
    const modal = await this.modalCtrl.create({
      component: AddGoalComponent,
      breakpoints: [0, 1, 1],
      initialBreakpoint: 1,
      backdropBreakpoint: 1
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      await this.goalsService.addGoal({
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: 0,
        deadline: data.deadline,
        description: data.description,
        createdAt: new Date().toISOString()
      });
      this.events.emitGoalAdded();
      this.loadGoals();
    }
  }

  async deleteGoal(event: Event, goal: Goal) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar meta?',
      message: '¿Estás seguro de que deseas eliminar esta meta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (goal.id) {
              await this.goalsService.deleteGoal(goal.id);
              this.events.emitGoalDeleted();
              this.loadGoals();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addProgress(event: Event, goal: Goal) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Agregar Progreso',
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
            if (data.amount && goal.id) {
              await this.goalsService.addGoalTransaction({
                goalId: goal.id,
                amount: parseFloat(data.amount),
                date: new Date().toISOString(),
                description: data.description
              });
              this.events.emitGoalTransactionAdded();
              this.events.emitGoalUpdated(goal);
              this.loadGoals();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  navigateToDetails(goal: Goal) {
    this.router.navigate(['/tabs/goals', goal.id]);
  }

  getProgressPercentage(goal: Goal): number {
    return (goal.currentAmount / goal.targetAmount) * 100;
  }
}