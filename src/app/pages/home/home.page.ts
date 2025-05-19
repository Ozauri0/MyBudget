import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonFabList,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, addCircleOutline, removeCircleOutline, trendingDownOutline, trendingUpOutline, repeatOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DatabaseService } from '../../services/database.service';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';
import { EventsService } from '../../services/events.service';
import { Subscription } from 'rxjs';
import { AbsPipe } from '../../pipes/abs.pipe';

@Component({
  selector: 'app-add-expense',
  template: `
    <div class="modal-wrapper" [attr.data-theme]="currentTheme">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h2 class="modal-title">{{ isEdit ? 'Editar transacción' : (isExpense ? 'Nuevo Gasto' : 'Nuevo Ingreso') }}</h2>
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
            <label class="form-label" for="expenseName">
              {{ isExpense ? 'Nombre del gasto' : 'Nombre del ingreso' }}
            </label>
            <input 
              type="text" 
              id="expenseName" 
              class="form-input"
              [(ngModel)]="expense.name" 
              [placeholder]="isExpense ? 'Ej: Supermercado' : 'Ej: Salario'"
              [class.invalid]="isFieldInvalid && !expense.name"
              [ngModelOptions]="{standalone: true}">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="expenseAmount">Cantidad</label>
            <input 
              type="number" 
              id="expenseAmount" 
              class="form-input"
              [(ngModel)]="expense.amount" 
              placeholder="0.00"
              [class.invalid]="isFieldInvalid && !expense.amount"
              [ngModelOptions]="{standalone: true}">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="expenseCategory">Categoría</label>
            <select 
              id="expenseCategory" 
              class="form-select"
              [(ngModel)]="expense.category"
              [class.invalid]="isFieldInvalid && !expense.category"
              [ngModelOptions]="{standalone: true}">
              <option value="" disabled selected>Seleccionar categoría</option>
              <option *ngFor="let cat of getCategories()" [value]="cat">{{cat}}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="expenseDate">Fecha</label>
            <div class="date-container">
              <input 
                type="date" 
                id="expenseDate" 
                class="form-input"
                [(ngModel)]="expense.date"
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
          
          <div class="form-group toggle-container">
            <label class="form-label" for="expenseRecurring">¿Es recurrente?</label>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                id="expenseRecurring"
                [(ngModel)]="expense.isRecurrent"
                [ngModelOptions]="{standalone: true}">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div *ngIf="expense.isRecurrent" class="form-group">
            <label class="form-label" for="recurrenceType">Tipo de recurrencia</label>
            <select 
              id="recurrenceType" 
              class="form-select"
              [(ngModel)]="expense.recurrenceType"
              [ngModelOptions]="{standalone: true}">
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          
          <div *ngIf="expense.isRecurrent" class="form-group">
            <label class="form-label" for="nextDueDate">Próximo vencimiento</label>
            <div class="date-container">
              <input 
                type="date" 
                id="nextDueDate" 
                class="form-input"
                [(ngModel)]="expense.nextDueDate"
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
              class="btn" 
              [class.btn-expense]="isExpense" 
              [class.btn-income]="!isExpense" 
              (click)="submit()">
              {{ isEdit ? 'GUARDAR CAMBIOS' : (isExpense ? 'AGREGAR GASTO' : 'AGREGAR INGRESO') }}
            </button>
            
            <button 
              *ngIf="isEdit" 
              type="button" 
              class="btn btn-danger" 
              (click)="delete()">
              ELIMINAR TRANSACCIÓN
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
    
    /* Toggle switch */
    .toggle-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--border-color, #374151);
      transition: .4s;
      border-radius: 24px;
    }
    
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
      background-color: var(--ion-color-primary);
    }
    
    input:checked + .toggle-slider:before {
      transform: translateX(26px);
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
    
    .btn-expense {
      background-color: var(--expense-color, #f43f5e);
      color: white;
      box-shadow: 0 2px 5px rgba(244, 63, 94, 0.3);
    }
    
    .btn-expense:hover {
      background-color: var(--expense-hover, #e11d48);
    }
    
    .btn-income {
      background-color: var(--income-color, #10b981);
      color: white;
      box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
    }
    
    .btn-income:hover {
      background-color: var(--income-hover, #059669);
    }
    
    .btn-link {
      background-color: transparent;
      color: var(--ion-color-primary);
    }
    
    .btn-danger {
      background-color: var(--ion-color-danger);
      color: white;
      box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
    }
    
    .validation-error {
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonToggle,
    IonIcon
  ]
})
export class AddExpenseComponent {
  @Input() isExpense: boolean = true;
  @Input() isEdit: boolean = false;
  @Input() transaction?: Transaction;
  
  showValidationError = false;
  showMaximunexceededError = false;
  isFieldInvalid = false;
  currentTheme: string = 'light';
  private themeObserver: MutationObserver | null = null;
  
  expense = {
    id: undefined as number | undefined,
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // actual date
    isRecurrent: false,
    recurrenceType: 'monthly',
    nextDueDate: ''
  };


  expenseCategories = [
    'Supermercado',
    'Entretenimiento',
    'Transporte',
    'Servicios básicos',
    'Salud',
    'Educación',
    'Restaurantes',
    'Ropa',
    'Otros'
  ];

  incomeCategories = [
    'Salario',
    'Bonificación',
    'Inversiones',
    'Otros ingresos'
  ];

  constructor(private modalCtrl: ModalController) {
    addIcons({trendingUpOutline,trendingDownOutline,repeatOutline,checkmarkCircleOutline,addOutline,trashOutline,addCircleOutline,removeCircleOutline});
  }

  ngOnInit() {
    if (this.isEdit && this.transaction) {
      this.expense = {
        id: this.transaction.id,
        name: this.transaction.name,
        amount: Math.abs(this.transaction.amount).toString(),
        category: this.transaction.category,
        date: new Date(this.transaction.date).toISOString().split('T')[0],
        isRecurrent: this.transaction.isRecurrent || false,
        recurrenceType: this.transaction.recurrenceType || 'monthly',
        nextDueDate: this.transaction.nextDueDate || ''
      };
      this.isExpense = this.transaction.amount > 0;
    }
    
    // detect theme on init
    this.detectTheme();
    
    // obverse changes on theme
    this.setupThemeObserver();
  }

  ngOnDestroy() {
    // clean observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  // config observer
  setupThemeObserver() {
    if (typeof MutationObserver !== 'undefined') {
      this.themeObserver = new MutationObserver(() => {
        this.detectTheme();
      });
      
      // watch for changes in the body element
      this.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      });
    }
  }

  // method to detect theme
  detectTheme() {
    // Verificar clases de forzado de tema
    if (document.body.classList.contains('override-dark-mode')) {
      this.currentTheme = 'dark';
    } else if (document.body.classList.contains('override-light-mode')) {
      this.currentTheme = 'light';
    } 
    // verify if theme is set in data-theme attribute
    else if (document.body.hasAttribute('data-theme')) {
      this.currentTheme = document.body.getAttribute('data-theme') || 'light';
    } 
    // verify if theme is set in local storage
    else {
      const savedTheme = localStorage.getItem('theme');
      this.currentTheme = savedTheme || 'light';
    }
    
    // verify if system theme is set
    // if no theme is set in body classes
    if (!document.body.classList.contains('override-dark-mode') && !document.body.classList.contains('override-light-mode')) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.currentTheme = 'light';
      }
    }
  }

  getCategories() {
    return this.isExpense ? this.expenseCategories : this.incomeCategories;
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  submit() {

    if (parseFloat(this.expense.amount) > 999999999) {
      this.showMaximunexceededError = true;
      this.isFieldInvalid = true;
      
      // hide the message after 3 seconds
      setTimeout(() => {
        this.showMaximunexceededError = false;
      }, 3000);
    }
    else if (this.expense.name && this.expense.amount && this.expense.category) {
      this.modalCtrl.dismiss({
        ...this.expense,
        isExpense: this.isExpense
      });
    } else {
      // show validation error
      this.showValidationError = true;
      this.isFieldInvalid = true;
      
      // hide the message after 3 seconds
      setTimeout(() => {
        this.showValidationError = false;
      }, 3000);
    }
  }

  delete() {
    this.modalCtrl.dismiss({
      action: 'delete',
      id: this.expense.id
    });
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonFabList,
    IonSelect,
    IonSelectOption,
    AddExpenseComponent,
    AbsPipe
  ]
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('monthScroll') monthScroll: ElementRef | undefined;

  private subscriptions: Subscription[] = [];
  userData: User | null = null;
  transactions: Transaction[] = [];
  availableBalance: number = 0;
  monthlyExpenses: number = 0;
  monthlyIncome: number = 0;
  selectedMonth: number;
  selectedYear: number;
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  years: number[] = [];
  private previousIncome: number = 0;
  private previousExpenses: number = 0;
  private previousBalance: number = 0;
  isBalanceIncreasing: boolean = false;
  isBalanceDecreasing: boolean = false;

  constructor(
    private database: DatabaseService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private events: EventsService
) {
    addIcons({ 
        addOutline, 
        trashOutline, 
        addCircleOutline, 
        removeCircleOutline,
        trendingDownOutline,
        trendingUpOutline
    });

    const now = new Date();
    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();
    
    for (let year = 2024; year <= 2034; year++) {
        this.years.push(year);
    }

    this.subscriptions.push(
        this.events.userCreated$.subscribe(() => {
            this.loadUserData();
            this.loadTransactions();
        }),
        this.events.userUpdated$.subscribe(user => {
            this.userData = user;
            this.calculateBalance();
        }),
        // Agregar esta nueva suscripción
        this.events.databaseImported$.subscribe(() => {
            this.loadUserData();
            this.loadTransactions();
        })
    );
}

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollToSelectedMonth();
    }, 100);
  }

  private scrollToSelectedMonth() {
    if (this.monthScroll) {
      const container = this.monthScroll.nativeElement;
      const activeMonth = container.querySelector('.date-item.active');
      
      if (activeMonth) {
        const scrollLeft = activeMonth.offsetLeft - (container.offsetWidth / 2) + (activeMonth.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async ngOnInit() {
    await this.loadUserData();
    await this.loadTransactions();
  }

  onDateChange() {
    this.calculateMonthlyTotals();
    this.scrollToSelectedMonth();
  }

  private async loadUserData() {
    this.userData = await this.database.getUser();
    this.calculateBalance();
  }

  private async loadTransactions() {
    this.transactions = await this.database.getTransactions();
    this.calculateBalance();
    this.calculateMonthlyTotals();
  }

  private calculateMonthlyTotals() {
    this.previousIncome = this.monthlyIncome;
    this.previousExpenses = this.monthlyExpenses;
    
    this.monthlyExpenses = 0;
    this.monthlyIncome = 0;

    this.transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate.getMonth() === this.selectedMonth && 
          transactionDate.getFullYear() === this.selectedYear) {
        if (t.amount > 0) {
          this.monthlyExpenses += t.amount;
        } else {
          this.monthlyIncome += Math.abs(t.amount);
        }
      }
    });
  }

  private calculateBalance() {
    if (this.userData) {
      this.previousBalance = this.availableBalance;
      this.availableBalance = this.userData.baseSalary;
      this.transactions.forEach(t => {
        this.availableBalance += (t.amount * -1);
      });
      
      this.isBalanceIncreasing = this.availableBalance > this.previousBalance;
      this.isBalanceDecreasing = this.availableBalance < this.previousBalance;
    }
  }

  isIncreasing(type: 'income' | 'expense'): boolean {
    if (type === 'income') {
      return this.monthlyIncome > this.previousIncome;
    }
    return this.monthlyExpenses > this.previousExpenses;
  }

  isDecreasing(type: 'income' | 'expense'): boolean {
    if (type === 'income') {
      return this.monthlyIncome < this.previousIncome;
    }
    return this.monthlyExpenses < this.previousExpenses;
  }

  getFilteredTransactions(): Transaction[] {
    // Primero filtramos las transacciones del mes y año seleccionados
    const filteredTransactions = this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === this.selectedMonth && 
             transactionDate.getFullYear() === this.selectedYear;
    });
    
    // then sort them by date
    return filteredTransactions.sort((a, b) => {
      // convert date strings to Date objects
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // order by date descending
      return dateB.getTime() - dateA.getTime();
    });
  }

  async addTransaction(isExpense: boolean) {
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        isExpense
      },
      breakpoints: [0, 1, 1], 
      initialBreakpoint: 1,
      backdropBreakpoint: 1
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      const transamount = parseFloat(data.amount);
      if (transamount > 0 && transamount <= 99999999) { 
        // build a date with the current time
        let transactionDate: Date;
        const now = new Date(); // get current date and time
        
        if (data.date) {
          const dateParts = data.date.split('-');
          // make a date with the selected date but with the current time
          // and timezone
          transactionDate = new Date(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
          );
        } else {
          transactionDate = now; // use current date and time
        }
        
        const transaction: Transaction = {
          name: data.name,
          amount: parseFloat(data.amount) * (isExpense ? 1 : -1),
          category: data.category,
          date: transactionDate.toISOString(),
          isRecurrent: data.isRecurrent,
          recurrenceType: data.recurrenceType,
          nextDueDate: data.nextDueDate
        };
        
        // save the transaction to the database
        await this.database.addTransaction(transaction);
        
        // load the transactions again
        await this.loadTransactions();
        
        // check if the transaction date is in the selected month and year
        if (transactionDate.getMonth() === this.selectedMonth && 
            transactionDate.getFullYear() === this.selectedYear) {
          // update the monthly totals
          this.calculateMonthlyTotals();
        }
      }
    }
  }

  async editTransaction(transaction: Transaction) {
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        isEdit: true,
        isExpense: transaction.amount > 0,
        transaction: transaction
      },
      breakpoints: [0, 1, 1],
      initialBreakpoint: 1,
      backdropBreakpoint: 1
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      if (data.action === 'delete') {
        await this.deleteTransaction(data.id);
      }
      const editedamount = parseFloat(data.amount);
      if(editedamount > 0 && editedamount <=999999999){
        // Construir una fecha correctamente formateada usando la zona horaria local
        let transactionDate: Date;
        const now = new Date(); // Obtener fecha y hora actual del dispositivo
        
        if (data.date) {
          const dateParts = data.date.split('-');
          // Crear fecha con la fecha seleccionada pero con la hora actual del dispositivo
          transactionDate = new Date(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
          );
        } else {
          transactionDate = now; // Usar fecha y hora actual completa
        }
        
        const updatedTransaction: Transaction = {
          id: transaction.id,
          name: data.name,
          amount: parseFloat(data.amount) * (data.isExpense ? 1 : -1),
          category: data.category,
          date: transactionDate.toISOString(),
          isRecurrent: data.isRecurrent,
          recurrenceType: data.recurrenceType,
          nextDueDate: data.nextDueDate
        };
        await this.database.updateTransaction(updatedTransaction);
        await this.loadTransactions();
      }
    }
  }

  async deleteTransaction(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar transacción?',
      message: '¿Estás seguro que deseas eliminar esta transacción?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.database.deleteTransaction(id);
            await this.loadTransactions();
          }
        }
      ]
    });
    await alert.present();
  }
}