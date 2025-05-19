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
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

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

  // variable to store the current theme mode
  // (dark or light)
  isDarkMode: boolean = false;

  constructor(
    private database: DatabaseService,
    private events: EventsService,
    private cdr: ChangeDetectorRef,
    private currencyService: CurrencyService,
    private themeService: ThemeService 
  ) {}

  ionViewWillEnter() {
    this.checkDarkMode(); // update dark mode on view enter
    this.loadTransactions();
  }

  ngOnInit() {
    this.initializeSubscriptions();
    this.checkDarkMode();
    this.loadTransactions();
  }

  private initializeSubscriptions() {
    // suscription to listen for changes in transactions
    const themeSub = this.themeService.themeMode$.subscribe(() => {
      this.checkDarkMode();
      this.updateAllCharts();
    });
    
    this.subscriptions.add(themeSub);
  }

  // use this function to check the current theme mode
  // and update the isDarkMode variable
  private checkDarkMode() {
    this.isDarkMode = this.themeService.isDarkMode();
    console.log('Tema detectado (desde ThemeService):', this.isDarkMode ? 'oscuro' : 'claro');
  }

  // get the text color based on the current theme
  private getTextColor(): string {
    return this.isDarkMode ? '#ffffff' : '#333333';
  }

  // get the tooltip background color based on the current theme
  private getTooltipBackgroundColor(): string {
    return this.isDarkMode ? '#1e1e1e' : '#ffffff';
  }

  // get the tooltip border color based on the current theme
  private getTooltipBorderColor(): string {
    return this.isDarkMode ? '#3a3a3a' : '#e0e0e0';
  }

  // new function to handle the month change
  onMonthChange(event: any) {
    this.selectedMonth = event.detail.value;
    this.preparePieChartData();
    this.cdr.detectChanges();
  }

  // get the available months from the transactions
  private getAvailableMonths() {
    const monthsSet = new Set<string>();
    
    this.transactions.forEach(t => {
      if (t.amount > 0) { // only consider positive transactions
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
    
    // select the last month available
    // if no month is selected or the selected month is not available
    if (!this.selectedMonth || !this.availableMonths.includes(this.selectedMonth)) {
      const now = new Date();
      const currentMonth = `${now.getMonth() + 1}/${now.getFullYear()}`;
      
      if (this.availableMonths.includes(currentMonth)) {
        this.selectedMonth = currentMonth;
      } else if (this.availableMonths.length > 0) {
        // if the current month is not available, select the last available month
        this.selectedMonth = this.availableMonths[this.availableMonths.length - 1];
      }
    }
  }
  
  // function to get the month name from the month string
  // format: "MM/YYYY"
  getMonthName(monthString: string): string {
    const [month, year] = monthString.split('/').map(Number);
    const date = new Date(year, month - 1, 1);
  
    // Use toLocaleString to get the month name in Spanish
    return date.toLocaleString('es', { month: 'long', year: 'numeric' });
  }

  private async loadTransactions() {
    try {
      this.transactions = await this.database.getTransactions();
      this.getAvailableMonths(); // get available months after loading transactions
      this.updateAllCharts();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cargar las transacciones:', error);
    }
  }

  // update all charts
  // this function is called when the month is changed
  private updateAllCharts() {
    this.preparePieChartData();
    this.prepareLineChartData();
    this.prepareBarChartData();
  }

  private preparePieChartData() {
    const categoryData = new Map<string, number>();
    
    if (!this.selectedMonth) return;
    
    // first, we need to filter the transactions by month
    // and then we will assign colors to the categories
    this.transactions.forEach(t => {
      if (t.amount > 0 && !this.categoryColors.has(t.category)) {
        const colorIndex = this.categoryColors.size % this.colorPalette.length;
        this.categoryColors.set(t.category, this.colorPalette[colorIndex]);
      }
    });
    
    // then we will filter the transactions by month
    // and sum the amounts for each category
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
  
    // get the total amount for the selected month
    const textColor = this.getTextColor();
    const borderColor = this.isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#fff';
    const tooltipBackgroundColor = this.getTooltipBackgroundColor();
    const tooltipBorderColor = this.getTooltipBorderColor();
  
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
        confine: true,
        backgroundColor: tooltipBackgroundColor,
        borderColor: tooltipBorderColor,
        textStyle: {
          color: textColor
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        type: 'scroll',
        width: '80%',
        textStyle: {
          fontSize: 12,
          overflow: 'truncate',
          width: 100,
          color: textColor
        },
        pageTextStyle: {
          color: textColor
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
          borderColor: borderColor,
          borderWidth: 1
        },
        label: {
          show: false,
          color: textColor
        },
        emphasis: {
          label: {
            show: false,
            color: textColor
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

    // get the total amount for the selected month
    const textColor = this.getTextColor();
    const tooltipBackgroundColor = this.getTooltipBackgroundColor();
    const tooltipBorderColor = this.getTooltipBorderColor();

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
        },
        backgroundColor: tooltipBackgroundColor,
        borderColor: tooltipBorderColor,
        textStyle: {
          color: textColor
        }
      },
      legend: {
        data: ['Ingresos', 'Gastos'],
        bottom: '10',
        textStyle: {
          color: textColor
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
        boundaryGap: false,
        data: sortedMonths,
        axisLabel: {
          color: textColor
        },
        axisLine: {
          lineStyle: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => this.currencyService.formatAmount(value),
          color: textColor
        },
        splitLine: {
          lineStyle: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
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

    // get the total amount for the selected month
    const textColor = this.getTextColor();
    const tooltipBackgroundColor = this.getTooltipBackgroundColor();
    const tooltipBorderColor = this.getTooltipBorderColor();

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
        },
        backgroundColor: tooltipBackgroundColor,
        borderColor: tooltipBorderColor,
        textStyle: {
          color: textColor
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
          rotate: 30,
          color: textColor
        },
        axisLine: {
          lineStyle: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => this.currencyService.formatAmount(value),
          color: textColor
        },
        splitLine: {
          lineStyle: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
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