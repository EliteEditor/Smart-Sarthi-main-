// fareguide.js

// --- Panel Control ---
const showBtn = document.getElementById('show-calculator-btn');
const closeBtn = document.getElementById('close-calculator-btn');
const panel = document.getElementById('calculator-panel');
const overlay = document.getElementById('calculator-overlay');

// Check if elements exist before adding listeners
if (showBtn && closeBtn && panel && overlay) {
    showBtn.addEventListener('click', () => {
      panel.classList.add('open');
      overlay.style.display = 'block';
    });

    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    function closePanel() {
      panel.classList.remove('open');
      overlay.style.display = 'none';
    }
}

/* =====================================================
--- FARE CALCULATOR LOGIC ---
=====================================================
*/

// ** THE FIX IS HERE **
// Your server is on port 5000, not 3000.
const API_URL = 'http://localhost:5000/api';
// const API_URL = 'https://smart-sarthi.onrender.com/api';

// Get all the elements for the calculator
const fromSelect = document.getElementById('from-location');
const toSelect = document.getElementById('to-location');
const distanceInput = document.getElementById('distance');
const busTypeSelect = document.getElementById('bus-type');
const passengerCategorySelect = document.getElementById('passenger-category');
const fareForm = document.getElementById('fare-form');

// Fare Breakdown Elements
const finalFareDisplay = document.getElementById('final-fare-display');
const breakdownDistance = document.getElementById('breakdown-distance');
const breakdownBusType = document.getElementById('breakdown-bus-type');
const breakdownPassengerType = document.getElementById('breakdown-passenger-type');
const breakdownBaseFare = document.getElementById('breakdown-base-fare');
const breakdownDiscount = document.getElementById('breakdown-discount');
const breakdownFinalFare = document.getElementById('breakdown-final-fare');
const discountMessageEl = document.getElementById('discount-message');

// --- 1. Load Initial Data on Page Load ---
// We call this function immediately
loadInitialData();

async function loadInitialData() {
    // Ensure form elements exist before trying to load data
    if (!fromSelect) return; 

    // Disable the 'To' select at the start
    toSelect.disabled = true;

    try {
        // Fetch locations, bus types, and passenger categories all at once
        const response = await fetch(`${API_URL}/data`);
        const data = await response.json();

        // Populate the 'From' select
        populateDropdown(fromSelect, data.locations.map(loc => ({ id: loc, name: loc })));
        
        // Populate Bus Type dropdown
        populateDropdown(busTypeSelect, data.busTypes);
        
        // Populate Passenger Category dropdown
        populateDropdown(passengerCategorySelect, data.passengerCategories);

    } catch (error) {
        console.error('Failed to load initial data:', error);
        // You could show an error message to the user here
    }
}

// Helper function to fill a <select> element
function populateDropdown(selectElement, items) {
    // Clear existing options (except the first placeholder)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id || item; 
        option.textContent = item.name || item; 
        selectElement.appendChild(option);
    });
}

// --- 2. Auto-Update Distance & 'To' Dropdown ---
if(fromSelect && toSelect) {
    fromSelect.addEventListener('change', handleFromChange); // Update 'To' list
    toSelect.addEventListener('change', updateDistance); // Update distance
}

// 3. Handle 'From' dropdown change
async function handleFromChange() {
    const fromLocation = fromSelect.value;
    
    // Reset the 'To' dropdown and distance
    toSelect.innerHTML = '<option value="">Select destination</option>';
    distanceInput.value = 'Auto-calculated';

    if (!fromLocation) {
        toSelect.disabled = true;
        return;
    }

    // Fetch valid destinations from the new endpoint
    try {
        const response = await fetch(`${API_URL}/destinations?from=${fromLocation}`);
        const destinations = await response.json();
        
        populateDropdown(toSelect, destinations.map(loc => ({ id: loc, name: loc })));
        toSelect.disabled = false; // Enable the 'To' dropdown
    } catch (error) {
        console.error('Failed to fetch destinations:', error);
        toSelect.disabled = true;
    }
}

// 4. This function now *only* updates the distance
async function updateDistance() {
    const from = fromSelect.value;
    const to = toSelect.value;

    if (!from || !to) {
        distanceInput.value = '';
        return;
    }

    try {
        // Ask the backend for the distance
        const response = await fetch(`${API_URL}/distance?from=${from}&to=${to}`);
        const data = await response.json();

        if (data.distance !== null) {
            distanceInput.value = `${data.distance} km`;
        } else {
            distanceInput.value = 'Route not available';
        }
    } catch (error) {
        console.error('Failed to fetch distance:', error);
        distanceInput.value = 'Error';
    }
}

// --- 5. Handle Fare Calculation ---
if (fareForm) {
    fareForm.addEventListener('submit', handleFareCalculation);
}

async function handleFareCalculation(event) {
    event.preventDefault(); // Stop the form from reloading the page

    const formData = {
        from: fromSelect.value,
        to: toSelect.value,
        busTypeId: busTypeSelect.value,
        passengerId: passengerCategorySelect.value
    };

    try {
        // Send the form data to the backend for calculation
        const response = await fetch(`${API_URL}/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Calculation failed. Please check your selections.');
        }

        const breakdown = await response.json();
        updateFareUI(breakdown);

    } catch (error) {
        console.error('Fare calculation error:', error);
        alert(error.message);
    }
}

// --- 6. Update the UI with Final Breakdown ---
function updateFareUI(data) {
    // Format currency
    const format = (num) => `₹${num.toFixed(2)}`;

    // Update main display
    finalFareDisplay.textContent = format(data.finalFare);

    // Update breakdown
    breakdownDistance.textContent = `${data.distance} km`;
    breakdownBusType.textContent = data.busType;
    breakdownPassengerType.textContent = data.passengerType;
    breakdownBaseFare.textContent = format(data.baseFare);
    breakdownDiscount.textContent = `- ${format(data.discountApplied)}`;
    breakdownFinalFare.textContent = format(data.finalFare);

    // Update discount message
    if (data.discountApplied > 0) {
        discountMessageEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${data.discountMessage}`;
        discountMessageEl.style.display = 'flex';
    } else {
        discountMessageEl.style.display = 'none';
    }
}