import { Component } from '@angular/core';

@Component({
  selector: 'app-dummy-defer-map',
  standalone: true,
  template: `
    <div class="map-container">
      <h3>Some famous region</h3>
      <iframe 
        width="100%" 
        height="500" 
        frameborder="0" 
        scrolling="no" 
        marginheight="0" 
        marginwidth="0" 
        src="https://maps.google.com/maps?q=Silicon+Valley&t=&z=13&ie=UTF8&iwloc=&output=embed">
      </iframe>
    </div>
  `,
  styles: `
    .map-container {
      margin-top: 2rem;
      border: 5px solid #a1a1a1;
      padding: 10px;
    }
  `
})
export class DummyDeferMap {
  constructor() {
    console.log('Map component now in viewport');
  }
}