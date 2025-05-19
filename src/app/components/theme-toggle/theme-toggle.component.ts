import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonItem, IonLabel, IonToggle, IonIcon } from '@ionic/angular/standalone';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline } from 'ionicons/icons';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonItem, 
    IonLabel, 
    IonToggle, 
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
  `,
  styles: [`
    ion-item {
      --border-radius: 10px;
      --background: var(--card-bg, #252a33);
    }
    ion-icon {
      font-size: 20px;
    }
    ion-toggle {
      padding-right: 0;
    }
    :host-context(.override-light-mode) ion-item {
      --background: var(--ion-color-light, #f3f5f9);
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  currentTheme: ThemeMode = 'system';
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    addIcons({ sunnyOutline, moonOutline });
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
}