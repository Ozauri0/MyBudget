import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { BackButtonService } from './services/back-button.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private backButtonService: BackButtonService) {
    this.initializeApp();
  }

  private initializeApp() {
    this.backButtonService.setupBackButton();
  }
}
