import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';

interface ResumeTemplate {
  name: string;
  category: string;
  description: string;
  accent: string;
  layout: string;
}

@Component({
  selector: 'app-templates-page',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesPageComponent {
  templates: ResumeTemplate[] = [
    {
      name: 'Classic',
      category: 'Professional',
      description: 'Clean single-column layout for a traditional application.',
      accent: 'green',
      layout: 'classic',
    },
    {
      name: 'Modern',
      category: 'Modern',
      description: 'Balanced modern layout with strong section hierarchy.',
      accent: 'blue',
      layout: 'modern',
    },
    {
      name: 'Technical',
      category: 'Engineering',
      description: 'Dense, technical layout designed for engineering profiles.',
      accent: 'purple',
      layout: 'technical',
    },
    {
      name: 'Sidebar Gold',
      category: 'Creative',
      description: 'Two-column resume with a compact sidebar.',
      accent: 'gold',
      layout: 'sidebar',
    },
    {
      name: 'Sidebar Teal',
      category: 'Creative',
      description: 'Two-column layout with a bold teal identity panel.',
      accent: 'teal',
      layout: 'sidebar',
    },
    {
      name: 'Sidebar Blue',
      category: 'Modern',
      description: 'Two-column layout with electric blue accents.',
      accent: 'blue',
      layout: 'sidebar',
    },
    {
      name: 'Simple',
      category: 'Minimal',
      description: 'Minimal typography and generous whitespace.',
      accent: 'gray',
      layout: 'simple',
    },
  ];

  isCreating = false;

  constructor(
    private router: Router,
    private documentService: DocumentService
  ) {}

  useTemplate(template: ResumeTemplate): void {
    this.isCreating = true;
    const payload = {
      title: `${template.name} Resume — ${new Date().getFullYear()}`,
      type: 'resume',
      template: template.name
    };

    this.documentService.createDocument(payload).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res?.document?.id) {
          this.router.navigate(['/documents', res.document.id]);
        } else {
          this.router.navigate(['/documents']);
        }
      },
      error: (err) => {
        console.error('Failed to create from template:', err);
        this.isCreating = false;
        this.router.navigate(['/documents'], { queryParams: { template: template.name } });
      }
    });
  }
}

