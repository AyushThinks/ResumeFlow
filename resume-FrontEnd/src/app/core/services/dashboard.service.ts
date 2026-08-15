import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/documents`);
  }

  getApplications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/applications`);
  }

  getVersions(documentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/versions/documents/${documentId}`);
  }

  getExports(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/export`);
  }
}