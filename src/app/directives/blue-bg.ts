import { Directive, ElementRef, inject, Renderer2, signal } from '@angular/core';

/**
 * Just a showcase directive, serving as a template
 */
@Directive({
  // changing something 'globally' is frowned upon, so careful there! 
  // Better define a selector that one can choose or omit.
  selector: 'input', // better: selector: '[appBlueBg]',

  // events the current thing (host) will react to, for HTML elements
  // see https://developer.mozilla.org/en-US/docs/Web/API/Element#events
  host: {
    '(focus)': 'highlight()',
    '(blur)': 'undo()',

    // also properties can be bound, also to signals which need the function call syntax
    '[title]': 'toolTip()'
  }
})
export class BlueBg {

  // inject(ElementRef) would do, but with the following, we have everything handy that an input element has
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  private renderer = inject(Renderer2);

  private readonly intialTooltip = 'Focus on me to get my attention';
  toolTip = signal(this.intialTooltip);

  constructor() { }

  highlight() {
    // this.el.nativeElement.pattern is only available because we insisted on type HTMLInputElement when injecting.
    // will be empty on the console output.
    console.log(`Input element pattern: ${this.el.nativeElement.pattern}`);
    this.toolTip.set('Now you have my attention');
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#cef');
  }

  undo() {
    this.toolTip.set(this.intialTooltip);
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
  }
}
