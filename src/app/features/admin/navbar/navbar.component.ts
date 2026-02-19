import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, filter, map, startWith } from 'rxjs';
import { User } from '../../../core/models/user';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    currentUser$: Observable<User | null>;
    showNavbar$: Observable<boolean>;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.currentUser$ = this.authService.currentUser$;

        // Hide navbar on public pages
        this.showNavbar$ = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null), // Initial check for current route
            map(() => {
                const url = this.router.url;
                return !(url === '/' || url === '/login' || url === '/register');
            })
        );
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
