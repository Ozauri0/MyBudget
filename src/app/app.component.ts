import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { BackButtonService } from './services/back-button.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private backButtonService: BackButtonService,
    private themeService: ThemeService
  ) {
    this.initializeApp();
  }

  private initializeApp() {
    this.backButtonService.setupBackButton();
    this.themeService.loadThemePreference();
  }
}
