import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonFormTd } from './person-form-td';

describe('PersonFormTd', () => {
  let component: PersonFormTd;
  let fixture: ComponentFixture<PersonFormTd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonFormTd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonFormTd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
