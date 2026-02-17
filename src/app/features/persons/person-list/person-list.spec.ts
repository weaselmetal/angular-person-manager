import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonList } from './person-list';
import { provideRouter } from '@angular/router';

describe('PersonList', () => {
  let component: PersonList;
  let fixture: ComponentFixture<PersonList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonList],
      providers: [
        provideRouter([]) 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
