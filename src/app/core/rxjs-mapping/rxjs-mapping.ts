import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concatMap, delay, exhaustMap, interval, map, mergeMap, of, share, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-rxjs-mapping',
  imports: [JsonPipe],
  template: `
    <h1>Illustrate RxJS function behaviour</h1>
    <p>
      We emit values coming from an array {{ this.dataSource | json }} at a delay of 500ms.
      These values are sent to some caluculation that is slow in the beginning but gets
      faster over time.
      We have different subscribers and pipes that use concatMap, exhaustMap, mergeMap and 
      switchMap respectively.
    </p>
    <p>
      @for(line of output(); track $index) {
        {{line}} <br>
      }
    </p>
  `,
  styles: ``,
})
export class RxjsMapping {

  dataSource = [1,2,3,4,5];
  output = signal<string[]>([]);

  constructor() {
    
    // every 500ms we emit a value through interval, starting at 0, going up 1 each time
    const input$ = interval(500).pipe(
      // we kill the emitting source upon destroy by design, not all subscribers individually
      takeUntilDestroyed(),

      // we want 1 to 5, rather than 0 to 4 we'd get from interval
      map(i => this.dataSource[i]),

      // we stop after 5 emits
      take(this.dataSource.length),

      // we want a 'hot' (multicast) Observable here (rather than a 'cold' observable, 
      // where every subscriber receives a distinct Observable instance).
      // use shareReplay(x) to keep a bit of history (last x values) for later subscribers.
      // use share() to just listen to upcoming emits
      share()
    );

    input$.subscribe(data => this.addOutput(`>> emitting ${data}`));

    input$.pipe(
      mergeMap(val => this.slowCalc(val))
    )
    .subscribe((data) => this.addOutput(`mergeMap ${data}`));

    input$.pipe(
      switchMap(val => this.slowCalc(val))
    )
    .subscribe((data) => this.addOutput(`switchMap ${data}`));

    input$.pipe(
      exhaustMap(val => this.slowCalc(val))
    )
    .subscribe((data) => this.addOutput(`exhaustMap ${data}`));

    input$.pipe(
      concatMap(val => this.slowCalc(val))
    )
    .subscribe((data) => this.addOutput(`concatMap ${data}`));
  }

  addOutput(line: string) {
    this.output.update(current => [...current, line]);
  }

  private slowCalc(val: number) {
    // 'calculation' gets faster over time
    return of(val).pipe(delay(1500 / val));
  };

}
