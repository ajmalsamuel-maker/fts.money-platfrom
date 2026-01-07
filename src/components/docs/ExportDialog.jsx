import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    const parseMarkdownToSections = (markdown) => {
        const lines = markdown.split('\n');
        const sections = [];
        let currentSection = null;

        lines.forEach((line) => {
            if (line.startsWith('# ')) {
                currentSection = { level: 1, title: line.substring(2), content: [] };
                sections.push(currentSection);
            } else if (line.startsWith('## ')) {
                currentSection = { level: 2, title: line.substring(3), content: [] };
                sections.push(currentSection);
            } else if (line.startsWith('### ')) {
                currentSection = { level: 3, title: line.substring(4), content: [] };
                sections.push(currentSection);
            } else if (currentSection && line.trim()) {
                currentSection.content.push(line);
            }
        });

        return sections;
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

        // Parse sections
        const sections = parseMarkdownToSections(documentContent);

        sections.forEach((section, index) => {
            // Check if we need a new page
            if (yPos > pageHeight - margin.bottom - 20) {
                doc.addPage();
                yPos = margin.top;
            }

            // Section heading
            if (section.level === 1) {
                doc.setFontSize(fontSizes[fontSize].h1);
            } else if (section.level === 2) {
                doc.setFontSize(fontSizes[fontSize].h2);
            } else {
                doc.setFontSize(fontSizes[fontSize].h3);
            }
            doc.setFont(undefined, 'bold');
            
            const titleLines = doc.splitTextToSize(section.title, contentWidth);
            titleLines.forEach(line => {
                doc.text(line, margin.left, yPos);
                yPos += section.level === 1 ? 8 : section.level === 2 ? 6 : 5;
            });

            yPos += 3;

            // Section content
            doc.setFontSize(fontSizes[fontSize].body);
            doc.setFont(undefined, 'normal');
            
            section.content.forEach(paragraph => {
                if (yPos > pageHeight - margin.bottom - 10) {
                    doc.addPage();
                    yPos = margin.top;
                }

                const lines = doc.splitTextToSize(paragraph, contentWidth);
                lines.forEach(line => {
                    doc.text(line, margin.left, yPos);
                    yPos += 5;
                });
                yPos += 2;
            });

            yPos += 5;
        });

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
        const sections = parseMarkdownToSections(documentContent);
        const docSections = [];

        // Title
        docSections.push(
            new Paragraph({
                text: documentTitle,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // Content sections
        sections.forEach((section) => {
            // Heading
            const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 :
                               section.level === 2 ? HeadingLevel.HEADING_2 :
                               HeadingLevel.HEADING_3;

            docSections.push(
                new Paragraph({
                    text: section.title,
                    heading: headingLevel,
                    spacing: { before: 240, after: 120 }
                })
            );

            // Content paragraphs
            section.content.forEach(text => {
                if (text.trim()) {
                    docSections.push(
                        new Paragraph({
                            children: [new TextRun(text)],
                            spacing: { after: 120 }
                        })
                    );
                }
            });
        });

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: marginSizes[margins].top * 56.7, // Convert mm to twips
                            right: marginSizes[margins].right * 56.7,
                            bottom: marginSizes[margins].bottom * 56.7,
                            left: marginSizes[margins].left * 56.7
                        },
                        size: {
                            orientation: orientation === 'portrait' ? 'portrait' : 'landscape'
                        }
                    }
                },
                children: docSections
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