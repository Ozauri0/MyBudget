# MyBudget - Gestión de Finanzas Personales

## 🌟 ¿Qué es MyBudget?

**MyBudget** es una aplicación móvil intuitiva y desarrollada con Ionic y Angular que te ayuda a tomar el control de tus finanzas personales. Diseñada para facilitar el seguimiento de gastos, ingresos y el análisis de tus hábitos financieros, esta aplicación te acompaña en el camino hacia una mejor salud financiera.

## ✨ Características principales

- **Panel de control intuitivo** que muestra tu balance actual y recientes transacciones
- **Análisis de gastos** con gráficos interactivos que te permiten visualizar dónde va tu dinero
- **Categorización de transacciones** para una mejor organización
- **Establecimiento de metas** para ahorros específicos
- **Soporte para múltiples monedas** para adaptarse a tu país o región
- **Modo offline** con almacenamiento local usando SQLite
- **Diseño responsive** adaptado a diferentes tamaños de pantalla

## 🛠️ Tecnologías utilizadas

- **Angular 19** - Framework de frontend
- **Ionic 8** - Framework para aplicaciones móviles híbridas
- **Capacitor 6** - Compilación nativa y acceso a APIs nativas
- **SQLite** - Base de datos local
- **ECharts 5** - Visualización de datos y gráficos
- **RxJS** - Programación reactiva para manejo de eventos

## 📱 Capturas de pantalla

<div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
  <img src="https://github.com/user-attachments/assets/f051e023-ec34-43ff-8090-df07d0167b21" alt="Pantalla Principal" width="30%">
  <img src="https://github.com/user-attachments/assets/8e569b1e-408a-44a7-811c-2b9138bfbf74" alt="Análisis de Gastos" width="30%">
  <img src="https://github.com/user-attachments/assets/3ea0ad67-b05b-490e-83e4-943b53b79a76" alt="Metas" width="30%">
</div>

## 🚀 Instalación y configuración

### Requisitos

- Node.js (v16 o superior)
- npm (v7 o superior)
- Android Studio (para compilar para Android)
- Xcode (para compilar para iOS, solo disponible en macOS)

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/Ozauri0/MyBudget.git
cd MyBudget
```
2. **Instalar dependencias**
```bash
npm install
```
### Compilar en dispositivos móviles
#### Android
```bash
ionic capacitor build android
```
#### IOS
```bash
ionic capacitor build ios
```