import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { EventsService } from '../../services/events.service';
import { CurrencyService, CurrencyConfig } from '../../services/currency.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SetupPage implements OnInit {
  userName: string = '';
  userLastName: string = '';
  baseSalary: number = 0;
  currencies: CurrencyConfig[] = [];
  selectedCurrency: CurrencyConfig = {} as CurrencyConfig;
  isEditing: boolean = true; // Siempre verdadero en setup para poder editar la moneda

  constructor(
    private userService: UserService,
    private router: Router,
    private events: EventsService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.checkExistingUser();
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.currencies = this.currencyService.getAllCurrencies();
    this.selectedCurrency = this.currencyService.getCurrentCurrency();
  }

  async checkExistingUser() {
    const user = await this.userService.getUser();
    if (user) {
      this.router.navigate(['/tabs/home']);
    }
  }

  onCurrencyChange(currency: CurrencyConfig) {
    this.selectedCurrency = currency;
    this.currencyService.setCurrentCurrency(currency);
  }

  async onSubmit() {
    if (this.userName) {
      try {
        await this.userService.createUser({
          name: this.userName + ' ' + this.userLastName,
          baseSalary: this.baseSalary
        });
        // Guardar la moneda seleccionada
        this.currencyService.setCurrentCurrency(this.selectedCurrency);
        this.events.emitUserCreated();
        this.router.navigate(['/tabs/home']);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  }
}