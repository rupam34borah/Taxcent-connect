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
