import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppDataService } from '../../core/services/app-data.service';
import { DocumentService, ResumeDocument } from '../../core/services/document.service';

interface ApplicationItem {
  [key: string]: any;
  id: number;
  company?: string;
  role?: string;
  title?: string;
  status: string;
  location?: string;
  salary?: string;
  notes?: string;
  documentId?: number;
  updatedAt?: string;
}

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnInit {
  applications: ApplicationItem[] = [];
  documents: ResumeDocument[] = [];
  loading = true;
  error = '';
  success = '';

  isModalOpen = false;
  isSaving = false;
  editingApp: ApplicationItem | null = null;
  activeMenuId: number | null = null;

  appForm = new FormGroup({
    company: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    role: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    status: new FormControl('saved', Validators.required),
    location: new FormControl(''),
    documentId: new FormControl(null),
    notes: new FormControl('')
  });

  columns = [
    { key: 'saved', label: 'Saved', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', badgeBg: '#f1f5f9', badgeText: '#475569', icon: 'bookmark_border' },
    { key: 'applied', label: 'Applied', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', badgeBg: '#dbeafe', badgeText: '#1d4ed8', icon: 'send' },
    { key: 'interview', label: 'Interview', color: '#d97706', bg: '#fffbeb', border: '#fde68a', badgeBg: '#fef3c7', badgeText: '#b45309', icon: 'event' },
    { key: 'offer', label: 'Offer', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', badgeBg: '#d1fae5', badgeText: '#047857', icon: 'verified' },
    { key: 'rejected', label: 'Rejected', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', badgeBg: '#ffe4e6', badgeText: '#be123c', icon: 'cancel' },
  ];

  constructor(
    private service: AppDataService,
    private docService: DocumentService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadDocuments();
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';
    this.service.getApplications().subscribe({
      next: (r) => {
        this.applications = r.applications || [];
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.error = 'Unable to load applications.';
        this.loading = false;
      },
    });
  }

  loadDocuments(): void {
    this.docService.getDocuments().subscribe({
      next: (r) => {
        this.documents = r.documents || [];
      },
      error: (e) => console.error('Failed to load documents for application dropdown:', e)
    });
  }

  getByStatus(status: string): ApplicationItem[] {
    return this.applications.filter((a) => a.status === status);
  }

  displayTitle(a: ApplicationItem): string {
    return a.company || a.title || 'Application';
  }

  displayRole(a: ApplicationItem): string {
    return a.role || a['position'] || a['jobTitle'] || 'Role not specified';
  }

  openCreateModal(): void {
    this.editingApp = null;
    this.appForm.reset({
      company: '',
      role: '',
      status: 'saved',
      location: '',
      documentId: null,
      notes: ''
    });
    this.error = '';
    this.success = '';
    this.isModalOpen = true;
  }

  openEditModal(app: ApplicationItem): void {
    this.editingApp = app;
    this.appForm.reset({
      company: app.company || app.title || '',
      role: app.role || '',
      status: app.status || 'saved',
      location: app.location || '',
      documentId: app.documentId || null,
      notes: app.notes || ''
    });
    this.activeMenuId = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSaving) return;
    this.isModalOpen = false;
    this.editingApp = null;
  }

  saveApplication(): void {
    if (this.appForm.invalid) {
      this.appForm.markAllAsTouched();
      return;
    }

    const val = this.appForm.value;
    const payload = {
      company: val.company,
      role: val.role,
      status: val.status,
      location: val.location || undefined,
      documentId: val.documentId ? Number(val.documentId) : undefined,
      notes: val.notes || undefined
    };

    this.isSaving = true;
    this.error = '';

    if (this.editingApp) {
      this.service.updateApplication(this.editingApp.id, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.success = 'Application updated.';
          this.loadApplications();
        },
        error: (err) => {
          this.isSaving = false;
          this.error = err?.error?.message || 'Failed to update application.';
        }
      });
    } else {
      this.service.createApplication(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.success = 'Application tracked successfully.';
          this.loadApplications();
        },
        error: (err) => {
          this.isSaving = false;
          this.error = err?.error?.message || 'Failed to track application.';
        }
      });
    }
  }

  updateStatus(app: ApplicationItem, newStatus: string): void {
    this.activeMenuId = null;
    this.service.updateApplication(app.id, { status: newStatus }).subscribe({
      next: () => {
        app.status = newStatus;
      },
      error: (err) => {
        this.error = 'Failed to move application status.';
      }
    });
  }

  deleteApplication(app: ApplicationItem): void {
    this.activeMenuId = null;
    if (!window.confirm(`Delete application for ${this.displayTitle(app)}?`)) return;

    this.service.deleteApplication(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== app.id);
        this.success = 'Application deleted.';
      },
      error: (err) => {
        this.error = 'Failed to delete application.';
      }
    });
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }
}

