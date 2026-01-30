import { Component, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonService } from '../person.service';
import { Person } from '../person';
import { PersonFormTd } from "../person-form-td/person-form-td";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-person-list',
  imports: [RouterLink, PersonFormTd],
  template: `
    <h2>Person List</h2>

    <a routerLink="/persons/new" queryParamsHandling="preserve" class="btn">Create New Person</a>

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
              <a [routerLink]="['/persons', person.id]" queryParamsHandling="preserve">Details</a> |
              <a [routerLink]="['/persons', person.id, 'edit']" queryParamsHandling="preserve">Edit</a> |
              <a [routerLink]="['/persons', person.id, 'edit-td']" queryParamsHandling="preserve">Edit TD</a> |
              <button (click)="openModal(person.id)">Modal Edit</button>
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
      <button (click)="nextPage()" [disabled]="persons().length < pageSize()">Next</button>

      per page:
      <select #psSel [value]="pageSize()" (change)="changePageSize(psSel.value)" name="pageSize">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="40">40</option>
      </select>
    </div>

    @if (isLoading()) {
      <p>... loading persons ...</p>
    }

    <dialog #editPersonModal>
      <app-person-form-td [id]="clickedPersonId()" (finish)="closeModal()" />
    </dialog>
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
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // State
  persons = signal<Person[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  isLoading= signal(false);
  clickedPersonId = signal<string | undefined>(undefined);

  @ViewChild('editPersonModal') modal!: ElementRef<HTMLDialogElement>; 

  constructor() {
    this.activeRoute.queryParams
      .pipe(

        // the order of actions taken in this pipeline is to be chosen by 
        // the programmer and will be executed as written

        // always makes sense
        takeUntilDestroyed(this.destroyRef),

        // we 'wire-tap' (listen to) the stream.
        // allows us to perform side-effects (like updating signals) 
        // without affecting the data stream itself. Although one could do something like:
        // params['page'] = 3; ONE SHOULD NOT!
        tap(params => {
          console.log('URL params changed, updating signals');
          const page = this.parsePageParam(params['page']);
          this.currentPage.set(page);

          // show loading info
          this.isLoading.set(true);
          
          const sizeFromUrl = Number(params['pagesize']);
          const validSize = (Number.isNaN(sizeFromUrl) || sizeFromUrl < 1) ? 10 : sizeFromUrl;
          this.pageSize.set(validSize);
        }),

        // switchMap unsubscribes from the previous observable (cancelling the pending request in this case,
        // more: https://angular.dev/guide/http/making-requests#http-observables).
        // switchMap also subscribes automatically to the Observable we return!
        switchMap(() => {
          console.log('starting new request (cancelling previous if still running)');
          return this.personService.getPersons(this.currentPage(), this.pageSize());
        })
      )
      // we define the subscription handling only once, when the constructor is called.
      // the handling of the subscription gets active, whenever activeRoute.queryParams change.
      // through switchMap, we deal with the events of the personService.getPersons() observable
      // in the body of the following subscribe:
      .subscribe({
        next: (data) => {
          console.log('new data arrived');
          this.persons.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          // also upon errors the loading is done
          console.error('API call encountered an error!', err);
          this.isLoading.set(false);
        }
      });
  }

  openModal(id: string) {
    this.clickedPersonId.set(id);
    this.modal.nativeElement.showModal();
  }

  closeModal() {
    // data may have changed, so we reload the list's data
    this.modal.nativeElement.close();
    this.loadData();
  }

  /**
   * Parses the passed String and returns a valid integer > 0.
   * @param pageStr the 'page' param as found in the URL
   * @returns 1 if NaN or negative, otherwise the floor of the passed number.
   */
  private parsePageParam(pageStr: any): number {
    let page = 1;
    if (!pageStr)
      return page;
   
    page = Number(pageStr);
    if (Number.isNaN(page) || page < 1)
      return 1;

    // page may be some float
    return Math.floor(page);
  }

  changePageSize(newSize: string) {
    this.goToPage(1, Number(newSize));
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
    this.personService.delete(person.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

        // relevant for continuous streams (e.g. websockets, data (file) transfers) to signal
        // 'no more data'. Has no arguments.
        complete: () => {}
       
      });
  }

  loadData() {
    this.personService.getPersons(this.currentPage(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.persons.set(data));
  }

  private goToPage(page: number, pageSize: number) {
    this.router.navigate([], {
      relativeTo: this.activeRoute, // stay on current 'page' (route)
      queryParams: { page: page, pagesize: pageSize },  // update the parameters
      queryParamsHandling: 'merge' // 'merge' to leave all other params untouched
    });
  }

  nextPage() {
    // by design, we don't update the currentPage signal here, since
    // we subscribed to queryParam changes (in the constructor) and
    // this is where we want the central place to change the currentPage
    this.goToPage(this.currentPage() + 1, this.pageSize());
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1, this.pageSize())
    }
  }
}