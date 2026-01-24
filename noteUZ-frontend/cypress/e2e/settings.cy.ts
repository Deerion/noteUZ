describe('Ustawienia Aplikacji (Motyw i Język)', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('Powinien zmieniać motyw Jasny/Ciemny', () => {
        cy.get('body').should('have.css', 'background-color').and('not.contain', 'rgb(0, 0, 0)'); // Nie czarny
        cy.get('[data-testid="theme-toggle"], button[aria-label="change theme"]').click();
        cy.get('body').should('have.css', 'background-color').and('not.contain', 'rgb(255, 255, 255)'); // Nie biały
    });

    it('Powinien zmieniać język (PL/EN)', () => {
        cy.contains('Notatki').should('exist');

        cy.get('[data-testid="language-switcher"], button[aria-label="change language"]').click();
        cy.contains('English').click();

        cy.contains('Notes').should('exist');
        cy.contains('Notatki').should('not.exist');
    });
});