import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    onSubmit() {
        if (this.registerForm.valid) {
            const { email, username, password } = this.registerForm.value;

            if (this.userService.emailExists(email)) {
                this.errorMessage = 'This email is already in use.';
                return;
            }

            this.userService.addUser({
                id: Date.now().toString(),
                username,
                email,
                password,
                role: 'student'
            });

            console.log('Registration successful');
            this.router.navigate(['/login']);
        }
    }
}
