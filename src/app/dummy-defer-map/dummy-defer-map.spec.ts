import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyDeferMap } from './dummy-defer-map';

describe('DummyDeferMap', () => {
  let component: DummyDeferMap;
  let fixture: ComponentFixture<DummyDeferMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DummyDeferMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyDeferMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
