# Obsidian Contact Cards Plugin

The Obsidian Contact Cards Plugin transforms YAML data inside a special code block into a beautifully designed contact card. This lets you quickly view a person's details (even in preview mode).

## Attribution

- [Profile Card UI](https://codepen.io/genarocolusso/pen/xONEXg) by [Genaro Colusso](https://codepen.io/genarocolusso)
- Profile photos from [Gravatar](https://gravatar.com/)
- Company logos from [Brandfetch](https://brandfetch.com)
- Vector graphics from [SVG Repo](https://www.svgrepo.com)

## Features

- **Beautiful Formatting**: Display name, title, company, email, and phone number in a clean, business-card style layout.
- **Simple Syntax**: Just provide a `contact-card` code block with YAML fields, and the plugin will handle the rest.
- **Customizable**: Adjust styling by modifying the plugin’s CSS or by creating your own Obsidian CSS snippets.
- **Powerful Integrations**: Photos automatically populate from Gravatar, Company logos pulled from Brandfetch, and clickable fields for quick access to phone, email, location, LinkedIn and more.

## Development

- Clone the repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/obsidian-contact-cards` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Usage

1. **Add a code block** to your note:

    ```md
        ```contact-card
        name: Jane Doe
        title: Head of Engineering
        company: Acme Corp
        email: jane.doe@example.com
        phone: 555 123 4567
        ```
    ```

2. **View the rendered card** in Reading mode.  
You’ll see a nicely formatted contact card in place of the code block.

## Customization

- **CSS Themes**:  
The plugin uses Obsidian’s built-in CSS variables. If you are using a custom theme, the card styling should adapt automatically.
- **Further Customization**:  
You can add custom CSS in your `Snippets` to change the border, font, colors, or layout of the contact card:

    ```css
    .contact-card-container {
    border: 2px solid #ff0000;
    background-color: #f2f2f2;
    }
    ```

## Roadmap

- Support additional contact fields (e.g., address, social media links).
- Add configuration options to show/hide specific fields.

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request if you find any bugs or have suggestions for improvements.

## License

[MIT](LICENSE)
