import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import mermaid from 'mermaid';

export default function ExportDialog({ open, onOpenChange, documentTitle, documentContent }) {
    const [format, setFormat] = useState('pdf');
    const [fontSize, setFontSize] = useState('medium');
    const [pageSize, setPageSize] = useState('a4');
    const [orientation, setOrientation] = useState('portrait');
    const [margins, setMargins] = useState('normal');
    const [includeTOC, setIncludeTOC] = useState(true);
    const [includePageNumbers, setIncludePageNumbers] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const fontSizes = {
        small: { body: 9, h1: 16, h2: 13, h3: 11 },
        medium: { body: 11, h1: 20, h2: 16, h3: 13 },
        large: { body: 13, h1: 24, h2: 19, h3: 15 }
    };

    const marginSizes = {
        narrow: { top: 10, right: 10, bottom: 10, left: 10 },
        normal: { top: 20, right: 20, bottom: 20, left: 20 },
        wide: { top: 30, right: 30, bottom: 30, left: 30 }
    };

    const parseMarkdownToElements = (markdown) => {
        const lines = markdown.split('\n');
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // Headings
            if (line.startsWith('# ')) {
                elements.push({ type: 'heading', level: 1, text: line.substring(2) });
                i++;
            } else if (line.startsWith('## ')) {
                elements.push({ type: 'heading', level: 2, text: line.substring(3) });
                i++;
            } else if (line.startsWith('### ')) {
                elements.push({ type: 'heading', level: 3, text: line.substring(4) });
                i++;
            } else if (line.startsWith('#### ')) {
                elements.push({ type: 'heading', level: 4, text: line.substring(5) });
                i++;
            }
            // Code blocks (including Mermaid)
            else if (line.startsWith('```')) {
                const language = line.substring(3).trim();
                const codeLines = [];
                i++;
                while (i < lines.length && !lines[i].startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                elements.push({ 
                    type: language === 'mermaid' ? 'mermaid' : 'code', 
                    language,
                    content: codeLines.join('\n') 
                });
                i++; // Skip closing ```
            }
            // Tables
            else if (line.includes('|') && line.trim().startsWith('|')) {
                const tableLines = [];
                while (i < lines.length && lines[i].includes('|')) {
                    tableLines.push(lines[i]);
                    i++;
                }
                elements.push({ type: 'table', rows: parseTable(tableLines) });
            }
            // Lists
            else if (line.match(/^[\s]*[-*+]\s/)) {
                const listItems = [];
                while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s/)) {
                    listItems.push(lines[i].replace(/^[\s]*[-*+]\s/, '').trim());
                    i++;
                }
                elements.push({ type: 'list', items: listItems });
            }
            // Paragraphs
            else if (line.trim()) {
                elements.push({ type: 'paragraph', text: line.trim() });
                i++;
            } else {
                i++;
            }
        }

        return elements;
    };

    const parseTable = (tableLines) => {
        return tableLines
            .filter(line => !line.match(/^[\s]*\|[\s-:]+\|/)) // Skip separator line
            .map(line => 
                line.split('|')
                    .map(cell => cell.trim())
                    .filter(cell => cell)
            );
    };

    const renderMermaidToImage = async (mermaidCode) => {
        try {
            const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
            const { svg } = await mermaid.render(id, mermaidCode);
            
            // Convert SVG to image at normal resolution
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    resolve({
                        dataUrl: canvas.toDataURL('image/png'),
                        width: img.width,
                        height: img.height
                    });
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
            });
        } catch (error) {
            console.error('Mermaid render error:', error);
            return null;
        }
    };

    const parseTextFormatting = (text) => {
        // Parse **bold** and *italic* formatting
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold markers but keep text
            .replace(/\*(.+?)\*/g, '$1');     // Remove italic markers but keep text
    };

    const exportToPDF = async () => {
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageSize
        });

        const margin = marginSizes[margins];
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin.left - margin.right;
        
        let yPos = margin.top;

        // Add logo
        const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/80c34e6d5_FTSMoney-primary-logo-RGB.png';
        try {
            doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 30, yPos, 60, 15);
            yPos += 25;
        } catch (e) {
            console.log('Logo not loaded');
        }

        // Title
        doc.setFontSize(fontSizes[fontSize].h1);
        doc.setFont(undefined, 'bold');
        doc.text(documentTitle, margin.left, yPos);
        yPos += 15;

        // Parse elements
        const elements = parseMarkdownToElements(documentContent);

        for (const element of elements) {
            // Check if we need a new page
            if (yPos > pageHeight - margin.bottom - 30) {
                doc.addPage();
                yPos = margin.top;
            }

            if (element.type === 'heading') {
                const size = element.level === 1 ? fontSizes[fontSize].h1 :
                            element.level === 2 ? fontSizes[fontSize].h2 :
                            element.level === 3 ? fontSizes[fontSize].h3 : fontSizes[fontSize].body;
                doc.setFontSize(size);
                doc.setFont(undefined, 'bold');
                const cleanText = parseTextFormatting(element.text);
                const lines = doc.splitTextToSize(cleanText, contentWidth);
                lines.forEach(line => {
                    doc.text(line, margin.left, yPos);
                    yPos += element.level === 1 ? 8 : element.level === 2 ? 6 : 5;
                });
                yPos += 3;
            }
            else if (element.type === 'paragraph') {
                doc.setFontSize(fontSizes[fontSize].body);
                
                // Handle bold/italic formatting
                const text = element.text;
                const boldPattern = /\*\*(.+?)\*\*/g;
                const italicPattern = /\*(.+?)\*/g;
                
                if (boldPattern.test(text) || italicPattern.test(text)) {
                    // Split text by formatting
                    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
                    let xPos = margin.left;
                    
                    parts.forEach(part => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            doc.setFont(undefined, 'bold');
                            doc.text(part.slice(2, -2), xPos, yPos);
                            xPos += doc.getTextWidth(part.slice(2, -2));
                        } else if (part.startsWith('*') && part.endsWith('*')) {
                            doc.setFont(undefined, 'italic');
                            doc.text(part.slice(1, -1), xPos, yPos);
                            xPos += doc.getTextWidth(part.slice(1, -1));
                        } else if (part.trim()) {
                            doc.setFont(undefined, 'normal');
                            const lines = doc.splitTextToSize(part, contentWidth - (xPos - margin.left));
                            doc.text(lines[0] || part, xPos, yPos);
                            if (lines.length > 1) {
                                yPos += 5;
                                xPos = margin.left;
                                for (let i = 1; i < lines.length; i++) {
                                    doc.text(lines[i], xPos, yPos);
                                    yPos += 5;
                                }
                                return;
                            }
                            xPos += doc.getTextWidth(lines[0] || part);
                        }
                    });
                    yPos += 5;
                } else {
                    doc.setFont(undefined, 'normal');
                    const lines = doc.splitTextToSize(text, contentWidth);
                    lines.forEach(line => {
                        doc.text(line, margin.left, yPos);
                        yPos += 5;
                    });
                }
                yPos += 2;
            }
            else if (element.type === 'list') {
                doc.setFontSize(fontSizes[fontSize].body);
                doc.setFont(undefined, 'normal');
                element.items.forEach(item => {
                    const lines = doc.splitTextToSize('• ' + item, contentWidth - 5);
                    lines.forEach((line, idx) => {
                        doc.text(line, margin.left + (idx > 0 ? 5 : 0), yPos);
                        yPos += 5;
                    });
                });
                yPos += 2;
            }
            else if (element.type === 'table' && element.rows.length > 0) {
                // Clean markdown from table cells
                const cleanedRows = element.rows.map(row => 
                    row.map(cell => parseTextFormatting(cell))
                );
                
                doc.autoTable({
                    startY: yPos,
                    head: [cleanedRows[0]],
                    body: cleanedRows.slice(1),
                    margin: { left: margin.left, right: margin.right },
                    styles: { fontSize: fontSizes[fontSize].body - 1, cellPadding: 2 },
                    headStyles: { fillColor: [71, 85, 105], fontStyle: 'bold' },
                    theme: 'grid'
                });
                yPos = doc.lastAutoTable.finalY + 5;
            }
            else if (element.type === 'mermaid') {
                const imgData = await renderMermaidToImage(element.content);
                if (imgData) {
                    // Calculate dimensions (convert pixels to mm, 1px = 0.264583mm)
                    let imgWidth = imgData.width * 0.264583;
                    let imgHeight = imgData.height * 0.264583;
                    
                    // Scale to fit width with 85% of content width
                    const targetWidth = contentWidth * 0.85;
                    if (imgWidth > targetWidth) {
                        const scale = targetWidth / imgWidth;
                        imgWidth = targetWidth;
                        imgHeight = imgHeight * scale;
                    }
                    
                    // Check if new page needed
                    const remainingHeight = pageHeight - yPos - margin.bottom;
                    if (imgHeight > remainingHeight - 20) {
                        doc.addPage();
                        yPos = margin.top;
                    }
                    
                    // If still too tall, scale to fit page
                    const maxHeight = (pageHeight - margin.top - margin.bottom) * 0.65;
                    if (imgHeight > maxHeight) {
                        const scale = maxHeight / imgHeight;
                        imgHeight = maxHeight;
                        imgWidth = imgWidth * scale;
                    }
                    
                    // Center the diagram
                    const xPos = margin.left + (contentWidth - imgWidth) / 2;
                    doc.addImage(imgData.dataUrl, 'PNG', xPos, yPos, imgWidth, imgHeight);
                    yPos += imgHeight + 10;
                }
            }
            else if (element.type === 'code') {
                doc.setFontSize(fontSizes[fontSize].body - 2);
                doc.setFont('courier', 'normal');
                const lines = element.content.split('\n');
                lines.forEach(line => {
                    if (yPos > pageHeight - margin.bottom - 10) {
                        doc.addPage();
                        yPos = margin.top;
                    }
                    doc.text(line, margin.left, yPos);
                    yPos += 4;
                });
                doc.setFont(undefined, 'normal');
                yPos += 3;
            }
        }

        // Page numbers
        if (includePageNumbers) {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        }

        doc.save(`${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    };

    const exportToWord = async () => {
        const elements = parseMarkdownToElements(documentContent);
        const docElements = [];

        // Title
        docElements.push(
            new Paragraph({
                text: documentTitle,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // Content elements
        for (const element of elements) {
            if (element.type === 'heading') {
                const headingLevel = element.level === 1 ? HeadingLevel.HEADING_1 :
                                   element.level === 2 ? HeadingLevel.HEADING_2 :
                                   element.level === 3 ? HeadingLevel.HEADING_3 :
                                   HeadingLevel.HEADING_4;
                
                const cleanText = parseTextFormatting(element.text);
                docElements.push(
                    new Paragraph({
                        text: cleanText,
                        heading: headingLevel,
                        spacing: { before: 240, after: 120 }
                    })
                );
            }
            else if (element.type === 'paragraph') {
                // Parse bold and italic formatting
                const text = element.text;
                const parts = [];
                const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
                let lastIndex = 0;
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    // Add text before match
                    if (match.index > lastIndex) {
                        parts.push(new TextRun(text.substring(lastIndex, match.index)));
                    }
                    
                    // Add formatted text
                    const matchedText = match[0];
                    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
                        parts.push(new TextRun({ text: matchedText.slice(2, -2), bold: true }));
                    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
                        parts.push(new TextRun({ text: matchedText.slice(1, -1), italics: true }));
                    }
                    
                    lastIndex = regex.lastIndex;
                }
                
                // Add remaining text
                if (lastIndex < text.length) {
                    parts.push(new TextRun(text.substring(lastIndex)));
                }
                
                docElements.push(
                    new Paragraph({
                        children: parts.length > 0 ? parts : [new TextRun(text)],
                        spacing: { after: 120 }
                    })
                );
            }
            else if (element.type === 'list') {
                element.items.forEach(item => {
                    docElements.push(
                        new Paragraph({
                            text: item,
                            bullet: { level: 0 },
                            spacing: { after: 60 }
                        })
                    );
                });
            }
            else if (element.type === 'table' && element.rows.length > 0) {
                const tableRows = element.rows.map((row, rowIndex) => 
                    new TableRow({
                        children: row.map(cell => {
                            // Parse formatting in table cells
                            const parts = [];
                            const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
                            let lastIndex = 0;
                            let match;
                            
                            while ((match = regex.exec(cell)) !== null) {
                                if (match.index > lastIndex) {
                                    parts.push(new TextRun(cell.substring(lastIndex, match.index)));
                                }
                                
                                const matchedText = match[0];
                                if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
                                    parts.push(new TextRun({ text: matchedText.slice(2, -2), bold: true }));
                                } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
                                    parts.push(new TextRun({ text: matchedText.slice(1, -1), italics: true }));
                                }
                                
                                lastIndex = regex.lastIndex;
                            }
                            
                            if (lastIndex < cell.length) {
                                parts.push(new TextRun(cell.substring(lastIndex)));
                            }
                            
                            return new TableCell({
                                children: [new Paragraph({ children: parts.length > 0 ? parts : [new TextRun(cell)] })],
                                shading: rowIndex === 0 ? { fill: "CCCCCC" } : undefined,
                                width: { size: 100 / row.length, type: WidthType.PERCENTAGE }
                            });
                        })
                    })
                );
                
                docElements.push(
                    new Table({
                        rows: tableRows,
                        width: { size: 100, type: WidthType.PERCENTAGE }
                    })
                );
                
                docElements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
            }
            else if (element.type === 'mermaid') {
                const imgData = await renderMermaidToImage(element.content);
                if (imgData) {
                    // Convert data URL to buffer
                    const base64Data = imgData.dataUrl.split(',')[1];
                    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                    
                    // Target 80% of page width (approx 480px for standard Word page)
                    let width = imgData.width * 0.8;
                    let height = imgData.height * 0.8;
                    
                    const maxWidth = 480;
                    const maxHeight = 550;
                    
                    // Scale to fit width
                    if (width > maxWidth) {
                        const scale = maxWidth / width;
                        width = maxWidth;
                        height = height * scale;
                    }
                    
                    // Scale to fit height
                    if (height > maxHeight) {
                        const scale = maxHeight / height;
                        height = maxHeight;
                        width = width * scale;
                    }
                    
                    docElements.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: buffer,
                                    transformation: {
                                        width: Math.round(width),
                                        height: Math.round(height)
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200, after: 200 }
                        })
                    );
                }
            }
            else if (element.type === 'code') {
                element.content.split('\n').forEach(line => {
                    docElements.push(
                        new Paragraph({
                            children: [new TextRun({ text: line, font: 'Courier New', size: 18 })],
                            spacing: { after: 40 }
                        })
                    );
                });
            }
        }

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: marginSizes[margins].top * 56.7,
                            right: marginSizes[margins].right * 56.7,
                            bottom: marginSizes[margins].bottom * 56.7,
                            left: marginSizes[margins].left * 56.7
                        },
                        size: {
                            orientation: orientation === 'portrait' ? 'portrait' : 'landscape'
                        }
                    }
                },
                children: docElements
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${documentTitle.replace(/\s+/g, '-').toLowerCase()}.docx`);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            if (format === 'pdf') {
                await exportToPDF();
            } else {
                await exportToWord();
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Export Document
                    </DialogTitle>
                    <DialogDescription>
                        Configure export settings for {documentTitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format Selection */}
                    <div className="space-y-2">
                        <Label>Export Format</Label>
                        <RadioGroup value={format} onValueChange={setFormat}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pdf" id="pdf" />
                                <Label htmlFor="pdf" className="font-normal cursor-pointer">
                                    PDF Document (.pdf)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="docx" id="docx" />
                                <Label htmlFor="docx" className="font-normal cursor-pointer">
                                    Word Document (.docx)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Select value={fontSize} onValueChange={setFontSize}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small (9pt body)</SelectItem>
                                <SelectItem value="medium">Medium (11pt body)</SelectItem>
                                <SelectItem value="large">Large (13pt body)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page Size */}
                    <div className="space-y-2">
                        <Label>Page Size</Label>
                        <Select value={pageSize} onValueChange={setPageSize}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                                <SelectItem value="letter">Letter (216 × 279 mm)</SelectItem>
                                <SelectItem value="legal">Legal (216 × 356 mm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Orientation */}
                    <div className="space-y-2">
                        <Label>Orientation</Label>
                        <RadioGroup value={orientation} onValueChange={setOrientation}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="portrait" id="portrait" />
                                <Label htmlFor="portrait" className="font-normal cursor-pointer">
                                    Portrait
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="landscape" id="landscape" />
                                <Label htmlFor="landscape" className="font-normal cursor-pointer">
                                    Landscape
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Margins */}
                    <div className="space-y-2">
                        <Label>Margins</Label>
                        <Select value={margins} onValueChange={setMargins}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="narrow">Narrow (10mm)</SelectItem>
                                <SelectItem value="normal">Normal (20mm)</SelectItem>
                                <SelectItem value="wide">Wide (30mm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                        <Label>Additional Options</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="pageNumbers" 
                                checked={includePageNumbers}
                                onCheckedChange={setIncludePageNumbers}
                            />
                            <Label htmlFor="pageNumbers" className="font-normal cursor-pointer">
                                Include page numbers
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="gap-2"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export {format.toUpperCase()}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}