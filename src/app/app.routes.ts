import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'persons',
    pathMatch: 'full'
  },
  {
    path: 'persons',
    loadChildren: () => import('./features/persons/persons.routes').then(m => m.PERSON_ROUTES)
  }
];
