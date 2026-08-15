import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { HomeComponent } from './pages/landing/landing.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DocumentsComponent } from './pages/document/document.component';
import { TemplatesPageComponent } from './pages/templates/templates.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { SharesComponent } from './pages/shares/shares.component';
import { ExportsComponent } from './pages/exports/exports.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { EditorComponent } from './pages/editor/editor.component';
import { PublicViewComponent } from './pages/public-view/public-view.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignUpComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'documents', 
    component: DocumentsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'documents/:id', 
    component: EditorComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'editor/:id', 
    component: EditorComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'templates', 
    component: TemplatesPageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'applications', 
    component: ApplicationsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'shares', 
    component: SharesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'exports', 
    component: ExportsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'change-password', 
    component: ChangePasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'r/:slug',
    component: PublicViewComponent
  },
  {
    path: 'share/:slug',
    component: PublicViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
