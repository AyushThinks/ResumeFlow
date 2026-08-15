import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { FeaturesComponent } from './components/features/features.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { TemplatesComponent } from './components/templates/templates.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { FaqComponent } from './components/faq/faq.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { HomeComponent } from './pages/landing/landing.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DocumentsComponent } from './pages/document/document.component';
import { AppNavbarComponent } from './components/app-navbar/app-navbar.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { SharesComponent } from './pages/shares/shares.component';
import { ExportsComponent } from './pages/exports/exports.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { TemplatesPageComponent } from './pages/templates/templates.component';
import { EditorComponent } from './pages/editor/editor.component';
import { PublicViewComponent } from './pages/public-view/public-view.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    FeaturesComponent,
    HowItWorksComponent,
    TemplatesComponent,
    TestimonialsComponent,
    FaqComponent,
    CtaComponent,
    FooterComponent,
    LoginComponent,
    SignUpComponent,
    HomeComponent,
    DashboardComponent,
    DocumentsComponent,
    AppNavbarComponent,
    ApplicationsComponent,
    SharesComponent,
    ExportsComponent,
    ProfileComponent,
    ChangePasswordComponent,
    TemplatesPageComponent,
    EditorComponent,
    PublicViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

