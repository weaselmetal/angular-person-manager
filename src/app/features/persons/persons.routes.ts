import { Routes } from '@angular/router';
import { PersonList } from './person-list/person-list';
import { PersonDetail } from './person-detail/person-detail';
import { PersonForm } from './person-form/person-form';
import { PersonFormTd } from './person-form-td/person-form-td';

export const PERSON_ROUTES: Routes = [
  {
    path: '',
    component: PersonList
  },
  {
    path: 'new',
    component: PersonForm
  },
  {
    path: ':id/edit',
    component: PersonForm
  },
  {
    path: ':id/edit-td',
    component: PersonFormTd
  },
  {
    path: ':id',
    component: PersonDetail
  }
];