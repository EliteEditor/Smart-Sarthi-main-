// Wait for the HTML page to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    // Find the journey planner form in the HTML
    const journeyForm = document.getElementById('journey-planner-form');

    // Add an event listener that runs when the form is submitted (i.e., when "Find Routes" is clicked)
    journeyForm.addEventListener('submit', async function(event) {
        
        // Prevent the form from reloading the page, which is the default behavior
        event.preventDefault();

        // Get the text values from the input fields
        const from = document.getElementById('from-location').value;
        const to = document.getElementById('to-location').value;
        const resultsContainer = document.getElementById('bus-results');

        // Display a helpful loading message to the user
        resultsContainer.innerHTML = '<p>Searching for available buses...</p>';

        try {
            // Send the data to your working backend API endpoint
            const response = await fetch('https://smart-sarthi.onrender.com/api/findBus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ from, to }) // Your API only needs 'from' and 'to'
            });

            // If the server responds with an error, stop and show a message
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Get the JSON data (the list of buses) from the server's response
            const data = await response.json();

            // Clear the "Searching..." message
            resultsContainer.innerHTML = '';

            // Check if the server found any buses
            if (data.results && data.results.length > 0) {
                // If buses were found, loop through each one
                data.results.forEach(bus => {
                    // Create a new div element for each bus card
                    const busCard = document.createElement('div');
                    busCard.className = 'bus-card'; // Use the style from your style.css
                    
                    // Fill the card with the bus information
                    busCard.innerHTML = `
                        <h4>Bus Number: ${bus.bus}</h4>
                        <p><strong>Route:</strong> ${bus.from} → ${bus.to}</p>
                        <p><strong>Departure Time:</strong> ${bus.time}</p>
                    `;
                    
                    // Add the newly created card to the results container on the page
                    resultsContainer.appendChild(busCard);
                });
            } else {
                // If no buses were found, show the "not found" message
                resultsContainer.innerHTML = '<p>Sorry, no direct buses were found for this route.</p>';
            }

        } catch (error) {
            // If any part of the process fails, log the error and show a message to the user
            console.error('Error fetching bus routes:', error);
            resultsContainer.innerHTML = '<p>An error occurred while searching. Please try again later.</p>';
        }
    });
});