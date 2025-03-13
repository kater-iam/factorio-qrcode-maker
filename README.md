# Factorio QR Code Blueprint Generator

This web application allows you to generate Factorio blueprints that, when built in-game, create QR codes using lamps. The QR codes can be scanned with a smartphone or QR code reader to retrieve the original URL or text.

## Features

- Generate QR codes from any URL or text
- Preview the QR code before creating the blueprint
- Customize error correction level to balance between QR code size and redundancy
- Copy the blueprint string to clipboard with one click
- View information about the generated blueprint (number of entities, size)

## How to Use

You can use this tool in two ways:

### Online Version

Visit the [Factorio QR Code Blueprint Generator](https://kater-iam.github.io/factorio-qrcode-maker/) directly in your browser.

### Local Usage

1. Clone this repository
2. Open `index.html` in your web browser
3. Enter the URL or text you want to encode in the QR code
4. Select the error correction level (higher levels make bigger QR codes but are more resistant to damage)
5. Click "Generate Blueprint"
6. Copy the generated blueprint string
7. In Factorio, press `Ctrl+V` to import the blueprint

## Technical Details

The application uses:
- QR code generation with the qrcode-generator library
- Blueprint generation in Factorio's format
- Blueprint string encoding with zlib compression (pako library) and base64 encoding

## Blueprint Information

The generated blueprints:
- Use small lamps to represent the "dark" modules of the QR code
- Place lamps at integer coordinates matching the QR code matrix
- Include proper blueprint metadata for Factorio compatibility

## Notes for Use in Factorio

- The QR code will be functional when all lamps are placed
- For better visibility, consider building the QR code in a dark area or at night
- You may need to connect the lamps to your power network for them to work
- Scanning the QR code works best from a screenshot or when the game is in map view

## Development

This project is automatically deployed to GitHub Pages via GitHub Actions. Any changes pushed to the main branch will be automatically deployed.

To contribute:
1. Fork this repository
2. Make your changes
3. Submit a pull request

## License

MIT License # yousan_2025
