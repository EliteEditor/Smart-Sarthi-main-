// This function runs when the page loads
window.addEventListener('DOMContentLoaded', () => {
    
    // --- YOUR PUBLIC KEY IS PASTED HERE ---
    const PUBLIC_KEY_PEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyJUmCJC+UO+vtOWkQ7yudBx+lRN5KnpiVBWTkwe7vXZi+AwTkI+sYTutBW9IsfTQp91DAKdIcZlIDjqR0xcPPwGrLTgH2Hf8A8oxQ7flbgM54E+AGoapw/30XPwcj0pBOp6FcawOR11u9eO1aNMD8H0HsRavdwkeI9D9FhNI3F8AQ9xxMUxciPqhwqOmEjWi3u/VLADvJlUTnielyP9iWrPU/yvZB2yY2wRgr3e1x+v2vojz5Mqvw1/d2/VHq7LknnjOOuX3neuey7CKz3fXFLZNGhui2mgdT/6C1qHFDC861YeKkUUNtN+8ZNy42iinGaO3ZjnsU6EOu95uQEYpRQIDAQAB
-----END PUBLIC KEY-----
`;
    // ------------------------------------

    const resultContainer = document.getElementById('result-container');
    let scannerIsRunning = false; // Prevents multiple scans

    // This function is called when a QR is scanned
    async function onScanSuccess(decodedText, decodedResult) {
        if (scannerIsRunning) return; // Prevent multiple scans
        scannerIsRunning = true;

        try {
            // 1. Import the Public Key
            // 'jose' is the library that must be loaded in scanner.html
            const publicKey = await jose.importSPKI(PUBLIC_KEY_PEM, 'RS256');
            
            // 2. Verify the JWT (the text from the QR code)
            // This checks the signature and expiration time *offline*
            const { payload } = await jose.jwtVerify(decodedText, publicKey);

            // 3. Verification Success! Show the pass details.
            const expiryDate = new Date(payload.expiry);
            const passDetails = `
                <strong>PASS VALID</strong><br>
                Route: ${payload.from} to ${payload.to}<br>
                Expires: ${expiryDate.toLocaleDateString()}
            `;
            
            showResult(passDetails, 'success');

        } catch (error) {
            // 4. Verification Failed! (Expired, bad signature, etc.)
            console.error(error);
            showResult(`<strong>INVALID PASS</strong><br>(${error.message})`, 'error');
        }
        
        // Allow scanning again after 3 seconds
        setTimeout(() => { scannerIsRunning = false; }, 3000);
    }

    function showResult(message, type) {
        resultContainer.innerHTML = message;
        resultContainer.className = type;
    }

    // Start the scanner
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess, // Function to call on success
        (errorMessage) => { /* ignore scan errors */ }
    ).catch(err => {
        showResult("Could not start camera.", "error");
    });
});
// // SET THIS TO YOUR API URL. For local testing:
// const API_BASE_URL = 'http://localhost:5000/api';
// // For production (after you deploy):
// // const API_BASE_URL = 'https://smart-sarthi.onrender.com/api';

// const startScanBtn = document.getElementById('start-scan-btn');
// const checkInBtn = document.getElementById('check-in-btn');
// const tokenDisplay = document.getElementById('scanned-token');
// const resultContainer = document.getElementById('result-container');

// let scannedToken = null; // Variable to hold the token from the QR code
// let html5QrCode = null; // Variable to hold the scanner object

// // This function runs when a QR code is successfully scanned
// function onScanSuccess(decodedText, decodedResult) {
//     console.log(`Scan result: ${decodedText}`);
    
//     // 1. Stop the scanner
//     if (html5QrCode) {
//         html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
//         startScanBtn.style.display = 'none'; // Hide the start button
//     }

//     // 2. Store the token
//     scannedToken = decodedText;
//     tokenDisplay.textContent = 'Pass found! Ready to check-in.';
    
//     // 3. Enable the "Check-In" button
//     checkInBtn.disabled = false;
    
//     // 4. Clear any old messages
//     resultContainer.innerHTML = '';
//     resultContainer.className = '';
// }

// // Function to start the camera scanner
// function startScanner() {
//     startScanBtn.disabled = true;
//     startScanBtn.textContent = 'Loading Camera...';

//     // Create a new scanner instance
//     html5QrCode = new Html5Qrcode("qr-reader");
    
//     html5QrCode.start(
//         { facingMode: "environment" }, // Use the back camera on phones
//         {
//             fps: 10, // Frames per second
//             qrbox: { width: 250, height: 250 } // Size of the scanning box
//         },
//         onScanSuccess, // The function to call on success
//         (errorMessage) => {
//             // This function runs on scan error (e.g., no QR code found)
//             // We can ignore these errors for a cleaner UI
//         }
//     ).catch((err) => {
//         tokenDisplay.textContent = `Unable to start camera: ${err}`;
//         startScanBtn.disabled = false;
//         startScanBtn.textContent = 'Start Camera Scan';
//     });
// }

// // Event listener for the "Start Scan" button
// startScanBtn.addEventListener('click', startScanner);

// // Event listener for the "Check-In" button
// checkInBtn.addEventListener('click', async () => {
//     if (!scannedToken) {
//         alert("No pass token was scanned.");
//         return;
//     }

//     checkInBtn.disabled = true;
//     checkInBtn.textContent = 'Submitting...';
//     resultContainer.innerHTML = '';
//     resultContainer.className = '';

//     try {
//         // This calls the POST /api/check-in endpoint
//         // that is already in your api.js file
//         const response = await fetch(`${API_BASE_URL}/check-in`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ qrToken: scannedToken })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             // Success! (e.g., 201 Created)
//             resultContainer.textContent = `✅ ${data.message} (${data.route})`;
//             resultContainer.className = 'success';
//         } else {
//             // Error! (e.g., 409 "Already used" or 401 "Invalid")
//             resultContainer.textContent = `❌ ${data.message}`;
//             resultContainer.className = 'error';
//         }

//     } catch (error) {
//         // Network error, etc.
//         console.error('Check-in failed:', error);
//         resultContainer.textContent = '❌ Network error. Could not check-in.';
//         resultContainer.className = 'error';
//     } finally {
//         // Reset the button so the conductor can scan again
//         checkInBtn.disabled = true; // Stays disabled until a *new* scan
//         checkInBtn.textContent = 'Confirm Check-In';
//         tokenDisplay.textContent = 'Scan next pass.';
//         scannedToken = null; // Clear the token

//         // Show the 'Start Scan' button again to scan another pass
//         startScanBtn.style.display = 'block';
//         startScanBtn.disabled = false;
//         startScanBtn.textContent = 'Start Camera Scan';
//     }
// });