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
    <ion-header>
      <ion-toolbar [color]="isExpense ? 'light' : 'light'">
        <ion-title>{{ isEdit ? 'Editar transacción' : (isExpense ? 'Nuevo Gasto' : 'Nuevo Ingreso') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Alerta de validación -->
      <div *ngIf="showValidationError" class="validation-error">
        <ion-item color="danger" lines="none" style="--border-radius: 8px; border-radius: 8px;">
          <ion-icon name="alert-circle-outline" slot="start"></ion-icon>
          <ion-label>Por favor complete todos los campos obligatorios</ion-label>
        </ion-item>
        </div>
        <!-- Alerta de validación -->
      <div *ngIf="showMaximunexceededError" class="validation-error">
        <ion-item color="danger" lines="none" style="--border-radius: 8px; border-radius: 8px;">
          <ion-icon name="alert-circle-outline" slot="start"></ion-icon>
          <ion-label>El monto máxmimo es: 999999999</ion-label>
        </ion-item>
      </div>
      
      <ion-list>
        <ion-item>
          <ion-input 
            [label]="isExpense ? 'Nombre del gasto' : 'Nombre del ingreso'"
            labelPlacement="floating"
            [(ngModel)]="expense.name" 
            [placeholder]="isExpense ? 'Nombre del gasto' : 'Nombre del ingreso'"
            [class.ion-invalid]="isFieldInvalid && !expense.name"
            autocapitalize="words">
          </ion-input>
        </ion-item>
        
        <ion-item>
          <ion-input 
            type="number" 
            label="Cantidad"
            labelPlacement="floating"
            [(ngModel)]="expense.amount" 
            placeholder="0.00"
            [class.ion-invalid]="isFieldInvalid && !expense.amount">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-select 
            label="Categoría"
            labelPlacement="floating"
            [(ngModel)]="expense.category"
            [class.ion-invalid]="isFieldInvalid && !expense.category">
            <ion-select-option *ngFor="let cat of getCategories()" [value]="cat">
              {{cat}}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input 
            type="date"
            label="Fecha"
            labelPlacement="floating"
            [(ngModel)]="expense.date">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-toggle [(ngModel)]="expense.isRecurrent" labelPlacement="start">
            ¿Es recurrente?
          </ion-toggle>
        </ion-item>

        <ion-item *ngIf="expense.isRecurrent">
          <ion-select 
            label="Tipo de recurrencia"
            labelPlacement="floating"
            [(ngModel)]="expense.recurrenceType">
            <ion-select-option value="monthly">Mensual</ion-select-option>
            <ion-select-option value="yearly">Anual</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item *ngIf="expense.isRecurrent">
          <ion-input 
            type="date"
            label="Próximo vencimiento"
            labelPlacement="floating"
            [(ngModel)]="expense.nextDueDate">
          </ion-input>
        </ion-item>
      </ion-list>

      <ion-button expand="block" [color]="isExpense ? 'primary' : 'primary'" (click)="submit()">
        {{ isEdit ? 'Guardar cambios' : (isExpense ? 'Agregar Gasto' : 'Agregar Ingreso') }}
      </ion-button>

      <ion-button *ngIf="isEdit" expand="block" color="danger" (click)="delete()">
        Eliminar transacción
      </ion-button>

      <ion-button expand="block" fill="clear" (click)="cancel()">Cancelar</ion-button>
    </ion-content>
  `,
  styles: [`
    .validation-error {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin-top: 4px;
      border-radius: 15px;
      }
    .required-fields-note {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-top: 10px;
      margin-bottom: 10px;
      padding-left: 16px;
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
  
  expense = {
    id: undefined as number | undefined,
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Fecha por defecto (hoy)
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
      
      // Ocultar el mensaje después de 3 segundos
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
      // Mostrar error de validación
      this.showValidationError = true;
      this.isFieldInvalid = true;
      
      // Ocultar el mensaje después de 3 segundos
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
    return this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === this.selectedMonth && 
             transactionDate.getFullYear() === this.selectedYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        // Construir una fecha correctamente formateada usando la zona horaria local
        let transactionDate: Date;
        if (data.date) {
          const dateParts = data.date.split('-');
          transactionDate = new Date(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]),
            12, 0, 0
          );
        } else {
          transactionDate = new Date();
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
        await this.database.addTransaction(transaction);
        await this.loadTransactions();
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
        if (data.date) {
          const dateParts = data.date.split('-');
          transactionDate = new Date(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]),
            12, 0, 0
          );
        } else {
          transactionDate = new Date();
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