describe('Uwierzytelnianie', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('Powinien wyświetlić formularz logowania', () => {
        cy.contains('Zaloguj się').should('be.visible');
        cy.get('input[type="email"]').should('exist');
        cy.get('input[type="password"]').should('exist');
    });

    it('Powinien poprawnie zalogować użytkownika', () => {
        cy.intercept('POST', '**/api/**', {
            statusCode: 200,
            body: {
                token: 'fake-jwt-token',
                user: { email: 'test@example.com', displayName: 'Tester' }
            }
        }).as('loginRequest');

        cy.get('input[type="email"]').type('test@example.com');
        cy.get('input[type="password"]').type('Haslo123!');

        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/dashboard');
    });

    it('Powinien pokazać błąd przy złych danych', () => {
        // Mockujemy błąd 401
        cy.intercept('POST', '**/api/**', {
            statusCode: 401,
            body: { message: 'Nieprawidłowe dane logowania' }
        }).as('loginFail');

        cy.get('input[type="email"]').type('wrong@example.com');
        cy.get('input[type="password"]').type('badpass');
        cy.get('button[type="submit"]').click();

        cy.contains('Nieprawidłowe dane').should('be.visible');
    });
});