import { TestBed } from '@angular/core/testing';
import { NameAvailability } from './name-availability'; // Pfad checken!
import { PersonService } from '../features/persons/person.service';
import { of } from 'rxjs';

describe('NameAvailability Directive', () => {

  it('should create an instance', () => {
    // our service should not complain about a validation error
    const mockService = {
      checkNameAvailability: () => of(null) // return some Observable that holds null
    };

    // test setup
    TestBed.configureTestingModule({
      providers: [
        // provide our mockService as the PersonService
        { provide: PersonService, useValue: mockService }
      ]
    });

    // construct the directive within the injection context, such that inject() can work
    const directive = TestBed.runInInjectionContext(() => new NameAvailability());

    expect(directive).toBeTruthy();
  });
});
