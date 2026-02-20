import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Observable, filter, map, startWith, Subject, takeUntil } from 'rxjs';
import { User } from '../../../core/models/user';

@Component({
    selector: 'app-admin-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
    currentUser$: Observable<User | null>;
    showNavbar$: Observable<boolean>;
    brandName = '';
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private settingsService: SettingsService
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

    ngOnInit(): void {
        this.settingsService.getSettings$()
            .pipe(takeUntil(this.destroy$))
            .subscribe(settings => {
                this.brandName = settings.siteName;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
