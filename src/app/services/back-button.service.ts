import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular/standalone';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  private history: string[] = [];

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    // Mantener historial de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.history.push(event.urlAfterRedirects);
    });
  }

  setupBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // Verificar modales y alertas primero
      const modal = await this.modalCtrl.getTop();
      if (modal) {
        modal.dismiss();
        return;
      }

      const alert = await this.alertCtrl.getTop();
      if (alert) {
        alert.dismiss();
        return;
      }

      // Si hay historial de navegación, volver atrás
      if (this.history.length > 1) {
        this.history.pop(); // Quitar página actual
        const previousPage = this.history[this.history.length - 1];
        this.router.navigate([previousPage]);
        return;
      }

      // Si estamos en la página principal (tabs/home), mostrar alerta de confirmación
      if (this.router.url === '/tabs/home') {
        const alert = await this.alertCtrl.create({
          header: '¿Salir de la aplicación?',
          message: '¿Estás seguro que deseas cerrar la app?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Salir',
              handler: () => {
                App.exitApp();
              }
            }
          ]
        });
        await alert.present();
      } else {
        // Si no estamos en la página principal, volver a ella
        this.router.navigate(['/tabs/home']);
      }
    });
  }
}