import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { PersonService } from '../person.service';
import { Person } from '../person';

@Component({
  selector: 'app-person-form-td',
  standalone: true,
  imports: [FormsModule, RouterLink, JsonPipe],
  template: `
    <h2>Edit Person (Template-Driven)</h2>

    <pre>{{ person | json }}</pre>

    @if (personLoaded()) {
      <form #personForm="ngForm" (ngSubmit)="onSubmit(personForm)">
        
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            [(ngModel)]="person.name" 
            required 
            minlength="3"
            #nameInput="ngModel"
          >
          
          @if (nameInput.invalid && nameInput.touched) {
            <div style="color: red">
              Name is required (min 3 chars).
            </div>
          }
        </div>

        <div>
          <label>Age:</label>
          <input 
            type="number" 
            name="age" 
            [(ngModel)]="person.age" 
            min="0"
            max="120"
            required
            #ageInput="ngModel"
          >

          @if (ageInput.invalid && ageInput.touched) {
            <div style="color: red">
              Age is invalid (>= 0, < 120)
            </div>
          }
        </div>

        <br>

        <button type="submit" [disabled]="personForm.invalid">Save</button>
        <a routerLink="/persons" style="margin-left: 10px">Cancel</a>

      </form>
    } @else {
      <p>Loading person data...</p>
    }
  `,
  styles: `
    div { margin-bottom: 15px; }
    input.ng-invalid.ng-touched { border-color: red; }
    label { display: block; font-weight: bold; margin-bottom: 5px; }
  `
})
export class PersonFormTd {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PersonService);

  // temporary person object to work with or overwrite
  person: Person = { id: '', name: '' };

  personLoaded = signal(false);

  constructor() {
    // use a constructor only for setting up dependencies, set up the view etc in ngOnInit!
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getPerson(id).subscribe(p => {
        this.person = p;
        this.personLoaded.set(true);
      });
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {    
      this.service.update(this.person).subscribe({
        next: () => this.router.navigate(['/persons']),
        error: (err) => console.error('Update failed', err)
      });
    }
  }
}