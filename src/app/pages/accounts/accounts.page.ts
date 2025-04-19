import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonCardSubtitle,
  IonButtons,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel

} from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { CurrencyService } from '../../services/currency.service';
import { Transaction } from '../../models/transaction.model';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { EventsService } from '../../services/events.service';
import { Subscription, merge } from 'rxjs';
import { h } from 'ionicons/dist/types/stencil-public-runtime';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
    IonButtons,
    IonBackButton,
    NgxEchartsModule,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    HeaderComponent
  ]
})
export class AccountsPage implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  transactions: Transaction[] = [];
  private subscriptions = new Subscription();
  
  // Añadir estas propiedades
  availableMonths: string[] = [];
  selectedMonth: string = '';
  
  pieChartOption: EChartsOption = {};
  lineChartOption: EChartsOption = {};
  barChartOption: EChartsOption = {};
  
  // Mapa para mantener colores consistentes por categoría
  private categoryColors: Map<string, string> = new Map();
  
  // Colores predefinidos para categorías
  private colorPalette: string[] = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4ec2c9',
    '#f9917b', '#a5d16f', '#8378ea', '#e06343', '#44c0c1'
  ];

  constructor(
    private database: DatabaseService,
    private events: EventsService,
    private cdr: ChangeDetectorRef,
    private currencyService: CurrencyService
  ) {}

  ionViewWillEnter() {
    this.loadTransactions();
  }

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadTransactions();
  }

  private initializeSubscriptions() {
    // Add your subscription initialization logic here
  }

  // Nueva función para manejar el cambio de mes
  onMonthChange(event: any) {
    this.selectedMonth = event.detail.value;
    this.preparePieChartData();
    this.cdr.detectChanges();
  }

  // Obtener meses disponibles de las transacciones
  private getAvailableMonths() {
    const monthsSet = new Set<string>();
    
    this.transactions.forEach(t => {
      if (t.amount > 0) { // Solo para gastos
        const date = new Date(t.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthsSet.add(monthYear);
      }
    });
    
    this.availableMonths = Array.from(monthsSet).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });
    
    // Seleccionar el mes actual por defecto
    if (!this.selectedMonth || !this.availableMonths.includes(this.selectedMonth)) {
      const now = new Date();
      const currentMonth = `${now.getMonth() + 1}/${now.getFullYear()}`;
      
      if (this.availableMonths.includes(currentMonth)) {
        this.selectedMonth = currentMonth;
      } else if (this.availableMonths.length > 0) {
        // Si no hay datos para el mes actual, seleccionar el último mes disponible
        this.selectedMonth = this.availableMonths[this.availableMonths.length - 1];
      }
    }
  }
  
  // Función para obtener el nombre del mes para mostrar
  getMonthName(monthString: string): string {
    const [month, year] = monthString.split('/').map(Number);
    const date = new Date(year, month - 1, 1);
    
    // Formato: "Junio 2023"
    return date.toLocaleString('es', { month: 'long', year: 'numeric' });
  }

  private async loadTransactions() {
    try {
      this.transactions = await this.database.getTransactions();
      this.getAvailableMonths(); // Obtener meses disponibles
      this.updateAllCharts();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cargar las transacciones:', error);
    }
  }

  // Modificar preparePieChartData para filtrar por mes seleccionado
  private updateAllCharts() {
    this.preparePieChartData();
    this.prepareLineChartData();
    this.prepareBarChartData();
  }

  private preparePieChartData() {
    const categoryData = new Map<string, number>();
    
    if (!this.selectedMonth) return;
    
    // Primero, recopilamos todas las categorías de todas las transacciones
    // para asignar colores consistentes
    this.transactions.forEach(t => {
      if (t.amount > 0 && !this.categoryColors.has(t.category)) {
        const colorIndex = this.categoryColors.size % this.colorPalette.length;
        this.categoryColors.set(t.category, this.colorPalette[colorIndex]);
      }
    });
    
    // Luego, filtramos por el mes seleccionado para los datos del gráfico
    this.transactions.forEach(t => {
      if (t.amount > 0) {
        const date = new Date(t.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (monthYear === this.selectedMonth) {
          const current = categoryData.get(t.category) || 0;
          categoryData.set(t.category, current + t.amount);
        }
      }
    });
  
    this.pieChartOption = {
      animation: true,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}: ${this.currencyService.formatAmount(params.value)} (${params.percent}%)`;
        },
        position: function (point: any, params: any, dom: any, rect: any, size: any) {
          const viewWidth = size.viewSize[0];
          const viewHeight = size.viewSize[1];
          const contentWidth = dom.offsetWidth;
          const contentHeight = dom.offsetHeight;
  
          let x = point[0];
          let y = point[1];
  
          if (x + contentWidth > viewWidth) {
            x = x - contentWidth;
          }
          if (y + contentHeight > viewHeight) {
            y = y - contentHeight;
          }
  
          return [x, y];
        },
        confine: true
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        type: 'scroll',
        width: '80%',
        textStyle: {
          fontSize: 12,
          overflow: 'truncate',
          width: 100
        },
        pageTextStyle: {
          color: '#888'
        },
        formatter: (name: string) => {
          const value = categoryData.get(name) || 0;
          const shortName = name.length > 15 ? name.slice(0, 12) + '...' : name;
          return `${shortName}: ${this.currencyService.formatAmount(value)}`;
        }
      },
      grid: {
        containLabel: true
      },
      series: [{
        name: 'Gastos por Categoría',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data: Array.from(categoryData.entries()).map(([name, value]) => ({
          name,
          value,
          itemStyle: {
            color: this.categoryColors.get(name)
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }))
      }]
    };
  }

  private prepareLineChartData() {
    const monthlyData = new Map<string, { expenses: number, income: number }>();
    
    this.transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      const current = monthlyData.get(monthYear) || { expenses: 0, income: 0 };
      if (t.amount > 0) {
        current.expenses += t.amount;
      } else {
        current.income += Math.abs(t.amount);
      }
      monthlyData.set(monthYear, current);
    });

    const sortedMonths = Array.from(monthlyData.keys()).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });

    this.lineChartOption = {
      animation: true,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: (params: any) => {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${this.currencyService.formatAmount(param.value)}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Ingresos', 'Gastos'],
        bottom: '10'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: sortedMonths
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => this.currencyService.formatAmount(value)
        }
      },
      series: [
        {
          name: 'Ingresos',
          type: 'line',
          areaStyle: {
            opacity: 0.3
          },
          emphasis: {
            focus: 'series',
            areaStyle: {
              opacity: 0.5
            }
          },
          data: sortedMonths.map(m => monthlyData.get(m)?.income || 0),
          itemStyle: {
            color: '#2dd36f'
          }
        },
        {
          name: 'Gastos',
          type: 'line',
          areaStyle: {
            opacity: 0.3
          },
          emphasis: {
            focus: 'series',
            areaStyle: {
              opacity: 0.5
            }
          },
          data: sortedMonths.map(m => monthlyData.get(m)?.expenses || 0),
          itemStyle: {
            color: '#eb445a'
          }
        }
      ]
    };
  }

  private prepareBarChartData() {
    const last6Months = this.getLast6Months();
    const monthlyBalance = new Map<string, number>();

    this.transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (last6Months.includes(monthYear)) {
        const current = monthlyBalance.get(monthYear) || 0;
        monthlyBalance.set(monthYear, current + (t.amount * -1));
      }
    });

    this.barChartOption = {
      animation: true,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const value = params[0].value;
          const sign = value >= 0 ? '+' : '';
          return `${params[0].name}: ${sign}${this.currencyService.formatAmount(Math.abs(value))}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: last6Months,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => this.currencyService.formatAmount(value)
        }
      },
      series: [{
        name: 'Balance Mensual',
        type: 'bar',
        data: last6Months.map(m => monthlyBalance.get(m) || 0),
        itemStyle: {
          color: (params: any) => {
            return params.value >= 0 ? '#2dd36f' : '#eb445a';
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }

  private getLast6Months(): string[] {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(`${d.getMonth() + 1}/${d.getFullYear()}`);
    }
    return months;
  }
}