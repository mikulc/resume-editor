import { useCallback, useRef, useState } from 'react';
import { snapdom } from '@zumer/snapdom';
import jsPDF from 'jspdf';

export function useExportPDF(scale: number = 2.5) {
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const exportPDF = useCallback(async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      // 多页模式：每页是一张独立的 .resume-paper，逐张截图放到独立 PDF 页
      const papers = previewRef.current.querySelectorAll('.resume-paper');
      if (papers.length === 0) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;

      for (let i = 0; i < papers.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await snapdom.toCanvas(papers[i] as HTMLElement, {
          scale,
          backgroundColor: '#ffffff',
        });

        // 用 JPEG 替代 PNG：白底文字内容 JPEG 压缩率极高，文件大小从 ~13MB 降至 ~1-3MB
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('我的简历.pdf');
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setIsExporting(false);
    }
  }, [scale]);

  return { previewRef, exportPDF, isExporting };
}
