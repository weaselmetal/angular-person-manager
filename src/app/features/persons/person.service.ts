import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { mergeMap, Observable, of, throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment'; // it's crucial to NOT have a specific configuration mentioned here!
import { Person } from './person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPersons(page: number, limit: number): Observable<Person[]> {
    // HttpParams allows custom URL encoding and complex conditional chaining.
    const params = new HttpParams()
      .set("_page", page)
      .set("_limit", limit);

    // if none of the possibilities is needed, this is fine too
    // const params = { _page: page, _limit: limit };
    return this.http.get<Person[]>(this.apiUrl, { params });
  }

  getPerson(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`);
  }

  create(person: Omit<Person, 'id'>): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, person);
  }

  update(person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/${person.id}`, person);
  }

  // delete cannot return just void
  delete(id: string): Observable<Person> {
    return this.http.delete<Person>(`${this.apiUrl}/${id}`);
  }

  isNameAvailable(name: string): Observable<boolean> {
    
    console.log(`personService.isNameAvailable ${name}`);

    // we simulate a backend call that has some delay,
    return timer(1500).pipe(
    
      // in this particular case, the timer emits just once, hence
      // it doesn't matter much if we chose mergeMap or switchMap or another mapping function.
      // mergeMap doesn't signal there are multiple observables.
      mergeMap(() => {
        const lowerName = name.toLowerCase();

        console.log(`delayed response simulation ${name}`);

        // error case
        if (lowerName.includes('error')) {
          return throwError(() => new Error('The server responded with an error'));
        }

        // there can be only one voldemort
        const isTaken = lowerName.includes('voldemort');

        // return result as the expected Observable<boolean>
        return of(!isTaken);
      })
    );
  }
}