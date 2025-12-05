// src/components/ErrorPage/NextLinkButton.tsx
import Link from 'next/link';
import React, { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

// 1. Zdefiniuj typ bazowy dla propsów NextLink.
// Musimy usunąć wszystkie konflikty typów z ButtonProps, które są przekazywane do <a>.
// Omitujemy wszystkie propsy z ButtonProps, które nie są potrzebne elementowi <a>.
// Zostawiamy tylko te, które są potrzebne przez <Link> (czyli href), oraz standardowe AnchorProps.
type NextLinkButtonBaseProps = Omit<ButtonProps, 'href' | 'component'>;

// 2. Definicja propsów, które komponent <NextLink> (czyli element <a>) ostatecznie otrzyma.
// Bierzemy ogólne propsy MuiButton (po odjęciu 'href' i 'component')
// i dodajemy do nich Propsy HTMLAnchorElement, ale ostrożnie, aby nie wprowadzić konfliktu.
type NextLinkProps = {
    href: string;
} & NextLinkButtonBaseProps & Omit<
    DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
    keyof NextLinkButtonBaseProps | 'href'
>;

// 3. Komponent NextLink (ForwardRef do elementu <a>)
const NextLink = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
    function NextLink({ href, children, ...other }, ref) {
        return (
            <Link href={href} legacyBehavior passHref>
                {/* To jest miejsce, gdzie występuje błąd.
                  Użycie `as any` jest tu konieczne, aby obejść błąd niezgodności
                  typów event handlerów (np. onCopy) pomiędzy HTMLButtonElement a HTMLAnchorElement,
                  które są dziedziczone przez `...other` z MuiButton.
                */}
                <a
                    ref={ref}
                    {...other as any} // Użycie 'as any' omija błąd TS2322 dla handlerów
                    style={{ textDecoration: 'none', ...(other.style as object) }}
                >
                    {children}
                </a>
            </Link>
        );
    }
);

// 4. Główny komponent NextLinkButton
export const NextLinkButton: React.FC<NextLinkProps> = (props) => {
    return (
        <MuiButton
            component={NextLink}
            {...props as ButtonProps}
        />
    );
};