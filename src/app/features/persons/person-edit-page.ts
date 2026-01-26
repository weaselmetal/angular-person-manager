import { Component, inject, input } from '@angular/core';
import { PersonFormTd } from './person-form-td/person-form-td'; // Pfad anpassen!
import { PersonNavigator } from './person-navigator';

@Component({
  standalone: true,
  imports: [PersonFormTd],
  template: `
    <app-person-form-td 
      [id]="id()" 
      (finish)="backToOverview()"
    />
  `
})
export class PersonEditPage {
  private personNavigator = inject(PersonNavigator);

  // This input comes from the URL parameter :id automatically
  id = input<string>();

  backToOverview() {
    this.personNavigator.toPersonList();
  }
}