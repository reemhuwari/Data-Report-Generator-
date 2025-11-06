import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable()
export class DataService {
  parseCsvFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        const rows: any[] = results.data;
        const rowsPreview = rows.slice(0, 10);

        // تحديد نوع chartData صراحةً
        const numericColumn = rows.length && Object.keys(rows[0]).find(k => !isNaN(rows[0][k]));
        const chartData: { label: string; value: number }[] = [];

        if (numericColumn) {
          const counts: Record<string, number> = {};
          rows.forEach(r => counts[r[numericColumn]] = (counts[r[numericColumn]] || 0) + 1);
          Object.keys(counts).forEach(key => chartData.push({ label: key, value: counts[key] }));
        }

        resolve({ rows, rowsPreview, chartData, chartTitle: numericColumn || 'Preview' });
      },
      error: (err: any) => reject(err)
    });
  });
}



  // mock generate
  async generateReportMock(payload: any) {
    // create fake report and save locally
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const report = { id: Date.now().toString(), title: payload.prompt || 'Report', reportText: 'Generated summary (mock).', dataSummary: payload.summary };
    reports.unshift(report);
    localStorage.setItem('reports', JSON.stringify(reports));
    return report;
  }
}
