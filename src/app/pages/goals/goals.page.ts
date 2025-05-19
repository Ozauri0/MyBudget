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
    <div class="modal-wrapper" [attr.data-theme]="currentTheme">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h2 class="modal-title">Nueva Meta</h2>
      </div>
      <div class="modal-content">
        <form>
          <!-- Alerta de validación -->
          <div *ngIf="showValidationError" class="validation-error">
            <ion-item color="danger" lines="none" style="--border-radius: 12px; border-radius: 12px;">
              <ion-icon name="alert-circle-outline" slot="start"></ion-icon>
              <ion-label>Por favor complete todos los campos obligatorios</ion-label>
            </ion-item>
          </div>
          
          <!-- Alerta de monto máximo excedido -->
          <div *ngIf="showMaximunexceededError" class="validation-error">
            <ion-item color="danger" lines="none" style="--border-radius: 12px; border-radius: 12px;">
              <ion-icon name="alert-circle-outline" slot="start"></ion-icon>
              <ion-label>El monto máximo es: 999999999</ion-label>
            </ion-item>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="goalName">Nombre de la meta</label>
            <input 
              type="text" 
              id="goalName" 
              class="form-input"
              [(ngModel)]="goal.name" 
              placeholder="Ej: Viaje a Japón"
              [class.invalid]="isFieldInvalid && !goal.name"
              [ngModelOptions]="{standalone: true}">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="targetAmount">Cantidad objetivo</label>
            <input 
              type="number" 
              id="targetAmount" 
              class="form-input"
              [(ngModel)]="goal.targetAmount" 
              placeholder="0.00"
              [class.invalid]="isFieldInvalid && !goal.targetAmount"
              [ngModelOptions]="{standalone: true}">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="deadline">Fecha límite (opcional)</label>
            <div class="date-container">
              <input 
                type="date" 
                id="deadline" 
                class="form-input"
                [(ngModel)]="goal.deadline"
                [ngModelOptions]="{standalone: true}">
              <div class="date-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="submit()">
              CREAR META
            </button>
            
            <button 
              type="button" 
              class="btn btn-link" 
              (click)="cancel()">
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Variables para modo claro y oscuro */
    .modal-wrapper {
      --placeholder-color-light: rgba(107, 114, 128, 0.8); /* Gris claro semitransparente */
      --placeholder-color-dark: rgba(255, 255, 255, 0.8); /* Blanco semitransparente */
      --input-bg-light: #ffffff;
      --input-bg-dark: #1f2937;
      --input-border-light: #d1d5db;
      --input-border-dark: #4b5563;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .modal-wrapper[data-theme="light"] {
      background-color: var(--ion-background-color, #ffffff);
      color: var(--ion-text-color, #1f2937);
    }
    
    .modal-wrapper[data-theme="dark"] {
      background-color: var(--ion-background-color, #111827);
      color: var(--ion-text-color, #f9fafb);
    }
    
    .modal-handle {
      width: 40px;
      height: 5px;
      background-color: var(--border-color, #374151);
      border-radius: 3px;
      margin: 12px auto;
    }
    
    .modal-header {
      padding: 0 20px 15px;
      border-bottom: 1px solid var(--border-color, #374151);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .modal-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }
    
    .modal-content {
      padding: 20px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      font-size: 0.9rem;
      margin-bottom: 8px;
      color: var(--text-secondary, #d1d5db);
      font-weight: 500;
    }
    
    .form-input, .form-select {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .modal-wrapper[data-theme="light"] .form-input,
    .modal-wrapper[data-theme="light"] .form-select {
      border: 1px solid var(--input-border-light);
      background-color: var(--input-bg-light);
      color: var(--ion-text-color);
    }

    .modal-wrapper[data-theme="dark"] .form-input,
    .modal-wrapper[data-theme="dark"] .form-select {
      border: 1px solid var(--input-border-dark);
      background-color: var(--input-bg-dark);
      color: var(--ion-text-color);
    }
    
    /* Estilos para placeholders en modo claro */
    .modal-wrapper[data-theme="light"] .form-input::placeholder {
      color: var(--placeholder-color-light);
      opacity: 1;
    }
    .modal-wrapper[data-theme="light"] .form-input::-webkit-input-placeholder {
      color: var(--placeholder-color-light);
    }
    .modal-wrapper[data-theme="light"] .form-input::-moz-placeholder {
      color: var(--placeholder-color-light);
    }
    .modal-wrapper[data-theme="light"] .form-input:-ms-input-placeholder {
      color: var(--placeholder-color-light);
    }

    /* Estilos para placeholders en modo oscuro */
    .modal-wrapper[data-theme="dark"] .form-input::placeholder {
      color: var(--placeholder-color-dark);
      opacity: 1;
    }
    .modal-wrapper[data-theme="dark"] .form-input::-webkit-input-placeholder {
      color: var(--placeholder-color-dark);
    }
    .modal-wrapper[data-theme="dark"] .form-input::-moz-placeholder {
      color: var(--placeholder-color-dark);
    }
    .modal-wrapper[data-theme="dark"] .form-input:-ms-input-placeholder {
      color: var(--placeholder-color-dark);
    }
    
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--ion-color-primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    
    .form-input.invalid, .form-select.invalid {
      border-color: var(--ion-color-danger);
    }
    
    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
    }
    
    /* Date input container */
    .date-container {
      position: relative;
    }
    
    .date-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary, #d1d5db);
      pointer-events: none;
    }
    
    /* Action buttons */
    .form-actions {
      margin-top: 30px;
    }
    
    .btn {
      display: block;
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      margin-bottom: 12px;
    }
    
    .btn-primary {
      background-color: var(--ion-color-primary);
      color: white;
      box-shadow: 0 2px 5px rgba(59, 130, 246, 0.3);
    }
    
    .btn-primary:hover {
      background-color: var(--ion-color-primary-shade);
    }
    
    .btn-link {
      background-color: transparent;
      color: var(--ion-color-primary);
    }
    
    .validation-error {
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class AddGoalComponent {
  showValidationError = false;
  showMaximunexceededError = false;
  isFieldInvalid = false;
  currentTheme: string = 'light';
  private themeObserver: MutationObserver | null = null;

  goal = {
    name: '',
    targetAmount: '',
    deadline: '',
    description: ''
  };

  constructor(private modalCtrl: ModalController) {
    // theme detection
    this.detectTheme();
    
    // configure observer
    this.setupThemeObserver();
  }

  ngOnInit() {
    this.detectTheme();
  }

  ngOnDestroy() {
    // clean up observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  // configure observer
  setupThemeObserver() {
    if (typeof MutationObserver !== 'undefined') {
      this.themeObserver = new MutationObserver(() => {
        this.detectTheme();
      });
      
      // obvserve changes in the body element
      // for data-theme and class attributes
      this.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      });
    }
  }

  // method to detect the current theme
  detectTheme() {
    // verify if the theme is set in the classes of body
    if (document.body.classList.contains('override-dark-mode')) {
      this.currentTheme = 'dark';
    } else if (document.body.classList.contains('override-light-mode')) {
      this.currentTheme = 'light';
    } 
    // verify if the theme is set in the data-theme attribute
    else if (document.body.hasAttribute('data-theme')) {
      this.currentTheme = document.body.getAttribute('data-theme') || 'light';
    } 
    // verify if the theme is set in local storage
    else {
      const savedTheme = localStorage.getItem('theme');
      this.currentTheme = savedTheme || 'light';
    }
    
    //verify if the system theme is set
    // if the user has not set a theme in the classes of body
    if (!document.body.classList.contains('override-dark-mode') && !document.body.classList.contains('override-light-mode')) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.currentTheme = 'light';
      }
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  submit() {
    const targetAmount = parseFloat(this.goal.targetAmount);
    if(targetAmount < 0 || targetAmount > 999999999){
      this.isFieldInvalid = true;
      this.showMaximunexceededError = true;
      setTimeout(() => {
        this.showMaximunexceededError = false;
      }, 3000);
    }
    else if (this.goal.name && targetAmount > 0 && targetAmount <= 999999999) {
      this.modalCtrl.dismiss(this.goal);
    } else {
      this.showValidationError = true;
      this.isFieldInvalid = true;
      setTimeout(() => {
        this.showValidationError = false;
      }, 3000);
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
  showCompletedGoals = false;
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
      // added to refresh goals when database is imported
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
  get filteredGoals() {
    return this.showCompletedGoals 
      ? this.goals 
      : this.goals.filter(goal => this.getProgressPercentage(goal) < 100);
  }
  
  getTotalAmount(): number {
    return this.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  }
  
  getCompletedGoals(): number {
    return this.goals.filter(goal => this.getProgressPercentage(goal) >= 100).length;
  }
}