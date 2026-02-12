import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Person } from '../person';
import { PersonNavigator } from '../person-navigator';
import { PersonService } from '../person.service';

// --- MATERIAL IMPORTS ---
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { universeAgeValidator } from '../../../validators/universe-age';

@Component({
  selector: 'app-person-form',
  standalone: true,
  
  // import required Material Modules for the template
  imports: [
    ReactiveFormsModule, 
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>
          {{ isEditMode() ? 'Person bearbeiten' : 'Neue Person erstellen' }}
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="save()" class="person-form">
          
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Max Mustermann">
            
            <mat-icon matSuffix>person</mat-icon>

            <mat-error>Name ist erforderlich</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Alter</mat-label>
            <input matInput type="number" formControlName="age" placeholder="30">
            
            <mat-error>
              @if (form.controls.age.hasError('required')) {
                Age is required
              } @else if (form.controls.age.hasError('min')) {
                You can't be younger than 0 years, Benjamin B.
              } @else if (form.controls.age.hasError('max')) {
                You are likely not that old.
              }
            </mat-error>
          </mat-form-field>

          @if (form.hasError('universeAgeMismatch') && (form.touched || form.dirty)) {
            <div style="color: var(--mat-sys-error); margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
               <mat-icon>error</mat-icon>
               <span>The universe is 42.</span>
            </div>
          }

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              Speichern
            </button>
            
            <a mat-stroked-button routerLink="/persons" queryParamsHandling="preserve">
              Abbrechen
            </a>
          </div>

        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .form-card {
      max-width: 400px;
      margin: 2rem auto; /* Zentriert die Karte */
      padding: 1rem;
    }

    .person-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end; /* Buttons rechtsbündig */
      gap: 10px;
      margin-top: 1rem;
    }
  `
})
export class PersonForm {
  private fb = inject(FormBuilder);
  private service = inject(PersonService);
  private route = inject(ActivatedRoute);
  private personNavigator = inject(PersonNavigator);
  private destroyRef = inject(DestroyRef);

  // Signal to track if we are editing an existing person or creating a new one
  isEditMode = signal(false);
  currentId: string | null = null;

  // Form Model definition
  // nonNullable ensures that values are always of their type (e.g., string) and never undefined.
  // set initial values (when a new Person is created), and define validity criteria
  form = this.fb.nonNullable.group({
    // one entry can look like this
    // key: [ initial-value, synchronous-validators, (optional) async-validators ]
    name: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(0), Validators.max(120)]]
  }, 
  { validators: universeAgeValidator });

  constructor() {
    // Check if an ID is present in the URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Switch to Edit Mode
      this.isEditMode.set(true);
      this.currentId = id;

      // Load data and populate the form
      this.service.getPerson(id)
        // we wouldn't have to pass a destroyRef here, but we need it anyway for other places
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(person => {
          // patchValue automatically maps object properties to form controls by name
          this.form.patchValue(person);
        });
    }
  }

  save() {
    if (this.form.invalid) {
      // we don't want to bother a user with errors right when loading the form.
      // trying to store invalid data must cause a visible error,
      // even when the form is untouched. So we 'touch' all form elements via code.
      this.form.markAllAsTouched();
      return;
    }

    // Retrieve all values from the form (ignoring disabled states if any)
    const formData = this.form.getRawValue();

    if (this.isEditMode() && this.currentId) {
      // UPDATE logic
      // We need to reconstruct the Person object with the ID, as the form does not contain it.
      const personToUpdate: Person = { ...formData, id: this.currentId };
      
      this.service.update(personToUpdate)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => { this.personNavigator.toPersonList(); });

    } else {
      // CREATE logic
      // The service expects Omit<Person, 'id'>, which matches our formData exactly.
      this.service.create(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => { this.personNavigator.toPersonList(); });
    }
  }
}
