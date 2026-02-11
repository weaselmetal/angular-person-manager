import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PersonService } from '../person.service';
import { Person } from '../person';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UniverseAge } from "../../../directives/universe-age";
import { BlueBg } from '../../../directives/blue-bg';

@Component({
  selector: 'app-person-form-td',
  standalone: true,
  
  // all it needs to get the directive going is to import it
  imports: [FormsModule, JsonPipe, UniverseAge, BlueBg],
  template: `
    <h2>Edit Person (Template-Driven)</h2>

    <pre>{{ person | json }}</pre>

    @if (personLoaded()) {
      <form #personForm="ngForm" (ngSubmit)="onSubmit(personForm)" appUniverseAge>

        @if (personForm.hasError('universeAgeMismatch') && (personForm.touched || personForm.dirty)) {
          <div style="border: 1px solid red; background-color: #ffe6e6; padding: 10px; margin-bottom: 15px; color: red;">
            Being the universe, you must be 42.
          </div>
        }
        
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            [(ngModel)]="person().name" 
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
            [(ngModel)]="person().age" 
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
        <button (click)="onCancel()" type="button">Cancel</button>

      </form>
    } @else {
      <p>Loading / saving person data...</p>
    }
  `,
  styles: `
    div { margin-bottom: 15px; }
    input.ng-invalid.ng-touched { border-color: red; }
    label { display: block; font-weight: bold; margin-bottom: 5px; }
  `
})
export class PersonFormTd {
  private service = inject(PersonService);

  // Mutable object for Template-Driven Form
  // Initialized with empty values for "Create" mode
  // since the person depends on the currentId (through effect()), person
  // should now be a signal too!
  person = signal<Person>({ id: '', name: '' });

  // --- INPUTS & OUTPUTS (Modern Signal Style) ---

  // Receives ID from Router (via component-input-binding) OR from Parent Component (Modal)
  id = input<string>(); 

  // Emits when work is done (save or cancel) so the parent can decide what to do
  finish = output<void>();

  destroyRef = inject(DestroyRef);

  // --- STATE ---
  
  // Default is false, because in "Create Mode" we don't need to load anything.
  // We only switch to true if an ID is present.
  personLoaded = signal(false);

  constructor() {
    // We use an effect to react to signal-ID changes.
    // Effects must be registered in the constructor (injection context).
    effect(() => {

      // here we start observing id() changes
      const currentId = this.id();
      
      if (currentId) {
        // EDIT MODE: ID found, start loading
        this.personLoaded.set(false);
        
        this.service.getPerson(currentId)
          // takeUntilDestroyed protects against component destruction (e.g. navigating away),
          // BUT it does NOT cancel the previous request when id() changes quickly.
          // For that, we would need 'onCleanup' or a switchMap-Stream approach.
          // we are not directly in the constructor context here, so we need to pass a destroyRef
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (p) => {
              this.person.set(p);
              this.personLoaded.set(true);
            },
            error: (err) => {
              console.error('Failed to load person', err);
              this.personLoaded.set(true);
            }
        });
      } else {
        // CREATE MODE: No ID, reset form to empty
        this.person.set({ id: '', name: '' });
        this.personLoaded.set(true);
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.personLoaded.set(false);
      
      const p = this.person();
      
      // Decide whether to create or update based on ID existence
      const obs$ = p.id ? this.service.update(p) : this.service.create(p);

      obs$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.personLoaded.set(true);
            // Notify parent (Router or Modal) that we are done
            this.finish.emit(); 
          },
          error: (err) => {
            console.error('Save failed', err);
            this.personLoaded.set(true);
          }
        });
    }
  }

  onCancel() {
    this.finish.emit();
  }
}