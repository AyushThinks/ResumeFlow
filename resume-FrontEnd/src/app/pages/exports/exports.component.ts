import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from '../../core/services/app-data.service';

@Component({
  selector: 'app-exports',
  templateUrl: './exports.component.html',
  styleUrls: ['./exports.component.scss'],
})
export class ExportsComponent implements OnInit {
  exports: any[] = [];
  loading = true;
  error = '';

  constructor(
    private service: AppDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExports();
  }

  loadExports(): void {
    this.loading = true;
    this.service.getExports().subscribe({
      next: (r) => {
        const backendExports = r.exports || [];
        const localExports = this.service.getLocalExports();

        // Merge unique exports
        const combined = [...localExports];
        backendExports.forEach((be: any) => {
          if (!combined.some(le => le.id === be.id || (le.documentId === be.documentId && le.createdAt === be.createdAt))) {
            combined.push(be);
          }
        });

        this.exports = combined;
        this.loading = false;
      },
      error: () => {
        this.exports = this.service.getLocalExports();
        this.loading = false;
      }
    });
  }

  getTitle(item: any): string {
    return item.documentTitle || item.title || item.name || 'Resume export';
  }

  getDate(item: any): any {
    return item.createdAt || item.updatedAt || item.date || new Date();
  }

  getFormat(item: any): string {
    return item.format || 'PDF (Vector Print)';
  }

  openDocument(item: any): void {
    if (item.documentId) {
      this.router.navigate(['/editor', item.documentId]);
    } else {
      this.router.navigate(['/documents']);
    }
  }
}
