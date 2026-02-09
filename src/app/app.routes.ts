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
    // with loadChildren, all the components referred to in persons.routes
    // get loaded in one aggregated chunk, but ONLY WHEN the user navigates
    // to some /persons/* route
    loadChildren: () => import('./features/persons/persons.routes').then(m => m.PERSON_ROUTES)
  },
  {
    path: 'login',
    component: Login
  }
];
