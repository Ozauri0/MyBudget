import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private database: DatabaseService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const user = await this.database.getUser();
    if (!user) {
      this.router.navigate(['/setup']);
      return false;
    }
    return true;
  }
}