import { Routes } from '@angular/router';
import { PersonList } from './person-list/person-list';
import { PersonDetail } from './person-detail/person-detail';
import { PersonForm } from './person-form/person-form';
import { PersonEditPage } from './person-edit-page';
import { adminGuard, authGuard } from '../../auth-guard';

export const PERSON_ROUTES: Routes = [
  {
    path: '',
    component: PersonList
  },
  {
    path: 'new',
    canActivate: [adminGuard],
    component: PersonEditPage
  },
  {
    path: ':id/edit',
    canActivate: [adminGuard],
    component: PersonForm
  },
  {
    path: ':id/edit-td',
    canActivate: [adminGuard],
    component: PersonEditPage
  },
  {
    path: ':id',
    component: PersonDetail
  }
];