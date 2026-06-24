// Export all dashboard slides to PDF using html2canvas + jsPDF
// Called from the Dashboard component header

export async function exportToPDF(
  totalSlides: number,
  setActiveSlide: (n: number) => void,
  contentRef: React.RefObject<HTMLDivElement>,
  onProgress: (pct: number) => void
): Promise<void> {
  // Dynamic imports (avoid SSR issues)
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });
  const W = 1280, H = 720;

  for (let i = 1; i <= totalSlides; i++) {
    // Switch to the slide
    setActiveSlide(i);
    // Wait for React to render
    await new Promise(r => setTimeout(r, 350));

    const el = contentRef.current;
    if (!el) continue;

    const canvas = await html2canvas(el, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#0d0d0f',
      logging: false,
      width: el.scrollWidth,
      height: el.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);

    if (i > 1) pdf.addPage([W, H], 'landscape');

    // Scale canvas to fit PDF page
    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const ratio   = Math.min(W / canvasW, H / canvasH);
    const imgW    = canvasW * ratio;
    const imgH    = canvasH * ratio;
    const offsetX = (W - imgW) / 2;
    const offsetY = (H - imgH) / 2;

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgW, imgH);
    onProgress(Math.round((i / totalSlides) * 100));
  }

  pdf.save(`Teloneer_W${new Date().getMonth() + 1}_Dashboard.pdf`);
}
