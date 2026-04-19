import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

jeepSqlite(window);

const initApp = async () => {
  // Inicializar jeep-sqlite solo en web
  if (!Capacitor.isNativePlatform()) {
    const jeepEl = document.querySelector('jeep-sqlite');
    if (jeepEl) {
      await customElements.whenDefined('jeep-sqlite');
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      await sqlite.initWebStore();
    }
  }

  bootstrapApplication(AppComponent, {
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes),
      importProvidersFrom(
        NgxEchartsModule.forRoot({
          echarts: () => import('echarts')
        })
      )
    ],
  });
};

initApp();