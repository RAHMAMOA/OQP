import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './features/students/navbar/navbar';
import { NavbarComponent } from './features/admin/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OQP';
  currentUser$: Observable<any>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}
