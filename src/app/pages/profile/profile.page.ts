import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  AlertController,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonText
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ThemeToggleComponent } from 'src/app/components/theme-toggle/theme-toggle.component';
import { DatabaseService } from '../../services/database.service';
import { User } from '../../models/user.model';
import { addIcons } from 'ionicons';
import { pencilOutline, colorPaletteOutline, downloadOutline, cloudUploadOutline } from 'ionicons/icons';
import { EventsService } from '../../services/events.service';
import { CurrencyService, CurrencyConfig } from '../../services/currency.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Data } from '@angular/router';


interface GradientBackground {
  id: number;
  name: string;
  gradient: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    ThemeToggleComponent,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonList,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonText
  ]
})
export class ProfilePage implements OnInit {
  userData: User | null = null;
  isEditing: boolean = false;
  userInitials: string = '';
  selectedGradient: number = 1;
  currencies: CurrencyConfig[] = [];
  selectedCurrency: CurrencyConfig;

  gradients: GradientBackground[] = [
    { id: 1, name: 'Azul', gradient: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)' },
    { id: 2, name: 'Verde', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
    { id: 3, name: 'Morado', gradient: 'linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)' },
    { id: 4, name: 'Naranja', gradient: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)' },
    { id: 5, name: 'Índigo', gradient: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)' },
    { id: 6, name: 'Océano', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
    { id: 7, name: 'Rosa', gradient: 'linear-gradient(135deg, #FF0080 0%, #FF8C00 100%)' },
    { id: 8, name: 'Esmeralda', gradient: 'linear-gradient(135deg, #43B692 0%, #16A085 100%)' },
    { id: 9, name: 'Atardecer', gradient: 'linear-gradient(135deg, #FF512F 0%, #F09819 100%)' },
    { id: 10, name: 'Lavanda', gradient: 'linear-gradient(135deg, #9795f0 0%, #fbc8d4 100%)' },
    { id: 11, name: 'Menta', gradient: 'linear-gradient(135deg, #2AF598 0%, #009EFD 100%)' },
    { id: 12, name: 'Cereza', gradient: 'linear-gradient(135deg, #FF0844 0%, #FFB199 100%)' }
  ];
  constructor(
    private database: DatabaseService,
    private alertCtrl: AlertController,
    private events: EventsService,
    private currencyService: CurrencyService
  ) {
    addIcons({colorPaletteOutline,pencilOutline,downloadOutline,cloudUploadOutline});
    this.currencies = this.currencyService.getAllCurrencies();
    this.selectedCurrency = this.currencyService.getCurrentCurrency();
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  ionViewWillEnter() {
    this.selectedCurrency = this.currencyService.getCurrentCurrency();
  }

  private async loadUserData() {
    try {
      this.userData = await this.database.getUser();
      if (this.userData?.name) {
        this.updateInitials(this.userData.name);
      }
      if (this.userData?.gradientId) {
        this.selectedGradient = this.userData.gradientId;
      } else if (this.userData) {
        this.userData.gradientId = this.selectedGradient;
        await this.database.updateUser(this.userData);
      }
      this.selectedCurrency = this.currencyService.getCurrentCurrency();
    } catch (error) {
      console.error('Error loading user data:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar los datos del usuario',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  updateInitials(name: string) {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      this.userInitials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 1) {
      this.userInitials = words[0].substring(0, 2).toUpperCase();
    } else {
      this.userInitials = 'U';
    }
  }

  async onCurrencyChange(currency: CurrencyConfig) {
    try {
      this.currencyService.setCurrentCurrency(currency);
      this.selectedCurrency = currency;
      await this.saveChanges();
    } catch (error) {
      console.error('Error changing currency:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cambiar la moneda',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async saveChanges() {
    if (this.userData) {
      try {
        this.updateInitials(this.userData.name);
        this.userData.gradientId = this.selectedGradient;
        await this.database.updateUser(this.userData);
        this.events.emitUserUpdated(this.userData);
        this.isEditing = false;
        
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Perfil actualizado correctamente',
          buttons: ['OK']
        });
        await alert.present();
      } catch (error) {
        console.error('Error updating profile:', error);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo actualizar el perfil',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  async selectGradient() {
    const alert = await this.alertCtrl.create({
      header: 'Seleccionar Fondo',
      cssClass: 'gradient-select-alert',
      inputs: this.gradients.map(gradient => ({
        type: 'radio',
        label: gradient.name,
        value: gradient.id,
        checked: this.selectedGradient === gradient.id,
        cssClass: `gradient-radio gradient-${gradient.id}`
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Seleccionar',
          cssClass: 'alert-button-confirm',
          handler: async (gradientId) => {
            this.selectedGradient = gradientId;
            if (this.userData) {
              this.userData.gradientId = gradientId;
              await this.saveChanges();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async exportDatabase(): Promise<void> {
    try {
      const confirmAlert = await this.alertCtrl.create({
        header: 'Exportar base de datos',
        message: '¿Deseas exportar todos tus datos?\nLa base de datos se guardará en el almacenamiento del dispositivo.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Exportar',
            handler: async () => {
              try {
                // generate timestamp for file name
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `mybudget_backup_${timestamp}.db`;
                
                // get data string base64
                const dbData: string = await this.database.exportDatabase();
                
                // if dbData is empty, show error
                if (!dbData) {
                  throw new Error("No se pudieron exportar los datos de la base de datos");
                }
                
                // save the file to the device
                const result = await Filesystem.writeFile({
                  path: `Download/${fileName}`,
                  data: dbData, 
                  directory: Directory.ExternalStorage,
                  recursive: true
                });
                
                // get the file URI
                // Note: The file URI is not needed for the export, but you can use it to show the user where the file is saved
                const fileInfo = await Filesystem.getUri({
                  path: `Download/${fileName}`,
                  directory: Directory.ExternalStorage
                });
                
                const successAlert = await this.alertCtrl.create({
                  header: 'Éxito',
                  message: `Base de datos exportada correctamente.\nPuedes encontrar el archivo en:\n${fileInfo.uri}`,
                  buttons: ['OK']
                });
                await successAlert.present();
              } catch (error) {
                console.error('Error exportando:', error);
                const errorAlert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se pudo exportar la base de datos. Por favor, verifica los permisos de almacenamiento.',
                  buttons: ['OK']
                });
                await errorAlert.present();
              }
            }
            
          }
        ]
      });
      await confirmAlert.present();
    } catch (error) {
      console.error('Error mostrando diálogo:', error);
    }
  }

  async importDatabase() {
    try {
      const confirmAlert = await this.alertCtrl.create({
        header: 'Importar base de datos',
        message: '¿Deseas importar una base de datos?\nEsto reemplazará todos los datos actuales.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Seleccionar archivo',
            handler: async () => {
              try {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.db';
                
                fileInput.onchange = async (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    
                    // Validar extensión del archivo
                    if (!file.name.toLowerCase().endsWith('.db')) {
                      const errorAlert = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'Por favor selecciona un archivo .db válido',
                        buttons: ['OK']
                      });
                      await errorAlert.present();
                      return;
                    }
    
                    try {
                      // reading the file as ArrayBuffer
                      const arrayBuffer = await file.arrayBuffer();
                      const base64Data = this.arrayBufferToBase64(arrayBuffer);
                      
                      // save the file to the device
                      const tempFileName = `temp_import_${new Date().getTime()}.db`;
                      await Filesystem.writeFile({
                        path: tempFileName,
                        data: base64Data, // base64Data is the content of the file
                        directory: Directory.Cache
                      });
                      
                      // get the file URI
                      const fileInfo = await Filesystem.getUri({
                        path: tempFileName,
                        directory: Directory.Cache
                      });
                      
                      // Import the database
                      await this.database.importDatabase(fileInfo.uri);
                      await this.loadUserData();
                      
                      // delete the temporary file
                      await Filesystem.deleteFile({
                        path: tempFileName,
                        directory: Directory.Cache
                      });
                      
                      const successAlert = await this.alertCtrl.create({
                        header: 'Éxito',
                        message: 'Base de datos importada correctamente',
                        buttons: ['OK']
                      });
                      await successAlert.present();
                    } catch (error) {
                      console.error('Error importando:', error);
                      const errorAlert = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'No se pudo importar la base de datos',
                        buttons: ['OK']
                      });
                      await errorAlert.present();
                    }
                  }
                };
    
                fileInput.click();
              } catch (error) {
                console.error('Error seleccionando archivo:', error);
                const errorAlert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se pudo seleccionar el archivo',
                  buttons: ['OK']
                });
                await errorAlert.present();
              }
            }
          }
        ]
      });
      await confirmAlert.present();
    } catch (error) {
      console.error('Error mostrando diálogo:', error);
    }
  }
  
  // auxiliary function to convert ArrayBuffer to base64
  // this is needed because the Filesystem API requires base64 data
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async cancelEdit() {
    this.isEditing = false;
    await this.loadUserData();
  }
}