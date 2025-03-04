import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SetupGuard } from './guards/setup.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.page').then(m => m.SetupPage),
    canActivate: [SetupGuard]
  },
  {
    path: 'tabs',
    loadComponent: () => import('./components/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts.page').then(m => m.AccountsPage)
      },
      {
        path: 'goals',
        loadComponent: () => import('./pages/goals/goals.page').then(m => m.GoalsPage)
      },
      {
        path: 'goals/:id',
        loadComponent: () => import('./pages/goal-details/goal-details.page').then(m => m.GoalDetailsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];