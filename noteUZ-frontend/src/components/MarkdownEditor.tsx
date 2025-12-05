// src/components/MarkdownEditor.tsx
import React, { useState, useRef } from 'react';
import {
    Box, TextField, Tabs, Tab, IconButton, Tooltip, Stack, useTheme, Typography
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Ikony
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TitleIcon from '@mui/icons-material/Title';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';

interface MarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    minRows?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
                                                                  value,
                                                                  onChange,
                                                                  placeholder = "Wpisz treść...",
                                                                  minRows = 12
                                                              }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0); // 0 = Write, 1 = Preview
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFormat = (type: string) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const selectedText = value.substring(start, end);
        let newText = value;
        let newCursorPos = start;

        switch (type) {
            case 'bold':
                newText = value.substring(0, start) + `**${selectedText || 'tekst'}**` + value.substring(end);
                newCursorPos = end + 4; // za **
                if (!selectedText) newCursorPos = start + 2; // w środek
                break;
            case 'italic':
                newText = value.substring(0, start) + `*${selectedText || 'tekst'}*` + value.substring(end);
                newCursorPos = end + 2;
                if (!selectedText) newCursorPos = start + 1;
                break;
            case 'list':
                newText = value.substring(0, start) + `\n- ${selectedText}` + value.substring(end);
                newCursorPos = end + 3;
                break;
            case 'heading':
                newText = value.substring(0, start) + `\n### ${selectedText || 'Nagłówek'}` + value.substring(end);
                newCursorPos = end + 5;
                break;
            case 'quote':
                newText = value.substring(0, start) + `\n> ${selectedText || 'Cytat'}` + value.substring(end);
                newCursorPos = end + 3;
                break;
            case 'code':
                newText = value.substring(0, start) + `\`${selectedText || 'kod'}\`` + value.substring(end);
                newCursorPos = end + 2;
                if (!selectedText) newCursorPos = start + 1;
                break;
            case 'link':
                newText = value.substring(0, start) + `[${selectedText || 'tekst'}](url)` + value.substring(end);
                newCursorPos = end + 1;
                break;
        }

        onChange(newText);

        setTimeout(() => {
            input.focus();
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    // Obsługa skrótów klawiszowych (GitHub style)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            handleFormat('bold');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            handleFormat('italic');
        }
    };

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Header: Tabs + Toolbar */}
            <Box sx={{
                bgcolor: theme.palette.mode === 'light' ? '#f5f7fa' : 'rgba(255,255,255,0.05)',
                px: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1
            }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ minHeight: 48 }}>
                    <Tab label="Edytuj" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
                    <Tab label="Podgląd" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
                </Tabs>

                {activeTab === 0 && (
                    <Stack direction="row" spacing={0} sx={{ py: 0.5, pr: 1 }}>
                        <Tooltip title="Pogrubienie (Ctrl+B)"><IconButton size="small" onClick={() => handleFormat('bold')}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Kursywa (Ctrl+I)"><IconButton size="small" onClick={() => handleFormat('italic')}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Nagłówek"><IconButton size="small" onClick={() => handleFormat('heading')}><TitleIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Lista"><IconButton size="small" onClick={() => handleFormat('list')}><FormatListBulletedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Cytat"><IconButton size="small" onClick={() => handleFormat('quote')}><FormatQuoteIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Kod"><IconButton size="small" onClick={() => handleFormat('code')}><CodeIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Link"><IconButton size="small" onClick={() => handleFormat('link')}><LinkIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                )}
            </Box>

            {/* Content Area */}
            {activeTab === 0 ? (
                <TextField
                    inputRef={inputRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    multiline
                    minRows={minRows}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            '& fieldset': { border: 'none' } // Bez ramki wewnątrz
                        }
                    }}
                />
            ) : (
                <Box sx={{
                    p: 3,
                    minHeight: minRows * 20,
                    // Style Markdown (Github-like)
                    '& h1, & h2, & h3': { color: 'text.primary', fontWeight: 700, mt: 2, mb: 1 },
                    '& p': { color: 'text.secondary', lineHeight: 1.6, mb: 1.5 },
                    '& ul, & ol': { pl: 3, mb: 1.5, color: 'text.secondary' },
                    '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
                    '& blockquote': {
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        pl: 2, py: 0.5, my: 2,
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '0 8px 8px 0',
                        fontStyle: 'italic'
                    },
                    '& code': {
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                        p: 0.5, borderRadius: '4px',
                        fontSize: '0.9em', fontFamily: 'monospace'
                    }
                }}>
                    {value.trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value}
                        </ReactMarkdown>
                    ) : (
                        <Typography color="text.disabled" fontStyle="italic">
                            Brak treści do podglądu.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};