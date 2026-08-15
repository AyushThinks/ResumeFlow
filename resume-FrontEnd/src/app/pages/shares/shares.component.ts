import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from '../../core/services/app-data.service';

interface ShareLink {
  id?: number;
  slug: string;
  documentId?: number;
  documentTitle?: string;
  Document?: { title: string; id: number };
  createdAt: string;
  views?: number;
  active?: boolean;
}

@Component({
  selector: 'app-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss'],
})
export class SharesComponent implements OnInit {
  links: ShareLink[] = [];
  loading = true;
  error = '';
  copied = '';

  constructor(
    private appDataService: AppDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadShares();
  }

  loadShares(): void {
    this.loading = true;
    this.error = '';

    this.appDataService.getShares().subscribe({
      next: (res) => {
        this.links = res.shares || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load shares:', err);
        this.error = 'Unable to load shared links from backend.';
        this.loading = false;
      }
    });
  }

  getShareUrl(link: ShareLink): string {
    return `${window.location.origin}/r/${link.slug}`;
  }

  getDocTitle(link: ShareLink): string {
    return link.Document?.title || link.documentTitle || 'Shared Document';
  }

  copy(link: ShareLink): void {
    const url = this.getShareUrl(link);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    this.copied = link.slug;
    setTimeout(() => (this.copied = ''), 2000);
  }

  openLink(link: ShareLink): void {
    window.open(this.getShareUrl(link), '_blank');
  }

  openDocument(link: ShareLink): void {
    const docId = link.documentId || link.Document?.id;
    if (docId) {
      this.router.navigate(['/editor', docId]);
    } else {
      this.openLink(link);
    }
  }

  deleteShare(link: ShareLink): void {
    if (!link.id) return;
    if (!window.confirm('Revoke and delete this public share link?')) return;

    this.appDataService.deleteShare(link.id).subscribe({
      next: () => {
        this.links = this.links.filter(l => l.id !== link.id);
      },
      error: (err) => {
        this.error = 'Failed to revoke link.';
      }
    });
  }
}

