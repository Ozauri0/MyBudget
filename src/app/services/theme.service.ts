import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // BehaviorSubject to handle theme changes
  private themeModeSubject = new BehaviorSubject<ThemeMode>('system');
  public themeMode$ = this.themeModeSubject.asObservable();
  
  // Media query to detect system dark mode preference
  private darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    // load the saved theme preference or system default
    this.loadThemePreference();
    
    // Hear the media query for system dark mode changes
    this.darkModeMediaQuery.addEventListener('change', () => {
      if (this.themeModeSubject.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  /**
   * load the saved theme preference from local storage
   * and apply it
   */
  async loadThemePreference(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'themeMode' });
      const savedTheme = value as ThemeMode || 'system';
      this.setThemeMode(savedTheme);
    } catch (error) {
      console.error('Error al cargar preferencias de tema:', error);
      this.setThemeMode('system');
    }
  }

  /**
   * Set the theme mode and save it to local storage
   */
  async setThemeMode(mode: ThemeMode): Promise<void> {
    this.themeModeSubject.next(mode);
    await Preferences.set({ key: 'themeMode', value: mode });
    this.applyTheme(mode);
  }

  /**
   * apply the theme mode to the document body
   * by adding or removing classes
   */
  private applyTheme(mode: ThemeMode): void {
    const body = document.body;
    
    // delete any existing theme classes
    body.classList.remove('override-dark-mode', 'override-light-mode');
    
    switch (mode) {
      case 'light':
        body.classList.add('override-light-mode');
        break;
      case 'dark':
        body.classList.add('override-dark-mode');
        break;
      case 'system':
      default:
        // no class is added for system mode
        // the system will handle the theme based on user preference
        break;
    }
  }

  /**
   * get the current theme mode
   */
  getCurrentTheme(): ThemeMode {
    return this.themeModeSubject.value;
  }

  /**
   * verify if the current theme is dark mode
   */
  isDarkMode(): boolean {
    if (this.themeModeSubject.value === 'dark') {
      return true;
    }
    if (this.themeModeSubject.value === 'system') {
      return this.darkModeMediaQuery.matches;
    }
    return false;
  }
}
