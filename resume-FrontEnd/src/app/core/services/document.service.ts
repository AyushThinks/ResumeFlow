import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentSectionItem {
  id?: number;
  content: string;
  position?: number;
  [key: string]: any;
}

export interface DocumentSection {
  id?: number;
  heading: string;
  isSidebar?: boolean;
  position?: number;
  items: (string | DocumentSectionItem)[];
  [key: string]: any;
}

export interface ResumeDocument {
  id: number;
  title: string;
  type: string;
  template?: string;
  templateId?: number | null;
  templateConfig?: any;
  sections?: DocumentSection[];
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface DocumentsResponse {
  success?: boolean;
  documents: ResumeDocument[];
}

export interface SingleDocumentResponse {
  success?: boolean;
  message?: string;
  document: ResumeDocument;
}

export interface DocumentPayload {
  title: string;
  type?: string;
  template?: string;
  templateId?: number;
  sections?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<DocumentsResponse> {
    return this.http.get<DocumentsResponse>(`${this.apiUrl}/documents`);
  }

  getDocument(id: number | string): Observable<SingleDocumentResponse> {
    return this.http.get<SingleDocumentResponse>(`${this.apiUrl}/documents/${id}`);
  }

  createDocument(payload: DocumentPayload): Observable<SingleDocumentResponse> {
    return this.http.post<SingleDocumentResponse>(`${this.apiUrl}/documents`, payload);
  }

  updateDocument(id: number | string, payload: Partial<DocumentPayload>): Observable<SingleDocumentResponse> {
    return this.http.put<SingleDocumentResponse>(`${this.apiUrl}/documents/${id}`, payload);
  }

  deleteDocument(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${id}`);
  }

  duplicateDocument(id: number | string): Observable<SingleDocumentResponse> {
    return this.http.post<SingleDocumentResponse>(`${this.apiUrl}/documents/${id}/duplicate`, {});
  }

  getVersions(documentId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/versions`);
  }

  createVersion(documentId: number | string, name?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/documents/${documentId}/versions`, { name });
  }

  restoreVersion(documentId: number | string, versionId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/documents/${documentId}/versions/${versionId}/restore`, {});
  }

  createShare(documentId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/documents/${documentId}/share`, {});
  }

  getPublicShare(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shares/${slug}`);
  }
}