import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RxjsMapping } from './rxjs-mapping';

describe('RxjsMapping', () => {
  let component: RxjsMapping;
  let fixture: ComponentFixture<RxjsMapping>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RxjsMapping]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RxjsMapping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
