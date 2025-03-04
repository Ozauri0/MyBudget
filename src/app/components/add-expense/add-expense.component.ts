// src/app/components/add-expense/add-expense.component.ts
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
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
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-expense',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nuevo Gasto</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-input 
            label="Nombre" 
            labelPlacement="floating"
            [(ngModel)]="expense.name" 
            placeholder="Nombre del gasto">
          </ion-input>
        </ion-item>
        
        <ion-item>
          <ion-input 
            type="number" 
            label="Cantidad"
            labelPlacement="floating"
            [(ngModel)]="expense.amount" 
            placeholder="0.00">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-select 
            label="Categoría"
            labelPlacement="floating"
            [(ngModel)]="expense.category">
            <ion-select-option *ngFor="let cat of categories" [value]="cat">
              {{cat}}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="submit()">Agregar</ion-button>
      <ion-button expand="block" fill="clear" (click)="cancel()">Cancelar</ion-button>
    </ion-content>
  `,
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
    IonButton
  ]
})
export class AddExpenseComponent {
  expense = {
    name: '',
    amount: '',
    category: ''
  };

  categories = [
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

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.expense.name && this.expense.amount && this.expense.category) {
      this.modalCtrl.dismiss(this.expense);
    }
  }
}