import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { Teams } from './components/teams/teams';
import { Projects } from './components/projects/projects';
import { Tasks } from './components/tasks/tasks';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'teams', component: Teams },
  { path: 'teams/:teamId/projects', component: Projects },
  { path: 'teams/:teamId/projects/:projectId/tasks', component: Tasks },
  { path: 'projects', component: Projects },
  { path: 'tasks', component: Tasks }
];