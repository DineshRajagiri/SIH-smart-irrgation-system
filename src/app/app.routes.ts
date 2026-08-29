import { Routes } from '@angular/router';
import { Layout } from './layout';
import { Login } from './auth/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
