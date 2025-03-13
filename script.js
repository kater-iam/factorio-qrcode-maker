document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const qrTextInput = document.getElementById('qr-text');
    const errorCorrectionSelect = document.getElementById('error-correction');
    const generateBtn = document.getElementById('generate-btn');
    const qrPreview = document.getElementById('qr-preview');
    const blueprintOutput = document.getElementById('blueprint-output');
    const copyBtn = document.getElementById('copy-btn');
    const entityCount = document.getElementById('entity-count');
    const blueprintSize = document.getElementById('blueprint-size');

    // Initialize QR code preview with placeholder
    qrPreview.innerHTML = '<div class="placeholder">QR code will appear here</div>';
    
    // Event listeners
    generateBtn.addEventListener('click', generateQRBlueprint);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Function to generate QR code and Factorio blueprint
    function generateQRBlueprint() {
        const text = qrTextInput.value.trim();
        if (!text) {
            alert('Please enter a URL or text to encode.');
            return;
        }
        
        const errorCorrectionLevel = errorCorrectionSelect.value;
        
        try {
            // Generate QR code
            const qr = qrcode(0, errorCorrectionLevel);
            qr.addData(text);
            qr.make();
            
            // Display QR code in preview
            qrPreview.innerHTML = qr.createImgTag(5);
            
            // Get QR code matrix
            const qrMatrix = getQRMatrix(qr);
            
            // Create Factorio blueprint
            const blueprint = createFactorioBlueprint(qrMatrix);
            
            // Update UI with blueprint and stats
            blueprintOutput.value = blueprint;
            entityCount.textContent = qrMatrix.flat().filter(Boolean).length;
            blueprintSize.textContent = `${qrMatrix.length}×${qrMatrix.length}`;
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Failed to generate QR code. Please try again.');
        }
    }
    
    // Function to extract QR matrix from the generated QR code
    function getQRMatrix(qr) {
        const modules = qr.getModuleCount();
        const matrix = [];
        
        for (let y = 0; y < modules; y++) {
            const row = [];
            for (let x = 0; x < modules; x++) {
                row.push(qr.isDark(y, x) ? 1 : 0);
            }
            matrix.push(row);
        }
        
        return matrix;
    }
    
    // Function to create Factorio blueprint from QR matrix
    function createFactorioBlueprint(matrix) {
        // Blueprint structure
        const blueprint = {
            blueprint: {
                icons: [
                    { signal: { type: "item", name: "small-lamp" }, index: 1 }
                ],
                entities: [],
                item: "blueprint",
                version: 281479275675648
            }
        };
        
        let entityNumber = 1;
        
        // Add lamps for each dark module in the QR code
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    blueprint.blueprint.entities.push({
                        entity_number: entityNumber++,
                        name: "small-lamp",
                        position: {
                            x: x,
                            y: y
                        }
                    });
                }
            }
        }
        
        // Encode blueprint to string
        return encodeBlueprint(blueprint);
    }
    
    // Function to encode blueprint to the Factorio format
    function encodeBlueprint(blueprint) {
        // Convert blueprint to JSON string
        const blueprintString = JSON.stringify(blueprint);
        
        // Compress using pako (zlib)
        const compressedData = pako.deflate(blueprintString, { level: 9 });
        
        // Convert to base64
        const base64String = uint8ArrayToBase64(compressedData);
        
        // Return the final blueprint string
        return "0" + base64String;
    }
    
    // Function to convert Uint8Array to base64
    function uint8ArrayToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    // Function to copy blueprint to clipboard
    function copyToClipboard() {
        if (!blueprintOutput.value) {
            alert('No blueprint to copy. Generate a QR code first.');
            return;
        }
        
        blueprintOutput.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }
}); 