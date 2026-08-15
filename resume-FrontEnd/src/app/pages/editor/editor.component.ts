import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService, ResumeDocument, DocumentSection, DocumentSectionItem } from '../../core/services/document.service';
import { AppDataService } from '../../core/services/app-data.service';

export interface PersonalInfo {
  fullName: string;
  tagline: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  phone: string;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  documentId: number | string = '';
  document: ResumeDocument | null = null;

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  activeTab: 'content' | 'versions' | 'preview' = 'content';

  versions: any[] = [];
  isLoadingVersions = false;
  user: any = null;

  personalInfo: PersonalInfo = {
    fullName: '',
    tagline: '',
    email: '',
    location: 'Haldwani, Uttarakhand, India',
    github: '',
    linkedin: '',
    phone: '+1 (555) 019-2834'
  };

  readonly availableTemplates = [
    'Modern',
    'Classic',
    'Technical',
    'Sidebar Gold',
    'Sidebar Teal',
    'Sidebar Blue',
    'Simple',
    'test'
  ];

  readonly documentTypes = [
    { value: 'resume', label: 'Resume' },
    { value: 'cv', label: 'CV' },
    { value: 'cover-letter', label: 'Cover Letter' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private appDataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.documentId = id;
        this.loadDocument(id);
      } else {
        this.errorMessage = 'No document ID specified.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {}

  loadDocument(id: number | string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.documentService.getDocument(id).subscribe({
      next: (res) => {
        this.document = res.document;
        if (!this.personalInfo.tagline && this.document?.title) {
          this.personalInfo.tagline = this.document.title.toUpperCase();
        }

        if (!this.document.sections || !this.document.sections.length) {
          this.document.sections = this.getDefaultSections();
        } else {
          // Normalize items into string array or objects
          this.document.sections.forEach(sec => {
            if (!sec.items) {
              sec.items = [];
            }
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load document:', err);
        this.errorMessage = err?.error?.message || 'Unable to open document. Please verify the backend is running.';
        this.isLoading = false;
      }
    });
  }

  loadCurrentUser(): void {
    const storedUser = localStorage.getItem('userName');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        this.user = { name: storedUser };
      }
    }

    if (this.user?.name) {
      this.personalInfo.fullName = this.user.name;
      const handle = this.user.name.toLowerCase().replace(/\s+/g, '-');
      this.personalInfo.github = `github.com/${handle}`;
      this.personalInfo.linkedin = `linkedin.com/in/${handle}`;
    }
    if (this.user?.email) {
      this.personalInfo.email = this.user.email;
    }
  }

  get fullNameDisplay(): string {
    if (this.personalInfo.fullName && this.personalInfo.fullName.trim()) {
      return this.personalInfo.fullName.trim().toUpperCase();
    }
    if (this.user?.name) {
      return this.user.name.trim().toUpperCase();
    }
    return 'CANDIDATE NAME';
  }

  get firstName(): string {
    const parts = this.fullNameDisplay.split(/\s+/);
    return parts[0] || 'FIRST';
  }

  get lastName(): string {
    const parts = this.fullNameDisplay.split(/\s+/);
    return parts.slice(1).join(' ') || '';
  }

  get initialLetter(): string {
    return this.firstName.charAt(0).toUpperCase() || 'A';
  }

  get displayEmail(): string {
    return this.personalInfo.email || this.user?.email || 'email@example.com';
  }

  get displayLocation(): string {
    return this.personalInfo.location || 'Haldwani, Uttarakhand, India';
  }

  get displayGithub(): string {
    return this.personalInfo.github || 'github.com/profile';
  }

  get displayLinkedin(): string {
    return this.personalInfo.linkedin || 'linkedin.com/in/profile';
  }

  get displayPhone(): string {
    return this.personalInfo.phone || '+1 (555) 019-2834';
  }

  get displayTagline(): string {
    return this.personalInfo.tagline || this.document?.title || 'PROFESSIONAL RESUME';
  }

  get userInitials(): string {
    if (this.personalInfo.fullName && this.personalInfo.fullName.trim()) {
      const nameParts = this.personalInfo.fullName.trim().split(/\s+/);
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
    if (!this.user?.name) {
      return 'AJ';
    }
    const nameParts = this.user.name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  getDefaultSections(): DocumentSection[] {
    return [
      {
        heading: 'Profile',
        isSidebar: false,
        items: ['Passionate software engineer with expertise in building scalable, accessible web applications and modern user interfaces.']
      },
      {
        heading: 'Experience',
        isSidebar: false,
        items: [
          'Senior Frontend Developer at Tech Corp (2024 - Present): Led design system migration and improved core web vitals by 35%.',
          'Software Engineer at StartUp Hub (2022 - 2024): Developed reactive Angular dashboards and real-time synchronization pipelines.'
        ]
      },
      {
        heading: 'Skills',
        isSidebar: true,
        items: ['TypeScript, JavaScript, Angular, RxJS, HTML5, CSS3/SCSS, Git, REST APIs, SQL, Docker']
      },
      {
        heading: 'Education',
        isSidebar: true,
        items: ['B.Tech in Computer Science — Dehradun Institute of Technology (2022)']
      }
    ];
  }

  saveDocument(navigateBack: boolean = false): void {
    if (!this.document) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare payload for backend PUT /api/documents/:id
    const payload = {
      title: this.document.title,
      type: this.document.type,
      template: this.document.template || 'Modern',
      sections: this.document.sections?.map((sec, idx) => ({
        heading: sec.heading || `Section ${idx + 1}`,
        isSidebar: sec.isSidebar === true,
        items: (sec.items || []).map(it => typeof it === 'string' ? it : it.content).filter(Boolean)
      }))
    };

    this.documentService.updateDocument(this.documentId, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'All changes saved successfully.';
        if (res.document) {
          this.document = { ...this.document, ...res.document };
        }
        if (navigateBack) {
          this.router.navigate(['/documents']);
        } else {
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      },
      error: (err) => {
        console.error('Failed to save document:', err);
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to save document changes.';
      }
    });
  }

  saveAndExit(): void {
    this.saveDocument(true);
  }

  // Section Management
  addSection(): void {
    if (!this.document) return;
    if (!this.document.sections) this.document.sections = [];
    this.document.sections.push({
      heading: 'New Section',
      isSidebar: false,
      items: ['Add your details or achievements here.']
    });
  }

  removeSection(index: number): void {
    if (!this.document || !this.document.sections) return;
    this.document.sections.splice(index, 1);
  }

  moveSectionUp(index: number): void {
    if (!this.document || !this.document.sections || index === 0) return;
    const temp = this.document.sections[index];
    this.document.sections[index] = this.document.sections[index - 1];
    this.document.sections[index - 1] = temp;
  }

  moveSectionDown(index: number): void {
    if (!this.document || !this.document.sections || index === this.document.sections.length - 1) return;
    const temp = this.document.sections[index];
    this.document.sections[index] = this.document.sections[index + 1];
    this.document.sections[index + 1] = temp;
  }

  // Item Management
  addItem(section: DocumentSection): void {
    if (!section.items) section.items = [];
    section.items.push('');
  }

  removeItem(section: DocumentSection, itemIndex: number): void {
    if (!section.items) return;
    section.items.splice(itemIndex, 1);
  }

  getItemContent(item: string | DocumentSectionItem): string {
    return typeof item === 'string' ? item : item?.content || '';
  }

  setItemContent(section: DocumentSection, index: number, event: any): void {
    const val = event.target.value;
    if (typeof section.items[index] === 'string') {
      section.items[index] = val;
    } else {
      (section.items[index] as DocumentSectionItem).content = val;
    }
  }

  // Version Control
  loadVersions(): void {
    this.isLoadingVersions = true;
    this.documentService.getVersions(this.documentId).subscribe({
      next: (res) => {
        this.versions = res.versions || [];
        this.isLoadingVersions = false;
      },
      error: (err) => {
        console.error('Failed to load versions:', err);
        this.isLoadingVersions = false;
      }
    });
  }

  createVersion(): void {
    const name = window.prompt('Enter version snapshot name (e.g. "Pre-Interview Update"):');
    if (!name) return;

    this.documentService.createVersion(this.documentId, name).subscribe({
      next: () => {
        this.successMessage = `Snapshot "${name}" created.`;
        this.loadVersions();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to create version snapshot.';
      }
    });
  }

  restoreVersion(versionId: number | string): void {
    const confirm = window.confirm('Restore this version? Unsaved changes will be replaced.');
    if (!confirm) return;

    this.documentService.restoreVersion(this.documentId, versionId).subscribe({
      next: () => {
        this.successMessage = 'Version restored successfully.';
        this.loadDocument(this.documentId);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to restore version.';
      }
    });
  }

  // Sharing
  createShareLink(): void {
    this.documentService.createShare(this.documentId).subscribe({
      next: (res) => {
        const url = `${window.location.origin}/r/${res.share?.slug || res.slug}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          window.alert(`Public share link copied to clipboard:\n${url}`);
        } else {
          window.prompt('Public share link:', url);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to generate public share link.';
      }
    });
  }

  printResume(): void {
    if (this.document) {
      this.appDataService.recordExport(
        this.documentId,
        this.document.title,
        this.document.type,
        'PDF (Vector Print)'
      );
    }
    window.print();
  }

  getMainSections(): DocumentSection[] {
    if (!this.document || !this.document.sections) return [];
    const isSidebarTemplate = (this.document.template || '').toLowerCase().includes('sidebar');
    if (!isSidebarTemplate) return this.document.sections;
    return this.document.sections.filter(s => !s.isSidebar);
  }

  getSidebarSections(): DocumentSection[] {
    if (!this.document || !this.document.sections) return [];
    return this.document.sections.filter(s => s.isSidebar);
  }

  getTemplateClass(): string {
    const t = (this.document?.template || 'Modern').toLowerCase();
    if (t.includes('classic')) return 'template-classic';
    if (t.includes('technical')) return 'template-technical';
    if (t.includes('gold')) return 'template-sidebar-gold';
    if (t.includes('teal')) return 'template-sidebar-teal';
    if (t.includes('blue')) return 'template-sidebar-blue';
    if (t.includes('simple')) return 'template-simple';
    return 'template-modern';
  }
}
