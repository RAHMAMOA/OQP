import { User } from './user';
import { Stats } from './stats';

export interface StudentData extends User {
  quizzesTaken: number;
  avgScore: number;
  passRate: number;
  joined: string;
}
