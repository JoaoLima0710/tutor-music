import { jsPDF } from 'jspdf';
import type { Song } from '@/data/songs';

export class PdfExportService {
  static async exportChordSheet(song: Song): Promise<void> {
    try {
      console.log('📄 Generating PDF for:', song.title);

      // Create PDF document (A4 size)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Header - Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(song.title, margin, yPosition);
      yPosition += 10;

      // Artist
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(song.artist, margin, yPosition);
      yPosition += 12;

      // Divider line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Song Info
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      
      const infoText = `Gênero: ${song.genre}  |  Dificuldade: ${this.getDifficultyLabel(song.difficulty)}  |  Tom: ${song.key}  |  BPM: ${song.bpm}`;
      pdf.text(infoText, margin, yPosition);
      yPosition += 10;

      // Chords Used
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Acordes Usados:', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('courier', 'bold');
      const chordsText = song.chords.join('  •  ');
      const chordsLines = pdf.splitTextToSize(chordsText, contentWidth);
      pdf.text(chordsLines, margin, yPosition);
      yPosition += chordsLines.length * 5 + 8;

      // Divider line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Chord Sheet
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Cifra Completa:', margin, yPosition);
      yPosition += 8;

      // Parse and render chord sheet
      const lines = song.chordSheet.split('\n');
      
      for (const line of lines) {
        checkNewPage(10);

        if (line.trim() === '') {
          yPosition += 4;
          continue;
        }

        // Section markers [Intro], [Verso 1], etc.
        if (line.startsWith('[') && line.endsWith(']')) {
          yPosition += 4;
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(100, 180, 220);
          pdf.roundedRect(margin, yPosition - 4, contentWidth, 7, 2, 2, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text(line.replace(/[\[\]]/g, ''), margin + 2, yPosition);
          yPosition += 8;
          continue;
        }

        // Lines with chords and lyrics
        if (line.includes('[') && line.includes(']')) {
          // Parse chords and lyrics
          const parts = line.split(/(\[[^\]]+\])/g);
          let xPosition = margin;
          
          pdf.setFontSize(10);
          
          for (const part of parts) {
            if (part.match(/\[[^\]]+\]/)) {
              // Chord
              const chord = part.replace(/[\[\]]/g, '');
              pdf.setFont('courier', 'bold');
              pdf.setTextColor(0, 120, 180);
              pdf.text(chord, xPosition, yPosition);
              xPosition += pdf.getTextWidth(chord) + 2;
            } else if (part.trim()) {
              // Lyrics
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(0, 0, 0);
              pdf.text(part, xPosition, yPosition);
              xPosition += pdf.getTextWidth(part);
            }
          }
          
          yPosition += 6;
        } else {
          // Regular text line
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          const textLines = pdf.splitTextToSize(line, contentWidth);
          pdf.text(textLines, margin, yPosition);
          yPosition += textLines.length * 6;
        }
      }

      // Tips section
      if (song.tips && song.tips.length > 0) {
        checkNewPage(40);
        yPosition += 10;
        
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('💡 Dicas de Execução:', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        song.tips.forEach((tip, index) => {
          checkNewPage(10);
          const tipText = `${index + 1}. ${tip}`;
          const tipLines = pdf.splitTextToSize(tipText, contentWidth - 5);
          pdf.text(tipLines, margin + 5, yPosition);
          yPosition += tipLines.length * 5 + 3;
        });
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `MusicTutor - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `${song.title.replace(/[^a-z0-9]/gi, '_')}_cifra.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generated successfully:', fileName);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    }
  }

  private static getDifficultyLabel(difficulty: string): string {
    const labels: Record<string, string> = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    };
    return labels[difficulty] || difficulty;
  }
}
