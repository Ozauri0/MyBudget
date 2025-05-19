import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonItem, IonLabel, IonToggle, IonSelect, IonSelectOption, IonIcon } from '@ionic/angular/standalone';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline, contrastOutline } from 'ionicons/icons';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonItem, 
    IonLabel, 
    IonToggle, 
    IonSelect, 
    IonSelectOption,
    IonIcon
  ],
  template: `
    <ion-item lines="none" button (click)="toggleDarkMode()">
      <ion-icon slot="start" [name]="isDarkMode ? 'moon-outline' : 'sunny-outline'" 
        [color]="isDarkMode ? 'light' : 'warning'"></ion-icon>
      <ion-label>Modo oscuro</ion-label>
      <ion-toggle 
        slot="end"
        [checked]="isDarkMode">
      </ion-toggle>
    </ion-item>
    
    <ion-item lines="none">
      <ion-icon slot="start" name="contrast-outline" color="primary"></ion-icon>
      <ion-label>Tema</ion-label>
      <ion-select 
        [(ngModel)]="currentTheme" 
        (ionChange)="onThemeChange($event)"
        interface="popover"
        align="end">
        <ion-select-option value="system">Sistema</ion-select-option>
        <ion-select-option value="light">Claro</ion-select-option>
        <ion-select-option value="dark">Oscuro</ion-select-option>
      </ion-select>
    </ion-item>
  `,
  styles: [`
    ion-item {
      --border-radius: 10px;
      margin-bottom: 8px;
    }
    ion-icon {
      font-size: 20px;
    }
    ion-toggle {
      padding-right: 0;
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  currentTheme: ThemeMode = 'system';
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    addIcons({ sunnyOutline, moonOutline, contrastOutline });
  }

  ngOnInit() {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.isDarkMode = this.themeService.isDarkMode();
    
    // suscribe to theme changes
    this.themeService.themeMode$.subscribe(mode => {
      this.currentTheme = mode;
      this.isDarkMode = this.themeService.isDarkMode();
    });
  }

  toggleDarkMode() {
    const newIsDark = !this.isDarkMode;
    this.themeService.setThemeMode(newIsDark ? 'dark' : 'light');
  }

  onThemeChange(event: any) {
    this.themeService.setThemeMode(event.detail.value as ThemeMode);
  }
}