import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DocumentService,
  ResumeDocument
} from '../../core/services/document.service';

@Component({
  selector: 'app-documents',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentsComponent implements OnInit {

  documents: ResumeDocument[] = [];
  filteredDocuments: ResumeDocument[] = [];

  searchControl = new FormControl('');
  typeControl = new FormControl('all');

  documentForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.maxLength(120)
    ]),
    type: new FormControl('resume', Validators.required),
    template: new FormControl('Modern', Validators.required)
  });

  isModalOpen = false;
  isMenuOpen: number | null = null;

  editingDocument: ResumeDocument | null = null;

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  readonly documentTypes = [
    {
      value: 'resume',
      label: 'Resume'
    },
    {
      value: 'cv',
      label: 'CV'
    },
    {
      value: 'cover-letter',
      label: 'Cover letter'
    }
  ];

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDocuments();

    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.typeControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  openEditor(documentId: number | string): void {
    this.router.navigate(['/documents', documentId]);
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.documentService.getDocuments().subscribe({
      next: (response) => {
        this.documents = response.documents || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load documents:', error);
        this.errorMessage = 'Unable to load documents. Please check that the API is running.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const selectedType = this.typeControl.value || 'all';

    this.filteredDocuments = this.documents.filter((document) => {
      const matchesSearch =
        !search ||
        (document.title || '').toLowerCase().includes(search) ||
        (document.type || '').toLowerCase().includes(search) ||
        (document.template || '').toLowerCase().includes(search);

      const matchesType = selectedType === 'all' || document.type === selectedType;
      return matchesSearch && matchesType;
    });
  }

  openCreateModal(): void {
    this.editingDocument = null;
    this.documentForm.reset({
      title: '',
      type: 'resume',
      template: 'Modern'
    });
    this.errorMessage = '';
    this.successMessage = '';
    this.isModalOpen = true;
  }

  openEditModal(document: ResumeDocument): void {
    this.editingDocument = document;
    this.documentForm.reset({
      title: document.title || '',
      type: document.type || 'resume',
      template: document.template || 'Modern'
    });
    this.errorMessage = '';
    this.successMessage = '';
    this.isMenuOpen = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSaving) return;
    this.isModalOpen = false;
    this.editingDocument = null;
  }

  saveDocument(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    const value = this.documentForm.value;
    const payload = {
      title: value.title || '',
      type: value.type || 'resume',
      template: value.template || 'Modern'
    };

    this.isSaving = true;
    this.errorMessage = '';

    if (this.editingDocument) {
      this.documentService.updateDocument(this.editingDocument.id, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.editingDocument = null;
          this.successMessage = 'Document updated successfully.';
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Failed to update document:', error);
          this.isSaving = false;
          this.errorMessage = error?.error?.message || 'Unable to update the document.';
        }
      });
    } else {
      this.documentService.createDocument(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.isModalOpen = false;
          const createdId = res?.document?.id;
          if (createdId) {
            this.router.navigate(['/documents', createdId]);
          } else {
            this.loadDocuments();
          }
        },
        error: (error) => {
          console.error('Failed to create document:', error);
          this.isSaving = false;
          this.errorMessage = error?.error?.message || 'Unable to create the document.';
        }
      });
    }
  }

  duplicateDocument(document: ResumeDocument): void {
    this.isMenuOpen = null;
    this.documentService.duplicateDocument(document.id).subscribe({
      next: (res) => {
        this.successMessage = 'Document duplicated.';
        this.loadDocuments();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to duplicate document.';
      }
    });
  }

  deleteDocument(document: ResumeDocument): void {

    this.isMenuOpen = null;

    const confirmed = window.confirm(
      `Delete "${document.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.documentService
      .deleteDocument(document.id)
      .subscribe({

        next: () => {

          this.documents =
            this.documents.filter(
              (item) => item.id !== document.id
            );

          this.applyFilters();

          this.successMessage =
            'Document deleted successfully.';
        },

        error: (error) => {

          console.error(
            'Failed to delete document:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete the document.';
        }
      });
  }

  toggleMenu(
    documentId: number,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.isMenuOpen =
      this.isMenuOpen === documentId
        ? null
        : documentId;
  }

  closeMenus(): void {
    this.isMenuOpen = null;
  }

  getTypeLabel(
    type: string | undefined
  ): string {

    const found =
      this.documentTypes.find(
        (item) => item.value === type
      );

    return found
      ? found.label
      : (type || 'Document');
  }

  trackById(
    index: number,
    document: ResumeDocument
  ): number {

    return document.id;
  }
}