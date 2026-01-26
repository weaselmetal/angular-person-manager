import { Routes } from '@angular/router';
import { PersonList } from './person-list/person-list';
import { PersonDetail } from './person-detail/person-detail';
import { PersonForm } from './person-form/person-form';
import { PersonEditPage } from './person-edit-page';

export const PERSON_ROUTES: Routes = [
  {
    path: '',
    component: PersonList
  },
  {
    path: 'new',
    component: PersonEditPage
  },
  {
    path: ':id/edit',
    component: PersonForm
  },
  {
    path: ':id/edit-td',
    component: PersonEditPage
  },
  {
    path: ':id',
    component: PersonDetail
  }
];