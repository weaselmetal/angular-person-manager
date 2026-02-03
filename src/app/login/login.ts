import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth-service';
import { PersonNavigator } from '../features/persons/person-navigator';

@Component({
  selector: 'app-login',
  template: `
    @if (authService.isLoggedIn()) {
      <p>You are logged in already</p>
    }
    @if (!authService.isLoggedIn()) {
      <h2>Login</h2>
      <form (submit)="login(user.value, pass.value); $event.preventDefault()">
        Username: <input type="text" #user name="username" #userName><br>
        Password: <input type="password" #pass name="password" #passWord><br>
        <input type="submit">
      </form>
      @if (invalidCredentials()) {
        <p>Invalid username and password!</p>
      }
    }
  `,
  styles: ``,
})
export class Login { 

  invalidCredentials = signal(false);
  navigator = inject(PersonNavigator);

  authService = inject(AuthService);

  login(username: string, password: string) {
    if (this.authService.login(username, password)) {
      console.log("Login successful");
      this.invalidCredentials.set(false);
      this.navigator.toPersonList();
    } else {
      console.log("Login failed");
      this.invalidCredentials.set(true);
    }
  }
}
