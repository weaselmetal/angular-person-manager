import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from './person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/persons';

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
}