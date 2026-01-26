import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PersonService } from '../person.service';
import { Person } from '../person';
import { PersonNavigator } from '../person-navigator';

@Component({
  selector: 'app-person-form',
  // ReactiveFormsModule is required for formGroup and formControlName
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h2>{{ isEditMode() ? 'Edit Person' : 'Create New Person' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" type="text" formControlName="name" />
        
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <div class="error">Name is required.</div>
        }
      </div>

      <div class="form-group">
        <label for="age">Age</label>
        <input id="age" type="number" formControlName="age" />
        
        @if (form.controls.age.invalid && form.controls.age.touched) {
          <div class="error">Age is required and must be valid.</div>
        }
      </div>

      <div class="actions">
        <button type="submit" [disabled]="form.invalid">Save</button>
        <a routerLink="/persons" queryParamsHandling="preserve" class="btn-cancel">Cancel</a>
      </div>

    </form>
  `,
  styles: `
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: .5rem; }
    input { padding: 8px; width: 100%; max-width: 300px; }
    .error { color: red; font-size: 0.8rem; margin-top: 4px; }
    .actions { display: flex; gap: 10px; margin-top: 20px; }
    .btn-cancel { padding: 8px; text-decoration: none; color: black; border: 1px solid #ccc; background: #eee; }
  `
})
export class PersonForm {
  private fb = inject(FormBuilder);
  private service = inject(PersonService);
  private route = inject(ActivatedRoute);
  private personNavigator = inject(PersonNavigator);

  // Signal to track if we are editing an existing person or creating a new one
  isEditMode = signal(false);
  currentId: string | null = null;

  // Form Model definition
  // nonNullable ensures that values are always of their type (e.g., string) and never undefined.
  // set initial values (when a new Person is created), and define validity criteria
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(0), Validators.max(120)]]
  });

  constructor() {
    // Check if an ID is present in the URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Switch to Edit Mode
      this.isEditMode.set(true);
      this.currentId = id;

      // Load data and populate the form
      this.service.getPerson(id).subscribe(person => {
        // patchValue automatically maps object properties to form controls by name
        this.form.patchValue(person);
      });
    }
  }

  save() {
    if (this.form.invalid) return;

    // Retrieve all values from the form (ignoring disabled states if any)
    const formData = this.form.getRawValue();

    if (this.isEditMode() && this.currentId) {
      // UPDATE logic
      // We need to reconstruct the Person object with the ID, as the form does not contain it.
      const personToUpdate: Person = { ...formData, id: this.currentId };
      
      this.service.update(personToUpdate).subscribe(() => {
        this.personNavigator.toPersonList();
      });

    } else {
      // CREATE logic
      // The service expects Omit<Person, 'id'>, which matches our formData exactly.
      this.service.create(formData).subscribe(() => {
        this.personNavigator.toPersonList();
      });
    }
  }
}