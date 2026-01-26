import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PersonNavigator {
  private router = inject(Router);

  toPersonList() {
    this.router.navigate(['/persons'], { queryParamsHandling: 'preserve' });
  }

  toPersonEdit(id: string) {
    this.router.navigate(['/persons', id, 'edit-td'], { queryParamsHandling: 'preserve' });
  }
}