describe('opens Google and searches for a pomgranate', () => {
   
      
    
  
    it('searches for a lemon', () => {
        cy.visit('https://google.com');
        cy.get("#L2AGLb").click();
        cy.get("#APjFqb").type("lemon{enter}")
    })
})
