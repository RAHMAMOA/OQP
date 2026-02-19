export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    password?: string;
    role: 'admin' | 'student';
}
