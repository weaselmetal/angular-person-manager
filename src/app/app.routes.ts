import { Routes } from '@angular/router';
import { Login } from './login/login';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'persons',
    pathMatch: 'full'
  },
  {
    path: 'persons',
    canActivate: [authGuard],
    loadChildren: () => import('./features/persons/persons.routes').then(m => m.PERSON_ROUTES)
  },
  {
    path: 'login',
    component: Login
  }
];
