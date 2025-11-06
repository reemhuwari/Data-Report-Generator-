import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../serviecs/report.service'; 
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  reports: any[] = [];


  constructor(private rs: ReportService ,private router: Router) {}

  ngOnInit() {
    this.reports = this.rs.getAll(); // أو استدعاء API لاحقاً
  }

  viewReport(id: string) {
    const report = this.rs.getById(id);
    if (report) {
      localStorage.setItem('selectedReport', JSON.stringify(report));
      this.router.navigate(['/report',id]); // 🔁 انتقل إلى صفحة التقرير
    }
  }


  deleteReport(id: number) {
    this.rs.delete(id);
    this.reports = this.rs.getAll(); // تحديث القائمة بعد الحذف
  }
}
