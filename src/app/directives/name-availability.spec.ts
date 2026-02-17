import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PersonService } from '../features/persons/person.service';
import { NameAvailability } from './name-availability';
import { NotificationService } from '../core/notification-service';

// TestHost: A dummy component to host the directive and a form control within a real DOM context
@Component({
  template: `<input type="text" [formControl]="control" appNameAvailability>`,
  standalone: true,
  imports: [ReactiveFormsModule, NameAvailability]
})
class TestHostComponent {
  control = new FormControl('');
}

describe('NameAvailability Directive (Integration Test)', () => {

  // the ComponentFixture holds a referece to the control / component / thing we want to test
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  const notificationServiceMock = {
    showWarning: () => {} // do nothing
  };

  // personService mock: 
  const personServiceMock = {
    isNameAvailable: (name: string) => {
      const isAvailable = name !== 'Voldemort';
      return of(isAvailable).pipe(delay(10));
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, NameAvailability],
      providers: [
        // Provide our mocks (i.e. the one function each)
        { provide: PersonService, useValue: personServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    // enable vi to time-travel
    vi.useFakeTimers();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    // trigger the first rendering (via ngOnInit)
    fixture.detectChanges();
  });

  afterEach(() => {
    // go back to real JS timing after every test
    vi.useRealTimers();
  });

  it('should return { nameTaken: true } if name is "Voldemort"', async () => {
    // change the name input and even before ...
    // get rid of pristine state; changing the value by code leaves the status to pristine!
    component.control.markAsDirty();
    component.control.setValue('Voldemort');

    // right after changing the input, its status should become PENDING
    expect(component.control.status).toBe('PENDING');

    // go forward in time by 400ms, to skip debouncing delay and mock delay
    vi.advanceTimersByTime(400);

    // if the used mocks put any microtasks in the queue (e.g. returning a promise),
    // moving forward in time would not resolve these microtasks automatically.
    // To await the stable state (no more microtasks) is a good practice.
    await fixture.whenStable();

    fixture.detectChanges();

    // we expect an error
    expect(component.control.errors).toEqual({ nameTaken: true });
    expect(component.control.status).toBe('INVALID');
  });

  it('should be valid if name is "Harry"', async () => {
    vi.useFakeTimers();

    component.control.markAsDirty();
    component.control.setValue('Harry');

    expect(component.control.status).toBe('PENDING');

    vi.advanceTimersByTime(400);
    await fixture.whenStable();

    fixture.detectChanges();

    expect(component.control.errors).toBeNull();
    expect(component.control.status).toBe('VALID');
  });
});

