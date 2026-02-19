import { Routes } from '@angular/router';
import { LandingPageComponent } from './shared/components/landing-page/landing-page';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent as AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';
import { DashboardComponent as StudentDashboardComponent } from './features/students/dashboard/dashboard.component';
import { ManageQuizzesComponent } from './features/admin/manage-quizzes/manage-quizzes.component';
import { Students as AdminStudentsComponent } from './features/admin/students/students';
import { Settings as AdminSettingsComponent } from './features/admin/settings/settings';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { studentGuard } from './core/guards/student.guard';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
            { path: '', component: AdminDashboardComponent },
            { path: 'quizzes', component: ManageQuizzesComponent },
            { path: 'quizzes/create', loadComponent: () => import('./features/admin/manage-quizzes/create-quiz/create-quiz.component').then(m => m.CreateQuizComponent) },
            { path: 'students', component: AdminStudentsComponent },
            { path: 'settings', component: AdminSettingsComponent }
        ]
    },
    {
        path: 'dashboard',
        component: StudentDashboardComponent,
        canActivate: [authGuard, studentGuard]
    },
    { path: '**', redirectTo: '' }
];
