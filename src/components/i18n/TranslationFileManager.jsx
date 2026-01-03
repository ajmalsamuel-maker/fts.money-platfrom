/**
 * Translation File Manager
 * Import/export translation files in JSON or CSV format
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileJson, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES, TRANSLATION_NAMESPACES } from './GlobalLanguageStandard';

export default function TranslationFileManager({ onImportSuccess }) {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedNamespace, setSelectedNamespace] = useState('common');
    const [selectedFormat, setSelectedFormat] = useState('json');
    const [importing, setImporting] = useState(false);

    const handleExport = (format) => {
        // Mock translation data - would fetch from database
        const translations = {
            common: {
                welcome: "Welcome",
                logout: "Logout",
                save: "Save",
                cancel: "Cancel"
            },
            platform: {
                dashboard: "Dashboard",
                settings: "Settings"
            }
        };

        const data = translations[selectedNamespace] || {};
        
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedLanguage}_${selectedNamespace}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csv = Object.entries(data).map(([key, value]) => `"${key}","${value}"`).join('\n');
            const csvContent = `"Key","Translation"\n${csv}`;
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedLanguage}_${selectedNamespace}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        toast.success(`Exported ${selectedLanguage} translations for ${selectedNamespace}`);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let translations = {};

                if (file.name.endsWith('.json')) {
                    translations = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    const lines = content.split('\n').slice(1); // Skip header
                    translations = {};
                    lines.forEach(line => {
                        const match = line.match(/"([^"]+)","([^"]+)"/);
                        if (match) {
                            translations[match[1]] = match[2];
                        }
                    });
                }

                // Would save to database here
                console.log('Imported translations:', translations);
                toast.success(`Imported ${Object.keys(translations).length} translations`);
                onImportSuccess?.(selectedLanguage, selectedNamespace, translations);
            } catch (error) {
                toast.error(`Import failed: ${error.message}`);
            } finally {
                setImporting(false);
            }
        };

        reader.readAsText(file);
    };

    const handleExportAll = () => {
        // Export all languages and namespaces as a ZIP file
        toast.info('Exporting all translations... (would create ZIP file)');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Translation File Manager
                </CardTitle>
                <CardDescription>Import and export translation files for localization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Selection Controls */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_LANGUAGES.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        <div className="flex items-center gap-2">
                                            <span>{lang.flag}</span>
                                            <span>{lang.nativeName}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Namespace</Label>
                        <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TRANSLATION_NAMESPACES).map(([key, value]) => (
                                    <SelectItem key={value} value={value}>
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Format</Label>
                        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="json">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="h-4 w-4" />
                                        <span>JSON</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="csv">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-4 w-4" />
                                        <span>CSV</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Export Actions */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Export Translations</h3>
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => handleExport(selectedFormat)}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export Selected
                        </Button>
                        <Button 
                            onClick={handleExportAll}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export All (ZIP)
                        </Button>
                    </div>
                </div>

                {/* Import Actions */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Import Translations</h3>
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => document.getElementById('translation-import').click()}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={importing}
                        >
                            <Upload className="h-4 w-4" />
                            {importing ? 'Importing...' : 'Import File'}
                        </Button>
                        <input
                            id="translation-import"
                            type="file"
                            accept=".json,.csv"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-slate-600">
                        Supported formats: JSON, CSV • Selected: {selectedLanguage} / {selectedNamespace}
                    </p>
                </div>

                {/* Info Banner */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Translation File Format</p>
                            <p className="text-xs">
                                JSON: {"{ \"key\": \"translation\" }"}<br/>
                                CSV: "Key","Translation" format with headers
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}