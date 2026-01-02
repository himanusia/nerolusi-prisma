import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface CertificateData {
  name: string;
  birthDate: Date;
  birthPlace: string;
  school: string;
  testDate: Date;
  testName: string;
  testYear: number;
  averageScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  emptyAnswers: number;
  scores: {
    kpu: number;
    kk: number;
    kpbm: number;
    kmbm: number;
    lbi: number;
    lbe: number;
    pm: number;
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

// function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
//   const words = text.split(' ');
//   const lines: string[] = [];
//   let currentLine = words[0] ?? '';

//   for (let i = 1; i < words.length; i++) {
//     const word = words[i];
//     const testLine = currentLine + ' ' + word;
//     const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
//     if (testWidth > maxWidth) {
//       lines.push(currentLine);
//       currentLine = word ?? '';
//     } else {
//       currentLine = testLine;
//     }
//   }
//   lines.push(currentLine);
//   return lines;
// }

export async function generateCertificate(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  const page = pdfDoc.addPage([842, 595]);
  
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const greenColor = rgb(0.157, 0.553, 0.341);
  const darkTextColor = rgb(0.2, 0.2, 0.2);
  const grayTextColor = rgb(0.4, 0.4, 0.4);
  
  // gray background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 842,
    height: 595,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  // watermark logo
  try {
    const watermarkPath = path.join(process.cwd(), 'public', 'logo_black.png');
    if (fs.existsSync(watermarkPath)) {
      const watermarkImageBytes = fs.readFileSync(watermarkPath);
      const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
      
      const watermarkDims = watermarkImage.scale(0.6);
      
      page.drawImage(watermarkImage, {
        x: (842 - watermarkDims.width) / 2,
        y: (595 - watermarkDims.height) / 2,
        width: watermarkDims.width,
        height: watermarkDims.height,
        opacity: 0.05,
      });
    } else {
      console.warn('Watermark image not found at:', watermarkPath);
    }
  } catch (error) {
    console.error('Error loading watermark:', error);
    console.error('Current working directory:', process.cwd());
  }
  
  const headerHeight = 80;
  
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo2.png');
    if (fs.existsSync(logoPath)) {
      const logoImageBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      
      const logoDims = logoImage.scale(0.5);
      
      page.drawImage(logoImage, {
        x: (842 - logoDims.width) / 2,
        y: 580 - headerHeight + (headerHeight - logoDims.height) / 2,
        width: logoDims.width,
        height: logoDims.height,
      });
    } else {
      console.warn('Logo image not found at:', logoPath);
      // Fallback to text logo
      page.drawText('NEROLUSI', {
        x: (842 - boldFont.widthOfTextAtSize('NEROLUSI', 28)) / 2,
        y: 595 - 45,
        size: 28,
        font: boldFont,
        color: darkTextColor,
      });
    }
  } catch (error) {
    console.error('Error loading logo:', error);
    console.error('Current working directory:', process.cwd());
    page.drawText('NEROLUSI', {
      x: (842 - boldFont.widthOfTextAtSize('NEROLUSI', 28)) / 2,
      y: 595 - 45,
      size: 28,
      font: boldFont,
      color: darkTextColor,
    });
  }
    
  // Draw title
  const title = `SERTIFIKAT HASIL ${data.testName}`;
  const titleWidth = boldFont.widthOfTextAtSize(title, 18);
  page.drawText(title, {
    x: (842 - titleWidth) / 2,
    y: 595 - 120,
    size: 18,
    font: boldFont,
    color: darkTextColor,
  });
  
  const subtitle = `UJIAN TULIS BERBASIS KOMPUTER (UTBK) ${data.testYear}`;
  const subtitleWidth = regularFont.widthOfTextAtSize(subtitle, 14);
  const totalWidth = subtitleWidth + 5;
  
  const startX = (842 - totalWidth) / 2;
  page.drawText(subtitle, {
    x: startX,
    y: 595 - 140,
    size: 14,
    font: regularFont,
    color: grayTextColor,
  });
  
  
  page.drawLine({
    start: { x: 50, y: 595 - 155 },
    end: { x: 792, y: 595 - 155 },
    thickness: 2,
    color: darkTextColor,
  });
  
  // Student information section
  const leftX = 70;
  let currentY = 595 - 190;
  
  page.drawText('Nama', {
    x: leftX,
    y: currentY,
    size: 11,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(':', {
    x: leftX + 150,
    y: currentY,
    size: 11,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(data.name, {
    x: leftX + 170,
    y: currentY,
    size: 11,
    font: regularFont,
    color: darkTextColor,
  });
  
  currentY -= 25;
  
  page.drawText('Tempat / Tanggal Lahir', {
    x: leftX,
    y: currentY,
    size: 11,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(':', {
    x: leftX + 150,
    y: currentY,
    size: 11,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(`${data.birthPlace}, ${formatDate(data.birthDate)}`, {
    x: leftX + 170,
    y: currentY,
    size: 11,
    font: regularFont,
    color: darkTextColor,
  });
  
  currentY -= 25;
  
  page.drawText('Asal Sekolah', {
    x: leftX,
    y: currentY,
    size: 11,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(':', {
    x: leftX + 150,
    y: currentY,
    size: 11,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(data.school, {
    x: leftX + 170,
    y: currentY,
    size: 11,
    font: regularFont,
    color: darkTextColor,
  });
  
  currentY -= 40;
  const testDateText = `Telah mengikuti TO UTBK `;
  page.drawText(testDateText, {
    x: leftX,
    y: currentY,
    size: 10,
    font: regularFont,
    color: grayTextColor,
  });
  const byNerolusi = 'by Nerolusi';
  page.drawText(byNerolusi, {
    x: leftX + regularFont.widthOfTextAtSize(testDateText, 10),
    y: currentY,
    size: 10,
    font: italicFont,
    color: greenColor,
  });
  const testDateText2 = ` pada tanggal ${formatDate(data.testDate)}.`;
  page.drawText(testDateText2, {
    x: leftX + regularFont.widthOfTextAtSize(testDateText, 10) + italicFont.widthOfTextAtSize(byNerolusi, 10),
    y: currentY,
    size: 10,
    font: regularFont,
    color: grayTextColor,
  });
  currentY -= 15;
  page.drawText('Dengan hasil UTBK sebagai berikut:', {
    x: leftX,
    y: currentY,
    size: 10,
    font: regularFont,
    color: grayTextColor,
  });
  
  // Score box
  currentY -= 40;
  const boxX = leftX;
  const boxY = currentY - 70;
  const containerHeight = 90;
  const containerWidth = 330;
  
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: containerWidth,
    height: containerHeight,
    color: greenColor,
    
  });
  
  page.drawText('Skor rata-rata', {
    x: boxX + 15,
    y: boxY + containerHeight - 25,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  
  const scoreText = Math.round(data.averageScore).toString();
  const scoreSize = 52;
  page.drawText(scoreText, {
    x: boxX + 30,
    y: boxY + 20,
    size: scoreSize,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  
  const miniBoxWidth = 60;
  const miniBoxHeight = 70;
  const spacing = 8;
  const start_X = boxX + 120;
  const miniBoxY = boxY + (containerHeight - miniBoxHeight) / 2;
  
  const benarX = start_X;
  page.drawRectangle({
    x: benarX,
    y: miniBoxY,
    width: miniBoxWidth,
    height: miniBoxHeight,
    color: rgb(0.92, 0.98, 0.95),
  });
  const correctText = data.correctAnswers.toString();
  page.drawText(correctText, {
    x: benarX + (miniBoxWidth - boldFont.widthOfTextAtSize(correctText, 24)) / 2,
    y: miniBoxY + 35,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.55, 0.25),
  });
  page.drawText('Benar', {
    x: benarX + (miniBoxWidth - regularFont.widthOfTextAtSize('Benar', 8)) / 2,
    y: miniBoxY + 18,
    size: 8,
    font: regularFont,
    color: rgb(0.1, 0.55, 0.25),
  });
  
  const salahX = benarX + miniBoxWidth + spacing;
  page.drawRectangle({
    x: salahX,
    y: miniBoxY,
    width: miniBoxWidth,
    height: miniBoxHeight,
    color: rgb(0.98, 0.92, 0.92),
  });
  const wrongText = data.wrongAnswers.toString();
  page.drawText(wrongText, {
    x: salahX + (miniBoxWidth - boldFont.widthOfTextAtSize(wrongText, 24)) / 2,
    y: miniBoxY + 35,
    size: 24,
    font: boldFont,
    color: rgb(0.7, 0.15, 0.15),
  });
  page.drawText('Salah', {
    x: salahX + (miniBoxWidth - regularFont.widthOfTextAtSize('Salah', 8)) / 2,
    y: miniBoxY + 18,
    size: 8,
    font: regularFont,
    color: rgb(0.7, 0.15, 0.15),
  });
  
  const kosongX = salahX + miniBoxWidth + spacing;
  page.drawRectangle({
    x: kosongX,
    y: miniBoxY,
    width: miniBoxWidth,
    height: miniBoxHeight,
    color: rgb(0.94, 0.94, 0.94),
  });
  const emptyText = data.emptyAnswers.toString();
  page.drawText(emptyText, {
    x: kosongX + (miniBoxWidth - boldFont.widthOfTextAtSize(emptyText, 24)) / 2,
    y: miniBoxY + 35,
    size: 24,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText('Kosong', {
    x: kosongX + (miniBoxWidth - regularFont.widthOfTextAtSize('Kosong', 8)) / 2,
    y: miniBoxY + 18,
    size: 8,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Right side
  const rightX = 450;
  let rightY = 595 - 190;
  
  page.drawText('Tes Potensi Skolastik:', {
    x: rightX,
    y: rightY,
    size: 12,
    font: boldFont,
    color: darkTextColor,
  });
  
  rightY -= 25;
  
  const scoreItems = [
    { label: 'Kemampuan Penalaran Umum', value: data.scores.kpu },
    { label: 'Kemampuan Kuantitatif', value: data.scores.kk },
    { label: 'Pengetahuan dan Pemahaman Umum', value: data.scores.kpbm },
    { label: 'Kemampuan Memahami Bacaan dan Menulis', value: data.scores.kmbm },
  ];
  
  scoreItems.forEach(item => {
    page.drawText(item.label, {
      x: rightX,
      y: rightY,
      size: 10,
      font: regularFont,
      color: grayTextColor,
    });
    page.drawText(item.value.toString(), {
      x: rightX + 300,
      y: rightY,
      size: 10,
      font: boldFont,
      color: darkTextColor,
    });
    rightY -= 20;
  });
  
  rightY -= 10;
  
  page.drawText('Tes Literasi Bahasa:', {
    x: rightX,
    y: rightY,
    size: 12,
    font: boldFont,
    color: darkTextColor,
  });
  
  rightY -= 25;
  
  const literacyItems = [
    { label: 'Literasi Bahasa Indonesia', value: data.scores.lbi },
    { label: 'Literasi Bahasa Inggris', value: data.scores.lbe },
  ];
  
  literacyItems.forEach(item => {
    page.drawText(item.label, {
      x: rightX,
      y: rightY,
      size: 10,
      font: regularFont,
      color: grayTextColor,
    });
    page.drawText(item.value.toString(), {
      x: rightX + 300,
      y: rightY,
      size: 10,
      font: boldFont,
      color: darkTextColor,
    });
    rightY -= 20;
  });
  
  rightY -= 10;
  
  page.drawText('Tes Penalaran Matematika:', {
    x: rightX,
    y: rightY,
    size: 12,
    font: boldFont,
    color: darkTextColor,
  });
  
  rightY -= 25;
  
  page.drawText('Penalaran Matematika', {
    x: rightX,
    y: rightY,
    size: 10,
    font: regularFont,
    color: grayTextColor,
  });
  page.drawText(data.scores.pm.toString(), {
    x: rightX + 300,
    y: rightY,
    size: 10,
    font: boldFont,
    color: darkTextColor,
  });
  
  page.drawText('www.nerolusi.com', {
    x: (842 - regularFont.widthOfTextAtSize('www.nerolusi.com', 20)) / 2,
    y: 30,
    size: 20,
    font: boldFont,
    color: grayTextColor,
    opacity: 0.2,
  });
  
  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
