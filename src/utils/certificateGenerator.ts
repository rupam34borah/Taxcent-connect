import { jsPDF } from 'jspdf';
import { AcademicDocument } from '../types/academic';

/**
 * Escapes XML/HTML special characters
 */
function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates a high-resolution, print-ready jsPDF instance for an approved certificate
 * Dimensions: A4 Landscape (297mm x 210mm)
 */
export function generateOfficialCertificatePdf(doc: AcademicDocument): jsPDF {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background subtle cream / warm white
  pdf.setFillColor(254, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Primary Deep Navy Border
  pdf.setDrawColor(10, 37, 64); // #0a2540
  pdf.setLineWidth(2.2);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner Ornate Gold Border
  pdf.setDrawColor(197, 155, 39); // #c59b27
  pdf.setLineWidth(0.8);
  pdf.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23);

  // Corner decorative accents
  const corners = [
    { x: 11.5, y: 11.5, dx: 1, dy: 1 },
    { x: pageWidth - 11.5, y: 11.5, dx: -1, dy: 1 },
    { x: 11.5, y: pageHeight - 11.5, dx: 1, dy: -1 },
    { x: pageWidth - 11.5, y: pageHeight - 11.5, dx: -1, dy: -1 },
  ];

  pdf.setDrawColor(197, 155, 39);
  pdf.setLineWidth(1.2);
  corners.forEach(c => {
    pdf.line(c.x, c.y, c.x + c.dx * 8, c.y);
    pdf.line(c.x, c.y, c.x, c.y + c.dy * 8);
    pdf.circle(c.x + c.dx * 3.5, c.y + c.dy * 3.5, 1, 'FD');
  });

  // Top Institute Header Banner
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(10, 37, 64); // Deep Navy
  pdf.text('QUANTUM LEARNING INSTITUTE', pageWidth / 2, 28, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(180, 130, 20); // Warm Gold
  pdf.text('CENTRE FOR COMPUTER STUDIES, PROFESSIONAL & VOCATIONAL EXCELLENCE', pageWidth / 2, 34, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139); // Slate 500
  pdf.text('Ranabari Market, NH-15, Lakhimpur, Assam — 787031 | Affiliated under Taxcent Connect Enterprise Registry', pageWidth / 2, 39, { align: 'center' });

  // Divider line
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.4);
  pdf.line(40, 43, pageWidth - 40, 43);

  // Certificate Sub-title Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(197, 155, 39);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(pageWidth / 2 - 58, 48, 116, 11, 2.5, 2.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text('CERTIFICATE OF COMPLETION & MERIT', pageWidth / 2, 55.5, { align: 'center' });

  // Recipient preamble
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('This is to proudly certify that', pageWidth / 2, 69, { align: 'center' });

  // Student Full Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(21);
  pdf.setTextColor(10, 37, 64);
  pdf.text((doc.studentFullName || 'Authorized Student').toUpperCase(), pageWidth / 2, 79, { align: 'center' });

  // Student Registration ID
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(2, 132, 199); // Sky 600
  pdf.text(`Student ID: ${doc.studentIdCode || 'QLI-STU'}`, pageWidth / 2, 85, { align: 'center' });

  // Course body
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('has successfully completed the prescribed curriculum and passed all practical & theoretical assessments for', pageWidth / 2, 94, { align: 'center' });

  // Course Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(2, 132, 199);
  pdf.text(doc.courseName || 'Computer Application Program', pageWidth / 2, 103, { align: 'center' });

  // Marks & Standing Box
  if (doc.marksOrGrade || doc.grade || doc.percentage) {
    const standingText = doc.marksOrGrade 
      ? doc.marksOrGrade 
      : `${doc.grade || 'Passed'} (${doc.percentage || 0}%) — ${doc.marksObtained || 0}/${doc.maxScore || 100} Marks`;

    pdf.setFillColor(240, 249, 255);
    pdf.setDrawColor(186, 230, 253);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(pageWidth / 2 - 50, 109, 100, 8.5, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(3, 105, 161);
    pdf.text(`Standing: ${standingText}`, pageWidth / 2, 114.8, { align: 'center' });
  }

  // Bottom Authority & Security Section
  const footerY = 145;

  // Left Column: Credential Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('REGISTRATION NUMBER', 26, footerY);

  pdf.setFont('courier', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.certificateNumber, 26, footerY + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Date of Issue: ${doc.issueDate || new Date().toISOString().split('T')[0]}`, 26, footerY + 11);
  pdf.text('Status: Officially Approved & Valid', 26, footerY + 16);

  // Center Column: Official Institution Seal & Online Verification
  const sealCenterX = pageWidth / 2;
  const sealCenterY = footerY + 4;

  pdf.setDrawColor(197, 155, 39);
  pdf.setLineWidth(1);
  pdf.circle(sealCenterX, sealCenterY, 14, 'S');

  pdf.setDrawColor(10, 37, 64);
  pdf.setLineWidth(0.4);
  pdf.circle(sealCenterX, sealCenterY, 12, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(10, 37, 64);
  pdf.text('QUANTUM LEARNING', sealCenterX, sealCenterY - 3, { align: 'center' });
  pdf.text('INSTITUTE', sealCenterX, sealCenterY + 1, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6);
  pdf.setTextColor(180, 130, 20);
  pdf.text('★ VERIFIED ★', sealCenterX, sealCenterY + 6, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Verify online at:', sealCenterX, footerY + 23, { align: 'center' });
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(2, 132, 199);
  pdf.text('taxcent-connect.github.io/#verify', sealCenterX, footerY + 27, { align: 'center' });

  // Right Column: Signatures
  const sigX = pageWidth - 65;
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.8);
  pdf.line(sigX, footerY + 9, sigX + 42, footerY + 9);

  // Simulated handwriting aesthetic for signature
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(10, 37, 64);
  pdf.text('Debajit Saikia', sigX + 21, footerY + 6, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Prof. Debajit Saikia', sigX + 21, footerY + 14, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Director / Center Head', sigX + 21, footerY + 18.5, { align: 'center' });
  pdf.text('Quantum Learning Institute', sigX + 21, footerY + 22.5, { align: 'center' });

  // Watermark if revoked
  if (doc.status === 'revoked') {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(42);
    pdf.setTextColor(239, 68, 68);
    pdf.text('REVOKED — VOID', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 25,
    });
  }

  return pdf;
}

/**
 * Direct PDF download trigger
 */
export function downloadCertificatePdf(doc: AcademicDocument): void {
  const pdf = generateOfficialCertificatePdf(doc);
  const cleanName = (doc.studentFullName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanCert = (doc.certificateNumber || 'CERT').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`QLI_Certificate_${cleanName}_${cleanCert}.pdf`);
}

/**
 * Triggers a browser print dialog formatted for A4 Landscape
 */
export function printCertificate(doc: AcademicDocument): void {
  const svg = generateOfficialCertificateSvg(doc);
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    alert('Please allow popups to open the print dialog.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Certificate - ${escapeXml(doc.certificateNumber)}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate-container {
            width: 100vw;
            height: 100vh;
            max-width: 297mm;
            max-height: 210mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${svg}
        </div>
        <script>
          window.onload = function() {
            window.focus();
            setTimeout(function() {
              window.print();
              window.close();
            }, 350);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generates high-fidelity SVG string for instant zoomable preview and in-browser printing
 */
export function generateOfficialCertificateSvg(doc: AcademicDocument): string {
  const isMarksheet = doc.documentType === 'marksheet';
  const docTitle = isMarksheet ? 'OFFICIAL ACADEMIC MARKSHEET' : 'CERTIFICATE OF COMPLETION & MERIT';
  const isRevoked = doc.status === 'revoked';

  const standingBadge = doc.marksOrGrade 
    ? doc.marksOrGrade 
    : (doc.grade ? `Grade: ${doc.grade} (${doc.percentage || 0}%) — ${doc.marksObtained || 0}/${doc.maxScore || 100} Marks` : '');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="100%" height="100%" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b48214"/>
          <stop offset="50%" stop-color="#e6be53"/>
          <stop offset="100%" stop-color="#b48214"/>
        </linearGradient>
        <linearGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a2540"/>
          <stop offset="100%" stop-color="#1e3a5f"/>
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect x="0" y="0" width="1000" height="700" fill="#ffffff"/>

      <!-- Outer Solid Deep Navy Border -->
      <rect x="24" y="24" width="952" height="652" rx="6" fill="#ffffff" stroke="#0a2540" stroke-width="6"/>

      <!-- Inner Ornate Gold Border -->
      <rect x="36" y="36" width="928" height="628" rx="4" fill="#ffffff" stroke="url(#goldGradient)" stroke-width="2.5"/>
      <rect x="42" y="42" width="916" height="616" rx="2" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- Corner Rosettes -->
      <g stroke="url(#goldGradient)" stroke-width="2" fill="#b48214">
        <!-- Top Left -->
        <circle cx="36" cy="36" r="6"/>
        <line x1="36" y1="36" x2="60" y2="36"/>
        <line x1="36" y1="36" x2="36" y2="60"/>
        
        <!-- Top Right -->
        <circle cx="964" cy="36" r="6"/>
        <line x1="964" y1="36" x2="940" y2="36"/>
        <line x1="964" y1="36" x2="964" y2="60"/>

        <!-- Bottom Left -->
        <circle cx="36" cy="664" r="6"/>
        <line x1="36" y1="664" x2="60" y2="664"/>
        <line x1="36" y1="664" x2="36" y2="640"/>

        <!-- Bottom Right -->
        <circle cx="964" cy="664" r="6"/>
        <line x1="964" y1="664" x2="940" y2="664"/>
        <line x1="964" y1="664" x2="964" y2="640"/>
      </g>

      <!-- Center Background Seal Watermark -->
      <g opacity="0.04" transform="translate(500, 350)">
        <circle cx="0" cy="0" r="180" fill="none" stroke="#0a2540" stroke-width="12"/>
        <circle cx="0" cy="0" r="140" fill="none" stroke="#0a2540" stroke-width="6"/>
        <text x="0" y="-30" font-size="36" font-weight="900" text-anchor="middle" fill="#0a2540">QUANTUM</text>
        <text x="0" y="20" font-size="32" font-weight="900" text-anchor="middle" fill="#0a2540">LEARNING</text>
        <text x="0" y="70" font-size="28" font-weight="900" text-anchor="middle" fill="#0a2540">INSTITUTE</text>
      </g>

      <!-- Institute Header -->
      <text x="500" y="90" font-size="28" font-weight="900" text-anchor="middle" fill="#0a2540" letter-spacing="2">
        QUANTUM LEARNING INSTITUTE
      </text>
      <text x="500" y="118" font-size="11.5" font-weight="700" text-anchor="middle" fill="#b48214" letter-spacing="1.5">
        CENTRE FOR COMPUTER STUDIES, VOCATIONAL &amp; PROFESSIONAL EXCELLENCE
      </text>
      <text x="500" y="140" font-size="11" text-anchor="middle" fill="#64748b">
        Ranabari Market, NH-15, Lakhimpur, Assam — 787031 &bull; Affiliated under Taxcent Connect Enterprise Registry
      </text>

      <!-- Horizontal Divider -->
      <line x1="140" y1="158" x2="860" y2="158" stroke="#cbd5e1" stroke-width="1.2"/>

      <!-- Certificate Type Banner -->
      <rect x="300" y="174" width="400" height="38" rx="8" fill="#f8fafc" stroke="url(#goldGradient)" stroke-width="1.5" filter="url(#shadow)"/>
      <text x="500" y="199" font-size="16" font-weight="800" text-anchor="middle" fill="#0a2540" letter-spacing="2">
        ${docTitle}
      </text>

      <!-- Preamble -->
      <text x="500" y="250" font-size="14" font-style="italic" text-anchor="middle" fill="#475569">
        This is to proudly certify that
      </text>

      <!-- Student Name -->
      <text x="500" y="298" font-size="30" font-weight="900" text-anchor="middle" fill="#0a2540" letter-spacing="1">
        ${escapeXml((doc.studentFullName || 'Student').toUpperCase())}
      </text>

      <!-- Student Registration ID -->
      <rect x="400" y="315" width="200" height="24" rx="12" fill="#f1f5f9"/>
      <text x="500" y="331" font-size="12" font-weight="700" text-anchor="middle" fill="#0284c7" font-family="monospace">
        Registration ID: ${escapeXml(doc.studentIdCode || '')}
      </text>

      <!-- Body Paragraph -->
      <text x="500" y="375" font-size="14" text-anchor="middle" fill="#475569">
        has successfully completed the prescribed academic curriculum, laboratory practicals and formal assessment for
      </text>

      <!-- Course Name -->
      <text x="500" y="420" font-size="22" font-weight="800" text-anchor="middle" fill="#0284c7">
        ${escapeXml(doc.courseName || 'Computer Application Program')}
      </text>

      <!-- Standing / Marks Badge -->
      ${standingBadge ? `
        <rect x="320" y="445" width="360" height="36" rx="8" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.2"/>
        <text x="500" y="468" font-size="13" font-weight="700" text-anchor="middle" fill="#0369a1">
          Awarded Standing: ${escapeXml(standingBadge)}
        </text>
      ` : ''}

      <!-- Bottom Authority & Signatures Section -->
      <!-- Left: Registration Metadata -->
      <g transform="translate(80, 545)">
        <text x="0" y="0" font-size="11" font-weight="700" fill="#64748b" letter-spacing="1">REGISTRATION NUMBER</text>
        <text x="0" y="24" font-size="16" font-weight="800" fill="#0a2540" font-family="monospace">${escapeXml(doc.certificateNumber)}</text>
        <text x="0" y="46" font-size="12" fill="#64748b">Issue Date: ${escapeXml(doc.issueDate)}</text>
        <rect x="0" y="58" width="130" height="20" rx="4" fill="#dcfce7"/>
        <text x="65" y="72" font-size="10" font-weight="800" text-anchor="middle" fill="#166534">OFFICIALLY ISSUED</text>
      </g>

      <!-- Center: Verified Seal & Verification URL -->
      <g transform="translate(500, 580)">
        <circle cx="0" cy="0" r="42" fill="#fffbeb" stroke="url(#goldGradient)" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="36" fill="none" stroke="#0a2540" stroke-width="1.2"/>
        <text x="0" y="-12" font-size="8.5" font-weight="900" text-anchor="middle" fill="#0a2540">QUANTUM LEARNING</text>
        <text x="0" y="2" font-size="8.5" font-weight="900" text-anchor="middle" fill="#0a2540">INSTITUTE</text>
        <text x="0" y="16" font-size="9" font-weight="800" text-anchor="middle" fill="#b48214">&starf; VERIFIED &starf;</text>
        <text x="0" y="58" font-size="10" text-anchor="middle" fill="#64748b">Verify credential authenticity online at:</text>
        <text x="0" y="73" font-size="10" font-weight="700" text-anchor="middle" fill="#0284c7" font-family="monospace">taxcent-connect.github.io/#verify</text>
      </g>

      <!-- Right: Authorized Signatures -->
      <g transform="translate(740, 545)">
        <!-- Signature line -->
        <line x1="0" y1="30" x2="180" y2="30" stroke="#0a2540" stroke-width="1.5"/>
        <text x="90" y="22" font-size="17" font-style="italic" font-family="'Brush Script MT', cursive, sans-serif" text-anchor="middle" fill="#0a2540">
          Debajit Saikia
        </text>
        <text x="90" y="48" font-size="13" font-weight="800" text-anchor="middle" fill="#0a2540">
          Prof. Debajit Saikia
        </text>
        <text x="90" y="65" font-size="11" font-weight="600" text-anchor="middle" fill="#64748b">
          Director / Centre Head
        </text>
        <text x="90" y="80" font-size="9.5" text-anchor="middle" fill="#94a3b8">
          Quantum Learning Institute
        </text>
      </g>

      <!-- Revocation Watermark if Revoked -->
      ${isRevoked ? `
        <g transform="translate(500, 360) rotate(-22)">
          <rect x="-240" y="-45" width="480" height="90" rx="14" fill="#fee2e2" fill-opacity="0.95" stroke="#ef4444" stroke-width="6" stroke-dasharray="14,6"/>
          <text x="0" y="12" font-size="44" font-weight="900" text-anchor="middle" fill="#dc2626" letter-spacing="6">
            REVOKED
          </text>
          <text x="0" y="34" font-size="12" font-weight="800" text-anchor="middle" fill="#b91c1c">
            INVALID FOR OFFICIAL OR ACADEMIC USE
          </text>
        </g>
      ` : ''}
    </svg>
  `;
}

/**
 * Standard institutional grade computation out of 100 marks
 */
export interface GradeCalculationResult {
  grade: string;
  division: string;
  badge: string;
  resultStatus: 'PASSED' | 'PASSED WITH DISTINCTION' | 'NEEDS IMPROVEMENT';
}

export function computeGradeFrom100(rawMarks: number): GradeCalculationResult {
  const marks = Math.max(0, Math.min(100, Math.round(Number(rawMarks) * 10) / 10));
  if (marks >= 85) {
    return {
      grade: 'A+',
      division: 'First Class with Distinction',
      badge: 'Grade A+ (Distinction)',
      resultStatus: 'PASSED WITH DISTINCTION',
    };
  } else if (marks >= 70) {
    return {
      grade: 'A',
      division: 'First Class',
      badge: 'Grade A (First Class)',
      resultStatus: 'PASSED',
    };
  } else if (marks >= 55) {
    return {
      grade: 'B',
      division: 'Second Class',
      badge: 'Grade B (Second Class)',
      resultStatus: 'PASSED',
    };
  } else if (marks >= 40) {
    return {
      grade: 'C',
      division: 'Pass Class',
      badge: 'Grade C (Pass Class)',
      resultStatus: 'PASSED',
    };
  } else {
    return {
      grade: 'F',
      division: 'Reappear / Failed',
      badge: 'Grade F (Needs Improvement)',
      resultStatus: 'NEEDS IMPROVEMENT',
    };
  }
}

/**
 * Generates an official, print-ready jsPDF Marksheet / Grade Card (A4 Portrait: 210mm x 297mm)
 */
export function generateOfficialMarksheetPdf(doc: AcademicDocument): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marksheetNo = doc.marksheetNumber || (doc.certificateNumber ? `${doc.certificateNumber}-M` : 'QLI-MRK');
  const marksObtained = typeof doc.marksObtained === 'number' ? doc.marksObtained : 85;
  const gradeInfo = computeGradeFrom100(marksObtained);

  // Background clean white
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Primary Deep Navy Border
  pdf.setDrawColor(10, 37, 64); // #0a2540
  pdf.setLineWidth(1.8);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner Ornate Gold Border
  pdf.setDrawColor(197, 155, 39); // #c59b27
  pdf.setLineWidth(0.6);
  pdf.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Corner decorative marks
  const corners = [
    { x: 11, y: 11, dx: 1, dy: 1 },
    { x: pageWidth - 11, y: 11, dx: -1, dy: 1 },
    { x: 11, y: pageHeight - 11, dx: 1, dy: -1 },
    { x: pageWidth - 11, y: pageHeight - 11, dx: -1, dy: -1 },
  ];
  pdf.setDrawColor(197, 155, 39);
  pdf.setLineWidth(1);
  corners.forEach(c => {
    pdf.line(c.x, c.y, c.x + c.dx * 6, c.y);
    pdf.line(c.x, c.y, c.x, c.y + c.dy * 6);
  });

  // Top Institute Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(10, 37, 64);
  pdf.text('QUANTUM LEARNING INSTITUTE', pageWidth / 2, 23, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(180, 130, 20); // Gold
  pdf.text('CENTRE FOR COMPUTER STUDIES, PROFESSIONAL & VOCATIONAL EXCELLENCE', pageWidth / 2, 28, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Ranabari Market, NH-15, Lakhimpur, Assam — 787031 | Affiliated under Taxcent Connect Enterprise Registry', pageWidth / 2, 32.5, { align: 'center' });

  // Divider
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.4);
  pdf.line(20, 35.5, pageWidth - 20, 35.5);

  // Document Title Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(197, 155, 39);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(pageWidth / 2 - 60, 39, 120, 8.5, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(10, 37, 64);
  pdf.text('STATEMENT OF MARKS / GRADE TRANSCRIPT', pageWidth / 2, 45, { align: 'center' });

  // Student & Examination Details Grid Card
  const metaY = 51;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(15, metaY, pageWidth - 30, 36, 2, 2, 'FD');

  // Left column
  const leftX = 20;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('STUDENT FULL NAME:', leftX, metaY + 7);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(10, 37, 64);
  pdf.text((doc.studentFullName || 'Student').toUpperCase(), leftX, metaY + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('STUDENT REGISTRATION ID:', leftX, metaY + 19);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(2, 132, 199);
  pdf.text(doc.studentIdCode || 'QLI-STU-2026', leftX, metaY + 23.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('COURSE PROGRAM:', leftX, metaY + 30);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.courseName || 'Diploma in Computer Application (DCA)', leftX, metaY + 34);

  // Right column
  const rightX = 120;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('MARKSHEET SERIAL NO:', rightX, metaY + 7);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(180, 130, 20); // Gold
  pdf.text(marksheetNo, rightX, metaY + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('CERTIFICATE NUMBER:', rightX, metaY + 19);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(10, 37, 64);
  pdf.text(doc.certificateNumber || 'QLI-CERT', rightX, metaY + 23.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('ISSUE DATE & SESSION:', rightX, metaY + 30);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${doc.issueDate}  |  ${doc.batchCode || 'Academic Session 2026'}`, rightX, metaY + 34);

  // Marks Breakdown Table
  const tableY = 92;
  const colW = [16, 84, 25, 25, 30]; // Index, Module, Max, Pass, Obtained

  // Table Header
  pdf.setFillColor(10, 37, 64); // Deep Navy
  pdf.rect(15, tableY, pageWidth - 30, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('SL', 18, tableY + 5.5);
  pdf.text('MODULE / EXAMINATION PAPER', 33, tableY + 5.5);
  pdf.text('MAX MARKS', 116, tableY + 5.5, { align: 'center' });
  pdf.text('MIN PASS', 141, tableY + 5.5, { align: 'center' });
  pdf.text('MARKS OBTAINED', 170, tableY + 5.5, { align: 'center' });

  // 5 Standard Modules distributing the 100 Total Marks
  const m1 = Math.round(marksObtained * 0.2);
  const m2 = Math.round(marksObtained * 0.2);
  const m3 = Math.round(marksObtained * 0.2);
  const m4 = Math.round(marksObtained * 0.2);
  const m5 = marksObtained - (m1 + m2 + m3 + m4);

  const modules = [
    { no: '01', title: 'Computer Fundamentals & Operating Systems (Windows & Linux)', max: 20, pass: 8, obtained: m1 },
    { no: '02', title: 'Office Productivity Suite (MS Word, Excel, PowerPoint, Ramdhenu)', max: 20, pass: 8, obtained: m2 },
    { no: '03', title: 'Database Concepts, Internet Services & Financial Accounting', max: 20, pass: 8, obtained: m3 },
    { no: '04', title: 'Specialized Course Applications & Practical Assignments', max: 20, pass: 8, obtained: m4 },
    { no: '05', title: 'Comprehensive Practical Lab Examination & Viva-Voce Assessment', max: 20, pass: 8, obtained: m5 },
  ];

  let currentY = tableY + 8;
  modules.forEach((mod, idx) => {
    const isAlt = idx % 2 === 1;
    pdf.setFillColor(isAlt ? 248 : 255, isAlt ? 250 : 255, isAlt ? 252 : 255);
    pdf.rect(15, currentY, pageWidth - 30, 9, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(15, currentY + 9, pageWidth - 15, currentY + 9);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(mod.no, 18, currentY + 6);
    pdf.text(mod.title, 33, currentY + 6);

    pdf.setFont('courier', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(mod.max.toString(), 116, currentY + 6, { align: 'center' });
    pdf.text(mod.pass.toString(), 141, currentY + 6, { align: 'center' });

    pdf.setFont('courier', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(mod.obtained >= mod.pass ? 16 : 220, mod.obtained >= mod.pass ? 101 : 38, mod.obtained >= mod.pass ? 52 : 38);
    pdf.text(mod.obtained.toString(), 170, currentY + 6, { align: 'center' });

    currentY += 9;
  });

  // Grand Total Row (100 Max Score)
  pdf.setFillColor(241, 245, 249);
  pdf.rect(15, currentY, pageWidth - 30, 10, 'F');
  pdf.setDrawColor(10, 37, 64);
  pdf.setLineWidth(0.4);
  pdf.line(15, currentY, pageWidth - 15, currentY);
  pdf.line(15, currentY + 10, pageWidth - 15, currentY + 10);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(10, 37, 64);
  pdf.text('GRAND TOTAL (AGGREGATE)', 33, currentY + 6.5);
  pdf.text('100', 116, currentY + 6.5, { align: 'center' });
  pdf.text('40', 141, currentY + 6.5, { align: 'center' });

  pdf.setFont('courier', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(2, 132, 199);
  pdf.text(`${marksObtained}`, 170, currentY + 7, { align: 'center' });

  // Summary Cards Section
  const summaryY = currentY + 15;
  const cardWidth = 43;
  const cardHeight = 22;

  // Card 1: Total Marks Obtained
  pdf.setFillColor(240, 249, 255);
  pdf.setDrawColor(186, 230, 253);
  pdf.roundedRect(15, summaryY, cardWidth, cardHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL OBTAINED', 15 + cardWidth / 2, summaryY + 6, { align: 'center' });
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(2, 132, 199);
  pdf.text(`${marksObtained} / 100`, 15 + cardWidth / 2, summaryY + 15, { align: 'center' });

  // Card 2: Percentage
  pdf.setFillColor(240, 253, 250);
  pdf.setDrawColor(153, 246, 228);
  pdf.roundedRect(61, summaryY, cardWidth, cardHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('PERCENTAGE', 61 + cardWidth / 2, summaryY + 6, { align: 'center' });
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(13, 148, 136);
  pdf.text(`${marksObtained}%`, 61 + cardWidth / 2, summaryY + 15, { align: 'center' });

  // Card 3: Awarded Grade
  pdf.setFillColor(254, 252, 232);
  pdf.setDrawColor(254, 240, 138);
  pdf.roundedRect(107, summaryY, cardWidth, cardHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('AWARDED GRADE', 107 + cardWidth / 2, summaryY + 6, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(180, 130, 20);
  pdf.text(gradeInfo.grade, 107 + cardWidth / 2, summaryY + 15, { align: 'center' });

  // Card 4: Result Classification
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(187, 247, 208);
  pdf.roundedRect(153, summaryY, cardWidth, cardHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('FINAL RESULT', 153 + cardWidth / 2, summaryY + 6, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(22, 101, 52);
  pdf.text(gradeInfo.resultStatus, 153 + cardWidth / 2, summaryY + 14.5, { align: 'center' });

  // Official Institutional Grading Scale Legend Table
  const legendY = summaryY + 28;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(15, legendY, pageWidth - 30, 24, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(10, 37, 64);
  pdf.text('INSTITUTIONAL GRADING CRITERIA (TOTAL: 100 MARKS):', 20, legendY + 5.5);

  const scaleItems = [
    { range: '85% — 100%', grade: 'Grade A+', desc: 'Distinction' },
    { range: '70% — 84%', grade: 'Grade A', desc: 'First Class' },
    { range: '55% — 69%', grade: 'Grade B', desc: 'Second Class' },
    { range: '40% — 54%', grade: 'Grade C', desc: 'Pass Class' },
    { range: 'Below 40%', grade: 'Grade F', desc: 'Needs Improvement' },
  ];

  scaleItems.forEach((sc, i) => {
    const itemX = 20 + i * 35;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(10, 37, 64);
    pdf.text(sc.range, itemX, legendY + 11);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(180, 130, 20);
    pdf.text(sc.grade, itemX, legendY + 16);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(sc.desc, itemX, legendY + 20);
  });

  // Footer & Official Signatures
  const footerY = pageHeight - 45;

  // Left: Verification & QR details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('REGISTRY VERIFICATION:', 18, footerY);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(2, 132, 199);
  pdf.text(`Marksheet ID: ${marksheetNo}`, 18, footerY + 5);
  pdf.text(`Certificate Ref: ${doc.certificateNumber}`, 18, footerY + 9);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Verify authenticity online at: taxcent-connect.github.io/#verify', 18, footerY + 14);

  // Center Seal
  const sealX = pageWidth / 2;
  pdf.setDrawColor(197, 155, 39);
  pdf.setLineWidth(0.8);
  pdf.circle(sealX, footerY + 6, 12, 'D');
  pdf.setDrawColor(10, 37, 64);
  pdf.setLineWidth(0.3);
  pdf.circle(sealX, footerY + 6, 10, 'D');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5);
  pdf.setTextColor(10, 37, 64);
  pdf.text('QUANTUM LEARNING', sealX, footerY + 3.5, { align: 'center' });
  pdf.text('INSTITUTE', sealX, footerY + 6.5, { align: 'center' });
  pdf.setFontSize(4.5);
  pdf.setTextColor(180, 130, 20);
  pdf.text('* VERIFIED *', sealX, footerY + 9.5, { align: 'center' });

  // Right: Authorized Signatures
  const sigRightX = pageWidth - 60;
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.6);
  pdf.line(sigRightX, footerY + 8, sigRightX + 42, footerY + 8);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(10, 37, 64);
  pdf.text('Debajit Saikia', sigRightX + 21, footerY + 5, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Prof. Debajit Saikia', sigRightX + 21, footerY + 12, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Controller of Examinations & Director', sigRightX + 21, footerY + 16, { align: 'center' });
  pdf.text('Quantum Learning Institute', sigRightX + 21, footerY + 19.5, { align: 'center' });

  return pdf;
}

/**
 * Direct PDF download trigger for Marksheet
 */
export function downloadMarksheetPdf(doc: AcademicDocument): void {
  const pdf = generateOfficialMarksheetPdf(doc);
  const cleanName = (doc.studentFullName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const marksheetNo = doc.marksheetNumber || (doc.certificateNumber ? `${doc.certificateNumber}-M` : 'QLI-MRK');
  const cleanMarkNo = marksheetNo.replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`QLI_Marksheet_${cleanName}_${cleanMarkNo}.pdf`);
}

/**
 * Generates an SVG representation of the official Marksheet
 */
export function generateOfficialMarksheetSvg(doc: AcademicDocument): string {
  const marksheetNo = doc.marksheetNumber || (doc.certificateNumber ? `${doc.certificateNumber}-M` : 'QLI-MRK');
  const marksObtained = typeof doc.marksObtained === 'number' ? doc.marksObtained : 85;
  const gradeInfo = computeGradeFrom100(marksObtained);

  const m1 = Math.round(marksObtained * 0.2);
  const m2 = Math.round(marksObtained * 0.2);
  const m3 = Math.round(marksObtained * 0.2);
  const m4 = Math.round(marksObtained * 0.2);
  const m5 = marksObtained - (m1 + m2 + m3 + m4);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 794 1123" width="100%" height="100%" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff;">
      <defs>
        <linearGradient id="markGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b48214"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#b48214"/>
        </linearGradient>
      </defs>

      <!-- Outer Border -->
      <rect x="24" y="24" width="746" height="1075" rx="8" fill="#ffffff" stroke="#0a2540" stroke-width="5"/>
      <rect x="36" y="36" width="722" height="1051" rx="4" fill="none" stroke="url(#markGold)" stroke-width="2"/>

      <!-- Header -->
      <text x="397" y="90" font-size="24" font-weight="900" text-anchor="middle" fill="#0a2540" letter-spacing="1.5">
        QUANTUM LEARNING INSTITUTE
      </text>
      <text x="397" y="115" font-size="11" font-weight="700" text-anchor="middle" fill="#b48214" letter-spacing="1">
        CENTRE FOR COMPUTER STUDIES, PROFESSIONAL &amp; VOCATIONAL EXCELLENCE
      </text>
      <text x="397" y="135" font-size="10" text-anchor="middle" fill="#64748b">
        Ranabari Market, NH-15, Lakhimpur, Assam — 787031 &bull; Affiliated under Taxcent Connect Enterprise Registry
      </text>
      <line x1="80" y1="150" x2="714" y2="150" stroke="#cbd5e1" stroke-width="1.2"/>

      <!-- Title Box -->
      <rect x="197" y="165" width="400" height="36" rx="8" fill="#f8fafc" stroke="url(#markGold)" stroke-width="1.5"/>
      <text x="397" y="189" font-size="14" font-weight="800" text-anchor="middle" fill="#0a2540" letter-spacing="1.5">
        STATEMENT OF MARKS / GRADE TRANSCRIPT
      </text>

      <!-- Student Info Grid Box -->
      <rect x="60" y="220" width="674" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
      
      <!-- Left Column -->
      <text x="80" y="250" font-size="10" font-weight="700" fill="#64748b">STUDENT FULL NAME:</text>
      <text x="80" y="272" font-size="15" font-weight="800" fill="#0a2540">${escapeXml((doc.studentFullName || 'Student').toUpperCase())}</text>
      
      <text x="80" y="298" font-size="10" font-weight="700" fill="#64748b">STUDENT ID: <tspan fill="#0284c7" font-family="monospace">${escapeXml(doc.studentIdCode || '')}</tspan></text>
      <text x="80" y="318" font-size="10" font-weight="700" fill="#64748b">COURSE: <tspan fill="#0a2540">${escapeXml(doc.courseName || '')}</tspan></text>

      <!-- Right Column -->
      <text x="440" y="250" font-size="10" font-weight="700" fill="#64748b">MARKSHEET SERIAL NO:</text>
      <text x="440" y="272" font-size="14" font-weight="800" fill="#b48214" font-family="monospace">${escapeXml(marksheetNo)}</text>
      
      <text x="440" y="298" font-size="10" font-weight="700" fill="#64748b">CERTIFICATE REF: <tspan fill="#0a2540" font-family="monospace">${escapeXml(doc.certificateNumber || '')}</tspan></text>
      <text x="440" y="318" font-size="10" font-weight="700" fill="#64748b">ISSUE DATE: <tspan fill="#0a2540">${escapeXml(doc.issueDate || '')}</tspan></text>

      <!-- Marks Table Header -->
      <rect x="60" y="350" width="674" height="34" fill="#0a2540" rx="6"/>
      <text x="80" y="372" font-size="11" font-weight="800" fill="#ffffff">SL</text>
      <text x="120" y="372" font-size="11" font-weight="800" fill="#ffffff">MODULE / EXAMINATION PAPER</text>
      <text x="480" y="372" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">MAX</text>
      <text x="560" y="372" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">PASS</text>
      <text x="660" y="372" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">OBTAINED</text>

      <!-- Module Rows -->
      <!-- Row 1 -->
      <rect x="60" y="384" width="674" height="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
      <text x="80" y="409" font-size="11" fill="#64748b">01</text>
      <text x="120" y="409" font-size="11" font-weight="600" fill="#1e293b">Computer Fundamentals &amp; Operating Systems (Windows &amp; Linux)</text>
      <text x="480" y="409" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#1e293b">20</text>
      <text x="560" y="409" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#64748b">08</text>
      <text x="660" y="409" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle" fill="#0284c7">${m1}</text>

      <!-- Row 2 -->
      <rect x="60" y="424" width="674" height="40" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="80" y="449" font-size="11" fill="#64748b">02</text>
      <text x="120" y="449" font-size="11" font-weight="600" fill="#1e293b">Office Productivity Suite (MS Word, Excel, PowerPoint, Ramdhenu)</text>
      <text x="480" y="449" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#1e293b">20</text>
      <text x="560" y="449" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#64748b">08</text>
      <text x="660" y="449" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle" fill="#0284c7">${m2}</text>

      <!-- Row 3 -->
      <rect x="60" y="464" width="674" height="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
      <text x="80" y="489" font-size="11" fill="#64748b">03</text>
      <text x="120" y="489" font-size="11" font-weight="600" fill="#1e293b">Database Concepts, Internet Services &amp; Financial Accounting</text>
      <text x="480" y="489" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#1e293b">20</text>
      <text x="560" y="489" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#64748b">08</text>
      <text x="660" y="489" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle" fill="#0284c7">${m3}</text>

      <!-- Row 4 -->
      <rect x="60" y="504" width="674" height="40" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="80" y="529" font-size="11" fill="#64748b">04</text>
      <text x="120" y="529" font-size="11" font-weight="600" fill="#1e293b">Specialized Course Applications &amp; Practical Assignments</text>
      <text x="480" y="529" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#1e293b">20</text>
      <text x="560" y="529" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#64748b">08</text>
      <text x="660" y="529" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle" fill="#0284c7">${m4}</text>

      <!-- Row 5 -->
      <rect x="60" y="544" width="674" height="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
      <text x="80" y="569" font-size="11" fill="#64748b">05</text>
      <text x="120" y="569" font-size="11" font-weight="600" fill="#1e293b">Comprehensive Practical Lab Examination &amp; Viva-Voce Assessment</text>
      <text x="480" y="569" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#1e293b">20</text>
      <text x="560" y="569" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle" fill="#64748b">08</text>
      <text x="660" y="569" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle" fill="#0284c7">${m5}</text>

      <!-- Grand Total Row -->
      <rect x="60" y="584" width="674" height="44" fill="#f1f5f9" stroke="#0a2540" stroke-width="1.5"/>
      <text x="120" y="612" font-size="13" font-weight="900" fill="#0a2540">GRAND TOTAL (AGGREGATE)</text>
      <text x="480" y="612" font-size="14" font-weight="900" font-family="monospace" text-anchor="middle" fill="#0a2540">100</text>
      <text x="560" y="612" font-size="14" font-weight="900" font-family="monospace" text-anchor="middle" fill="#64748b">40</text>
      <text x="660" y="612" font-size="16" font-weight="900" font-family="monospace" text-anchor="middle" fill="#0284c7">${marksObtained}</text>

      <!-- 4 Summary Metric Cards -->
      <!-- Card 1 -->
      <rect x="60" y="650" width="150" height="70" rx="8" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.2"/>
      <text x="135" y="674" font-size="10" font-weight="700" fill="#64748b" text-anchor="middle">TOTAL OBTAINED</text>
      <text x="135" y="704" font-size="20" font-weight="900" font-family="monospace" fill="#0284c7" text-anchor="middle">${marksObtained} / 100</text>

      <!-- Card 2 -->
      <rect x="234" y="650" width="150" height="70" rx="8" fill="#f0fdfa" stroke="#99f6e8" stroke-width="1.2"/>
      <text x="309" y="674" font-size="10" font-weight="700" fill="#64748b" text-anchor="middle">PERCENTAGE</text>
      <text x="309" y="704" font-size="20" font-weight="900" font-family="monospace" fill="#0d9488" text-anchor="middle">${marksObtained}%</text>

      <!-- Card 3 -->
      <rect x="408" y="650" width="150" height="70" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1.2"/>
      <text x="483" y="674" font-size="10" font-weight="700" fill="#64748b" text-anchor="middle">AWARDED GRADE</text>
      <text x="483" y="704" font-size="20" font-weight="900" fill="#b48214" text-anchor="middle">${gradeInfo.grade}</text>

      <!-- Card 4 -->
      <rect x="584" y="650" width="150" height="70" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.2"/>
      <text x="659" y="674" font-size="10" font-weight="700" fill="#64748b" text-anchor="middle">FINAL RESULT</text>
      <text x="659" y="702" font-size="12" font-weight="900" fill="#166534" text-anchor="middle">${gradeInfo.resultStatus}</text>

      <!-- Grading Legend -->
      <rect x="60" y="740" width="674" height="80" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2"/>
      <text x="80" y="762" font-size="10" font-weight="800" fill="#0a2540">INSTITUTIONAL GRADING CRITERIA (TOTAL 100 MARKS):</text>
      <text x="80" y="785" font-size="11" font-weight="700" fill="#0a2540">85% - 100%: <tspan fill="#b48214">Grade A+ (Distinction)</tspan></text>
      <text x="290" y="785" font-size="11" font-weight="700" fill="#0a2540">70% - 84%: <tspan fill="#0284c7">Grade A (First Class)</tspan></text>
      <text x="500" y="785" font-size="11" font-weight="700" fill="#0a2540">55% - 69%: <tspan fill="#0d9488">Grade B (Second Class)</tspan></text>
      <text x="80" y="807" font-size="11" font-weight="700" fill="#0a2540">40% - 54%: <tspan fill="#d97706">Grade C (Pass Class)</tspan></text>
      <text x="290" y="807" font-size="11" font-weight="700" fill="#0a2540">Below 40%: <tspan fill="#dc2626">Grade F (Needs Improvement / Reappear)</tspan></text>

      <!-- Bottom Authority & Signatures Section -->
      <g transform="translate(60, 920)">
        <text x="0" y="0" font-size="10" font-weight="700" fill="#64748b">REGISTRY VERIFICATION</text>
        <text x="0" y="20" font-size="13" font-weight="800" font-family="monospace" fill="#0a2540">Marksheet ID: ${escapeXml(marksheetNo)}</text>
        <text x="0" y="38" font-size="11" font-weight="700" font-family="monospace" fill="#0284c7">Certificate Ref: ${escapeXml(doc.certificateNumber)}</text>
        <text x="0" y="56" font-size="10" fill="#64748b">Verify authenticity online at: taxcent-connect.github.io/#verify</text>
      </g>

      <!-- Center Seal -->
      <g transform="translate(397, 950)">
        <circle cx="0" cy="0" r="42" fill="#fffbeb" stroke="url(#markGold)" stroke-width="2"/>
        <circle cx="0" cy="0" r="35" fill="none" stroke="#0a2540" stroke-width="1"/>
        <text x="0" y="-10" font-size="8.5" font-weight="900" text-anchor="middle" fill="#0a2540">QUANTUM LEARNING</text>
        <text x="0" y="4" font-size="8.5" font-weight="900" text-anchor="middle" fill="#0a2540">INSTITUTE</text>
        <text x="0" y="18" font-size="9" font-weight="800" text-anchor="middle" fill="#b48214">&starf; VERIFIED &starf;</text>
      </g>

      <!-- Right Signature -->
      <g transform="translate(560, 930)">
        <line x1="0" y1="30" x2="160" y2="30" stroke="#0a2540" stroke-width="1.5"/>
        <text x="80" y="22" font-size="17" font-style="italic" font-family="'Brush Script MT', cursive, sans-serif" text-anchor="middle" fill="#0a2540">
          Debajit Saikia
        </text>
        <text x="80" y="48" font-size="13" font-weight="800" text-anchor="middle" fill="#0a2540">
          Prof. Debajit Saikia
        </text>
        <text x="80" y="65" font-size="11" font-weight="600" text-anchor="middle" fill="#64748b">
          Controller of Examinations &amp; Director
        </text>
        <text x="80" y="80" font-size="9.5" text-anchor="middle" fill="#94a3b8">
          Quantum Learning Institute
        </text>
      </g>
    </svg>
  `;
}

/**
 * Triggers a browser print dialog formatted for A4 Portrait Marksheet
 */
export function printMarksheet(doc: AcademicDocument): void {
  const svg = generateOfficialMarksheetSvg(doc);
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    alert('Please allow popups to open the print dialog.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Marksheet - ${escapeXml(doc.marksheetNumber || doc.certificateNumber)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .marksheet-container {
            width: 100vw;
            height: 100vh;
            max-width: 210mm;
            max-height: 297mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="marksheet-container">
          ${svg}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
