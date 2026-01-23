import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PersonService } from '../person.service';
import { Person } from '../person';

@Component({
  selector: 'app-person-list',
  imports: [RouterLink],
  template: `
    <h2>Person List</h2>

    <a routerLink="/persons/new" class="btn">Create New Person</a>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (person of persons(); track person.id) {
          <tr>
            <td>{{ person.name }}</td>
            <td>{{ person.age }}</td>
            <td class="actions">
              <a [routerLink]="['/persons', person.id]">Details</a>
              <a [routerLink]="['/persons', person.id, 'edit']">Edit</a>
              <button (click)="deletePerson(person)" class="btn-delete">Delete</button>
            </td>
          </tr>
        } @empty {
          <tr><td colspan="3">No persons found</td></tr>
        }
      </tbody>
    </table>

    <div class="pagination">
      <button (click)="prevPage()" [disabled]="currentPage() === 1">Previous</button>
      <span>Page {{ currentPage() }}</span>
      <button (click)="nextPage()" [disabled]="persons().length < pageSize">Next</button>
    </div>
  `,
  styles: `
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    .pagination { display: flex; gap: 10px; align-items: center; }
    .btn { display: inline-block; padding: 5px 10px; background: #eee; text-decoration: none; border: 1px solid #ccc; color: black; }
    
    /* Styles for the actions column to make it look neat */
    .actions { display: flex; gap: 8px; align-items: center; }
    .actions a { text-decoration: underline; color: blue; cursor: pointer; }
    
    .btn-delete { 
      background-color: #dc3545; 
      color: white; 
      border: none; 
      padding: 5px 10px; 
      cursor: pointer; 
      border-radius: 4px;
    }
    .btn-delete:hover { background-color: #c82333; }
  `
})
export class PersonList {
  private personService = inject(PersonService);

  // State
  persons = signal<Person[]>([]);
  currentPage = signal(1);
  pageSize = 10;

  constructor() {
    this.loadData();
  }

  deletePerson(person: Person) {
    // the reason we pass the Person object, rather than just its id is:
    if (!confirm(`Are you sure you want to delete ${person.name}?`)) {
      return;
    }

    // a subscriber is always needed to send the actual request!
    // subscribe() also accepts an object like:
    // {
    //   next: (responseObj) => ...,
    //   error: (errorObj) => ...,
    //   complete: () => {...}
    // }
    this.personService.delete(person.id).subscribe({
      // success case
      // 'res' is usually empty for DELETE, so we'd often ignore it: () => {}
      next: (res) => {
        console.log('Delete successful', res);
        this.loadData();
      },

      // exception case
      error: (err) => {
        console.error('Error deleting person', err);
      },

      // relevant for continuous streams (e.g. websockets, data transfers) to signal
      // 'no more data'. Has no arguments.
      complete: () => {} 
    });
  }

  loadData() {
    this.personService.getPersons(this.currentPage(), this.pageSize)
      .subscribe(data => this.persons.set(data));
  }

  nextPage() {
    this.currentPage.update(p => p + 1);
    this.loadData();
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadData();
    }
  }
}