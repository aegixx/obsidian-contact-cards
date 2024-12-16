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
- **Powerful Integrations**:
  - Photos automatically populated based on email address
  - Company logos pulled based on email domain (when Company name is provided)
  - Clickable fields for more context (phone, email, location, etc)

## Development

- Fork the repo & clone to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/obsidian-contact-cards` folder or symlink it!
- Install dependencies using `npm install`
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.

## Usage

**Add a code block** to your note:

```md
    ```contact-card
    name: Bryan Stone
    email: bryan@steampunk.dev
    company: Steampunk Labs
    title: Founder & Managing Partner
    phone: 2565551234
    location: Madison, AL
    ```    
```

**View the rendered card** in Reading/Preview mode:
![Sample Card](sample_card.png)

## Customization

The `obsidian-contact-cards` plugin allows for several customizable settings to tailor the behavior and design of your contact cards. Below are the available options you can configure:

### Settings

1. **HTML Template**
   - **Description:** Provide the path to a custom HTML template to be used instead of the default card design. (Syntax follows the TemplaterThe fields should be provided using the Templater syntax (i.e. `{{name}}`).
   - **Example:**

     ```html
     <div class="custom-contact-card">
         <img src="{{photo_url}}" alt="Profile Photo">
         <h1>{{name}}</h1>
         <p>{{title}}</p>
         <a href="mailto:{{email}}">{{email}}</a>
     </div>
     ```

2. **Brandfetch Client ID**
   - **Description:** Company logos are retrieved using the email domain via the Brandfetch API. To use this API, you must register for a Client ID. This service is available free of charge.
   - **Note:** Register for your free Brandfetch API key [here](https://brandfetch.io/).

3. **Default Country Code**
   - **Description:** This setting determines the country code used for phone number formatting. Provide the 2-letter country code (e.g., "GB" for the United Kingdom, "IN" for India)
   - **Default:** "US"

### Styling

The `obsidian-contact-cards` plugin provides several customizable CSS classes to help you personalize the appearance of the business cards. You can override these styles in your own stylesheet to create a custom look and feel. Below are the available classes and their purposes:

#### Available CSS Classes

- **`.contact-card-content`** - The outer container for the card, this is used for layout & sizing.
- **`.contact-card`** - The inner container that holds the profile image, logo, and contact information.
- **`.contact-card-photo`** - Profile photo image of the contact.
- **`.contact-card-logo`** - Company logo displayed on the card.
- **`.contact-card-info`** - Container for the contact's name, title, company, and other information.
- **`.contact-card-name`** - The name of the contact.
- **`.contact-card-title`** - The title/position of the contact.
- **`.contact-card-separator`** - A separator between sections in the contact info (e.g., between name and company).
- **`.contact-card-hidden`** - A utility class to hide elements.
- **`.contact-card-error`** - Applied to elements displaying an error message.

#### Animations

- **`.contact-card-content`** - This class uses the `animatop` animation to slide the background shape into view.
- **`.contact-card:after`** - This class defines the background shape displayed behind the card.

## Roadmap

- Add support for additional "power" fields with custom functionality (e.g. social media links, skills)
- Add richer integration for finding a contact's photo

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request if you find any bugs or have suggestions for improvements.

## License

[MIT](LICENSE)
