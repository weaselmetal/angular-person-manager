import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../auth-service";

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="main-header">
      <nav>
        <a routerLink="/" routerLinkActive="activeHref" [routerLinkActiveOptions]="{exact: true}">Home</a>

        @if (authService.isLoggedIn()) {
          <a routerLink="/persons" routerLinkActive="activeHref">Persons</a>
          
          <button (click)="authService.logout()">Logout</button>
        }

        @if (!authService.isLoggedIn()) {
          <a routerLink="/login" routerLinkActive="activeHref">Login</a>
        }
      </nav>
    </header>
  `,
  styles: [`
    .main-header { padding: 1rem; background: #eee; }
    nav { display: flex; gap: 1rem; }
    a { color: #333; }
    a.activeHref { font-weight: bold; }
  `]
})
export class Navigation {
  // needs to be injected so we can use it in the template
  authService = inject(AuthService);
}