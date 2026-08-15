import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService, DocumentSection, ResumeDocument } from '../../core/services/document.service';

@Component({
  selector: 'app-public-view',
  templateUrl: './public-view.component.html',
  styleUrls: ['./public-view.component.scss']
})
export class PublicViewComponent implements OnInit {
  slug = '';
  document: ResumeDocument | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (this.slug) {
      this.loadPublicDocument(this.slug);
    } else {
      this.error = 'Invalid share link.';
      this.loading = false;
    }
  }

  loadPublicDocument(slug: string): void {
    this.loading = true;
    this.error = '';

    this.documentService.getPublicShare(slug).subscribe({
      next: (res) => {
        this.document = res.document || res.data?.document || res.data || res;
        this.loading = false;
      },
      error: (err) => {
        console.warn('Public share endpoint error, trying fallback:', err);
        // Fallback: If slug is numeric, might be a documentId
        if (!isNaN(Number(slug))) {
          this.documentService.getDocument(slug).subscribe({
            next: (res) => {
              this.document = res.document;
              this.loading = false;
            },
            error: () => {
              this.error = 'This shared document is no longer active or the link has expired.';
              this.loading = false;
            }
          });
        } else {
          this.error = 'This shared document is no longer active or the link has expired.';
          this.loading = false;
        }
      }
    });
  }

  getMainSections(): DocumentSection[] {
    if (!this.document?.sections) return [];
    return this.document.sections.filter(s => !s.isSidebar);
  }

  getSidebarSections(): DocumentSection[] {
    if (!this.document?.sections) return [];
    return this.document.sections.filter(s => s.isSidebar);
  }

  hasSidebar(): boolean {
    return this.getSidebarSections().length > 0;
  }

  getItemText(itm: any): string {
    if (!itm) return '';
    if (typeof itm === 'string') return itm;
    return itm.content || itm.title || itm.text || '';
  }

  printDocument(): void {
    window.print();
  }
}
