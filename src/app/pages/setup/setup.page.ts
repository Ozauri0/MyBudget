import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SetupPage implements OnInit {
  userName: string = '';
  userLastName: string = '';
  baseSalary: number = 0;

  constructor(
    private userService: UserService,
    private router: Router,
    private events: EventsService
  ) {}

  ngOnInit() {
    this.checkExistingUser();
  }

  async checkExistingUser() {
    const user = await this.userService.getUser();
    if (user) {
      this.router.navigate(['/tabs/home']);
    }
  }

  async onSubmit() {
    if (this.userName) {
      try {
        await this.userService.createUser({
          name: this.userName + ' ' + this.userLastName,
          baseSalary: this.baseSalary
        });
        this.events.emitUserCreated();
        this.router.navigate(['/tabs/home']);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  }
}