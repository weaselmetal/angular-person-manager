import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PersonService } from '../person.service';
import { Person } from '../person';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-person-detail',
  imports: [RouterLink],
  template: `
    <h2>Detailansicht</h2>

    @if (person(); as p) {
      <div class="card">
        <p><strong>ID:</strong> {{ p.id }}</p>
        <p><strong>Name:</strong> {{ p.name }}</p>
        <p><strong>Alter:</strong> {{ p.age }}</p>
      </div>
      
      <div class="actions">
        <a routerLink="/persons" class="btn">Zurück</a>
        <a [routerLink]="['/persons', p.id, 'edit']" class="btn btn-edit">Bearbeiten</a>
      </div>
    } @else {
      <p>Person wird geladen...</p>
    }
  `,
  styles: `
    .card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 400px; }
    .actions { margin-top: 20px; display: flex; gap: 10px; }
    .btn { padding: 8px 16px; text-decoration: none; border: 1px solid #ccc; background: #f9f9f9; color: black; }
    .btn-edit { background: #007bff; color: white; border-color: #007bff; }
  `
})
export class PersonDetail {
  private route = inject(ActivatedRoute);
  private service = inject(PersonService);

  // person is undefined in the beginning, such that the rendering can start already
  person = signal<Person | undefined>(undefined);

  constructor() {
    // 1. get ID from URL. We use the current route.snapshot; we'd use params.subscribe(...) otherwise
    const id = this.route.snapshot.paramMap.get('id');

    // 2. load person if we have an ID
    if (id) {
      this.service.getPerson(id)
        // here we have the constructor context available
        .pipe(takeUntilDestroyed())
        .subscribe(data => {
          this.person.set(data);
        });
    }
  }
}