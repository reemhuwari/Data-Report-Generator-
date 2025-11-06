import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { ChartComponent } from '../chart/chart.component';
import { ReportService } from '../../serviecs/report.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartComponent],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  report: any;
  reportGenerated = false;
  reportText = '';
  prompt = '';
  selectedFile: File | null = null;

  constructor(private rs: ReportService) {}

  ngOnInit(): void {
    // ✅ استرجاع التقرير المختار من localStorage
    const saved = localStorage.getItem('selectedReport');
    if (saved) {
      this.report = JSON.parse(saved);
      this.reportGenerated = true;
      this.reportText = this.report.reportText;
      this.prompt = this.report.prompt;
      
    }
    
 
  


  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  generateReport() {
    if (!this.selectedFile || !this.prompt) return;
    this.reportText = `Report generated for prompt: "${this.prompt}"`;
    this.reportGenerated = true;
  }

  downloadPDF() {
  const doc = new jsPDF();
  doc.text(this.reportText || '', 10, 10);

  // لو في بيانات جدول
  if (this.report?.rows) {
    let y = 20;
    const headers = Object.keys(this.report.rows[0]);
    doc.text(headers.join(' | '), 10, y);
    y += 10;
    this.report.rows.forEach((row: any) => {
      doc.text(Object.values(row).join(' | '), 10, y);
      y += 10;
    });
  }

  doc.save(`report_${this.report?.id || Date.now()}.pdf`);
}

}
