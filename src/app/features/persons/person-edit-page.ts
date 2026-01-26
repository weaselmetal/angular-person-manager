import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { PersonFormTd } from './person-form-td/person-form-td'; // Pfad anpassen!

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
  private router = inject(Router);

  // This input comes from the URL parameter :id automatically
  id = input<string>();

  backToOverview() {
    this.router.navigate(['/persons'], { queryParamsHandling: "preserve" });
  }
}