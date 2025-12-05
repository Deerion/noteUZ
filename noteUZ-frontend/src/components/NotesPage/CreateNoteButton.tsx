// src/components/NotesPage/CreateNoteButton.tsx
import React from 'react';
import Link from 'next/link';
import { Button as MuiButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'next-i18next'; // <--- ZMIANA

export const CreateNoteButton: React.FC = () => {
    const { t } = useTranslation('common'); // <--- ZMIANA

    return (
        <Link href="/notes/new" legacyBehavior passHref>
            <MuiButton
                component="a"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(255,122,24,0.3)',
                }}
            >
                {t('create_note_btn')} {/* <--- ZMIANA */}
            </MuiButton>
        </Link>
    );
};