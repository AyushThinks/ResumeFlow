import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userName = "";
  documentCount = 0;
  applicationCount = 0;
  versionCount = 0;
  exportCount = 0;
  recentDocuments: any[] = [];

  savedCount = 0;
  appliedCount = 0;
  interviewCount = 0;
  offerCount = 0;
  rejectedCount = 0;

  savedPercentage = 0;
  appliedPercentage = 0;
  interviewPercentage = 0;
  offerPercentage = 0;
  rejectedPercentage = 0;

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    
    const user = localStorage.getItem('userName');
    if (user) {
      const userData = JSON.parse(user);
      this.userName = userData.name;
    }

    // Get documents
    this.dashboardService.getDocuments().subscribe({
      next: (response) => {
        this.documentCount = response.documents.length;

        // Latest 4 documents
        this.recentDocuments = response.documents
          .sort((a: any, b: any) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
          )
          .slice(0, 4);

        // Get versions for each document
        this.versionCount = 0;
        response.documents.forEach((document: any) => {
          this.dashboardService.getVersions(document.id).subscribe({
            next: (versionResponse) => {
              this.versionCount += versionResponse.versions.length;
            },
            error: (error) => {
              console.error('Failed to load versions:', error);
            }
          });
        });
      },
      error: (error) => {
        console.error('Failed to load documents:', error);
      }
    });

    // Get applications
    this.dashboardService.getApplications().subscribe({
      next: (response) => {
        const applications = response.applications;
        this.applicationCount = applications.length;

        this.savedCount = applications.filter(
          (application: any) => application.status === 'saved'
        ).length;
        this.appliedCount = applications.filter(
          (application: any) => application.status === 'applied'
        ).length;
        this.interviewCount = applications.filter(
          (application: any) => application.status === 'interview'
        ).length;
        this.offerCount = applications.filter(
          (application: any) => application.status === 'offer'
        ).length;
        this.rejectedCount = applications.filter(
          (application: any) => application.status === 'rejected'
        ).length;

        const total = applications.length;
        if (total > 0) {
          this.savedPercentage = (this.savedCount / total) * 100;
          this.appliedPercentage = (this.appliedCount / total) * 100;
          this.interviewPercentage = (this.interviewCount / total) * 100;
          this.offerPercentage = (this.offerCount / total) * 100;
          this.rejectedPercentage = (this.rejectedCount / total) * 100;
        }
      },
      error: (error) => {
        console.error('Failed to load applications:', error);
      }
    });

    // Get exports (backend + local user-scoped merged)
    this.dashboardService.getExports().subscribe({
      next: (response) => {
        const backendExports = response.exports || [];
        const localExports = this.getLocalExports();
        const combined = [...localExports];
        backendExports.forEach((be: any) => {
          if (!combined.some(le => le.id === be.id || (le.documentId === be.documentId && le.createdAt === be.createdAt))) {
            combined.push(be);
          }
        });
        this.exportCount = combined.length;
      },
      error: () => {
        const localExports = this.getLocalExports();
        this.exportCount = localExports.length;
      }
    });
  }

  private getLocalExports(): any[] {
    try {
      const userRaw = localStorage.getItem('userName');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user && user.id) {
          return JSON.parse(localStorage.getItem(`rf_exports_user_${user.id}`) || '[]');
        }
        if (user && user.email) {
          return JSON.parse(localStorage.getItem(`rf_exports_user_${user.email}`) || '[]');
        }
      }
    } catch (e) {}
    return [];
  }
}