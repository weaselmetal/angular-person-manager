import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BlueBg } from './blue-bg';

// we need an input element test host component, which we create here
@Component({
  template: `<input type="text" pattern="[a-z]*">`,
  standalone: true,
  imports: [BlueBg]
})
class TestHostComponent {}

describe('BlueBg Directive', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, BlueBg]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);

    // trigger initial rendering
    fixture.detectChanges();

    // get hold of the input element for the tests
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('should create an instance', () => {
    // check presence of the directive on the input element
    const directiveInstance = inputEl.injector.get(BlueBg);
    expect(directiveInstance).toBeTruthy();
  });

  it('should set initial tooltip', () => {
    // check signal binding: [title]
    const nativeInput = inputEl.nativeElement as HTMLInputElement;
    expect(nativeInput.title).toBe('Focus on me to get my attention');
  });

  it('should change background and tooltip on focus', () => {
    const nativeInput = inputEl.nativeElement as HTMLInputElement;

    // trigger focus event
    inputEl.triggerEventHandler('focus', null);
    fixture.detectChanges(); // run Angular change detection

    // check if bg color and tooltip changed on focus
    // #cef == rgb(204, 238, 255), which is the rgb() value expected here
    expect(nativeInput.style.backgroundColor).toBe('rgb(204, 238, 255)');
    expect(nativeInput.title).toBe('Now you have my attention');
  });

  it('should remove background and reset tooltip on blur', () => {
    const nativeInput = inputEl.nativeElement as HTMLInputElement;

    // put input into focussed state
    inputEl.triggerEventHandler('focus', null);
    fixture.detectChanges();

    // trigger blur event
    inputEl.triggerEventHandler('blur', null);
    fixture.detectChanges();

    // check restored empty bg color and tooltip
    expect(nativeInput.style.backgroundColor).toBe('');
    expect(nativeInput.title).toBe('Focus on me to get my attention');
  });
});
