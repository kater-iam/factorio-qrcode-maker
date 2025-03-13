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

    // Flag to track if input field has been focused before
    let hasBeenFocused = false;

    // Clear input text on first focus
    qrTextInput.addEventListener('focus', () => {
        if (!hasBeenFocused) {
            qrTextInput.select();
            hasBeenFocused = true;
        }
    });

    // Initialize QR code preview with placeholder
    qrPreview.innerHTML = '<div class="placeholder">QR code will appear here</div>';
    
    // Event listeners
    generateBtn.addEventListener('click', generateQRBlueprint);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Automatically generate QR code on page load
    window.addEventListener('load', () => {
        generateQRBlueprint();
    });
    
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
            
            // Get QR code matrix
            const qrMatrix = getQRMatrix(qr);
            
            // Display Factorio-style QR code in preview
            renderFactorioQRPreview(qrMatrix);
            
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
    
    // Function to create Factorio-style QR code preview
    function renderFactorioQRPreview(matrix) {
        // Clear previous preview
        qrPreview.innerHTML = '';
        
        // Calculate canvas size based on matrix size
        const size = matrix.length;
        const cellSize = Math.min(Math.floor(300 / size), 10); // Max cell size of 10px
        const padding = 10;
        const canvasSize = size * cellSize + (padding * 2);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        
        // Draw background (Factorio dark ground)
        ctx.fillStyle = '#2d2d2a';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // Draw grid pattern (optional)
        ctx.strokeStyle = '#3a3a36';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= size; i++) {
            const pos = padding + i * cellSize;
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(padding, pos);
            ctx.lineTo(padding + size * cellSize, pos);
            ctx.stroke();
            // Vertical
            ctx.beginPath();
            ctx.moveTo(pos, padding);
            ctx.lineTo(pos, padding + size * cellSize);
            ctx.stroke();
        }
        
        // Draw lamps
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (matrix[y][x]) {
                    // Draw lamp base
                    ctx.fillStyle = '#919189';
                    const lampX = padding + x * cellSize;
                    const lampY = padding + y * cellSize;
                    ctx.fillRect(
                        lampX + cellSize * 0.1, 
                        lampY + cellSize * 0.1, 
                        cellSize * 0.8, 
                        cellSize * 0.8
                    );
                    
                    // Draw lamp light
                    const gradient = ctx.createRadialGradient(
                        lampX + cellSize/2, 
                        lampY + cellSize/2, 
                        0,
                        lampX + cellSize/2, 
                        lampY + cellSize/2, 
                        cellSize/2
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
                    gradient.addColorStop(0.6, 'rgba(255, 255, 100, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(
                        lampX + cellSize/2, 
                        lampY + cellSize/2, 
                        cellSize/1.5, 
                        0, 
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
        
        // Add "Factorio" caption
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Factorio QR Code Preview', padding, canvasSize - 2);
        
        // Add canvas to preview
        qrPreview.appendChild(canvas);
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