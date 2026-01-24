describe('Zarządzanie Notatkami', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/notes', {
            statusCode: 200,
            body: [
                { id: '1', title: 'Notatka Zakupowa', content: 'Mleko, chleb', createdAt: '2024-01-01' },
                { id: '2', title: 'Pomysły na projekt', content: 'Cypress testy', createdAt: '2024-01-02' }
            ]
        }).as('getNotes');

        cy.visit('/notes');
    });

    it('Powinien załadować i wyświetlić listę notatek', () => {
        cy.wait('@getNotes');

        cy.contains('Notatka Zakupowa').should('be.visible');
        cy.contains('Pomysły na projekt').should('be.visible');
    });

    it('Powinien otworzyć modal dodawania notatki', () => {
        cy.get('button[aria-label="add"], button:contains("Dodaj")').first().click();

        cy.get('[role="dialog"]').should('be.visible');
        cy.contains('Nowa notatka').should('be.visible');
    });

    it('Powinien utworzyć nową notatkę', () => {
        cy.intercept('POST', '**/api/notes', {
            statusCode: 201,
            body: { id: '3', title: 'Nowa Cypressowa', content: 'Treść testowa' }
        }).as('createNote');

        // Otwórz modal
        cy.get('button[aria-label="add"], button:contains("Dodaj")').first().click();

        cy.get('input[name="title"], input[placeholder="Tytuł"]').type('Nowa Cypressowa');
        cy.get('textarea').type('Treść testowa');

        cy.contains('Zapisz').click();

        cy.wait('@createNote');

        cy.get('[role="dialog"]').should('not.exist');
    });
});