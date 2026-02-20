import { Routes } from '@angular/router';
import { LandingPageComponent } from './shared/components/landing-page/landing-page';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent as AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';
import { DashboardComponent as StudentDashboardComponent } from './features/students/dashboard/dashboard.component';
import { History } from './features/students/navbar/history/history';
import { Profile } from './features/students/navbar/profile/profile';
import { ManageQuizzesComponent } from './features/admin/navbar/manage-quizzes/manage-quizzes.component';
import { Students as AdminStudentsComponent } from './features/admin/students/students';
import { SettingsComponent as AdminSettingsComponent } from './features/admin/navbar/settings/settings.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { studentGuard } from './core/guards/student.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
            { path: '', component: AdminDashboardComponent },
            { path: 'quizzes', component: ManageQuizzesComponent },
            { path: 'quizzes/create', loadComponent: () => import('./features/admin/navbar/manage-quizzes/create-quiz/create-quiz.component').then(m => m.CreateQuizComponent) },
            { path: 'quizzes/edit/:id', loadComponent: () => import('./features/admin/navbar/manage-quizzes/edit-quiz/edit-quiz.component').then(m => m.EditQuizComponent) },
            { path: 'students', component: AdminStudentsComponent },
            { path: 'settings', component: AdminSettingsComponent }
        ]
    },
    {
        path: 'dashboard',
        component: StudentDashboardComponent,
        canActivate: [authGuard, studentGuard]
    },
    {
        path: 'quiz/:id',
        loadComponent: () => import('./features/students/quiz-attempt/quiz-attempt.component').then(m => m.QuizAttemptComponent),
        canActivate: [authGuard, studentGuard]
    },
    {
        path: 'quiz-result/:id',
        loadComponent: () => import('./features/students/quiz-result/quiz-result.component').then(m => m.QuizResultComponent),
        canActivate: [authGuard, studentGuard]
    },
    {
        path: 'history',
        component: History,
        canActivate: [authGuard, studentGuard]
    },
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard, studentGuard]
    },
    { path: '**', redirectTo: '' }
];
