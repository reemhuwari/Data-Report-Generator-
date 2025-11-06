import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private key = 'reports';

  getAll() {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string) {
    const reports = this.getAll();
    return reports.find((r: any) => r.id === id);
  }

  add(report: any) {
    const reports = this.getAll();
    report.id = Date.now(); // رقم مميز
    reports.push(report);
    localStorage.setItem(this.key, JSON.stringify(reports));
  }

  delete(id: number) {
    const reports = this.getAll().filter((r: any) => r.id !== id);
    localStorage.setItem(this.key, JSON.stringify(reports));
  }
}
