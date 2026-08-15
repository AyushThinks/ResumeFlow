import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getUserExportKey(): string {
    try {
      const userRaw = localStorage.getItem('userName');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user && user.id) {
          return `rf_exports_user_${user.id}`;
        }
        if (user && user.email) {
          return `rf_exports_user_${user.email}`;
        }
      }
    } catch (e) {}
    return 'rf_exports_guest';
  }

  getApplications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/applications`);
  }

  createApplication(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/applications`, payload);
  }

  updateApplication(id: number | string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/applications/${id}`, payload);
  }

  deleteApplication(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/applications/${id}`);
  }

  getShares(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shares`);
  }

  deleteShare(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/shares/${id}`);
  }

  getTemplates(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates`);
  }

  createTemplate(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/templates`, payload);
  }

  getExports(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/export`);
  }

  recordExport(documentId: number | string, documentTitle: string, type: string = 'resume', format: string = 'PDF (Vector Print)'): void {
    const newExport = {
      id: Date.now(),
      documentId,
      documentTitle: documentTitle || 'My Resume',
      type: type || 'resume',
      format: format || 'PDF',
      createdAt: new Date().toISOString()
    };

    // 1. Send to backend if available (interceptor attaches auth)
    this.http.post<any>(`${this.apiUrl}/export`, newExport).subscribe({
      next: () => {},
      error: () => {}
    });

    // 2. Persist locally in user-scoped storage
    try {
      const key = this.getUserExportKey();
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(newExport);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      // Clean up legacy global key if it exists
      localStorage.removeItem('rf_exports');
    } catch (e) {
      console.error('Failed to store export locally:', e);
    }
  }

  getLocalExports(): any[] {
    try {
      const key = this.getUserExportKey();
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  }
}