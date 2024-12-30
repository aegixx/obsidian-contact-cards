import { App, MarkdownPostProcessorContext, parseYaml, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import * as crypto from "crypto"
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

interface ContactCardsPluginSettings {
    htmlTemplate?: string;
    brandfetchClientId?: string;
    defaultCountryCode: string
}

const DEFAULT_SETTINGS: ContactCardsPluginSettings = {
    defaultCountryCode: 'US'
}

export default class ContactCardsPlugin extends Plugin {
    settings: ContactCardsPluginSettings;

    async onload() {
        console.log(`Loading plugin: ${this.manifest.name} v${this.manifest.version}`);

        await this.loadSettings();

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new ContactCardsSettingTab(this.app, this));

        // Register a post-processor for code blocks of language `contact-card`
        this.registerMarkdownCodeBlockProcessor("contact-card", (source, el, ctx) =>
            this.renderContactCard(source, el, ctx)
        );

        window.CodeMirror.defineMode("contact-card", config => window.CodeMirror.getMode(config, "yaml"));
    }

    onunload() {
        console.log(`Unloading plugin: ${this.manifest.name} v${this.manifest.version}`);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    renderError(el: HTMLElement, error: unknown) {
        let errorMsg = 'Something went wrong';
        if (error instanceof Error) {
            errorMsg = `${error.name} - ${error.message}`;
        } else if (typeof error === 'string') {
            errorMsg = error;
        } else if (typeof error === 'object' && error !== null && 'toString' in error && typeof error.toString === 'function') {
            errorMsg = error.toString();
        }
        return el.createDiv({ cls: 'contact-card-error', text: errorMsg });
    }

    async renderContactCard(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        try {

            const contactData = parseYaml(source) ?? {
                name: 'John Doe',
                title: 'The Everyman',
                company: 'Acme Inc.',
                email: 'john.doe@example.com',
                phone: 5551234567,
                location: 'Nowhere, OK'
            };

            const container = el.createDiv({ cls: "contact-card-container" });
            const content = container.createDiv({ cls: "contact-card-content" });
            const card = content.createDiv({ cls: "contact-card" });

            // Contact Card Photo
            let photoUrl = contactData.photo_url;
            if (!photoUrl) {
                // Only use Gravatar if a photo_url was not provided
                const emailHash = emailDigest(contactData.email ?? '');
                photoUrl = `https://gravatar.com/avatar/${emailHash}.jpg?s=120&d=mp`;
            }
            const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${contactData.name}`;
            const photo = card.createEl('a', { title: 'Search on LinkedIn', cls: 'contact-card-photo', attr: { href: linkedInUrl } });
            photo.createEl('img', { attr: { src: photoUrl } });
            delete contactData.photo_url;

            // Company Logo
            let logoUrl = contactData.logo_url;
            if (logoUrl || contactData.company) {
                const emailDomain = contactData.email?.slice(contactData.email.indexOf('@') + 1).toLowerCase();
                if (!logoUrl && emailDomain) {
                    // Only use Brandfetch if a logo_url was not provided
                    logoUrl = `https://cdn.brandfetch.io/${emailDomain}/w/100/h/100?c=${this.settings.brandfetchClientId}`;
                }
                const companyLogo = card.createEl('a', { title: 'View Website', cls: 'contact-card-company-logo', attr: { href: `https://www.${emailDomain}` } });
                companyLogo.createEl('img', { attr: { src: logoUrl } });
            }
            delete contactData.logo_url;

            // Contact Details
            const info = card.createDiv({ cls: "contact-card-info" });

            info.createDiv({ cls: "contact-card-name", text: contactData.name });
            delete contactData.name;

            info.createDiv({ cls: "contact-card-title", text: contactData.title });
            delete contactData.title;

            info.createDiv({ cls: "contact-card-separator", text: '\u00A0' });

            info.createDiv({ cls: "contact-card-company", text: contactData.company });
            delete contactData.company;

            // Clickable Email
            if (contactData.email) {
                const email = info.createDiv({ cls: "contact-card-email" });
                email.createEl('a', { title: 'Send Email', text: contactData.email, attr: { href: `mailto:${contactData.email}` } });
                delete contactData.email;
            }

            // Formatted & Clickable Phone Number
            if (contactData.phone) {
                const phoneUtil = PhoneNumberUtil.getInstance();
                const phoneNum = phoneUtil.parse(contactData.phone.toString(), this.settings.defaultCountryCode);
                const regionCode = phoneUtil.getRegionCodeForNumber(phoneNum);
                const formattedPhone = phoneUtil.format(phoneNum, regionCode === null || regionCode === this.settings.defaultCountryCode ? PhoneNumberFormat.NATIONAL : PhoneNumberFormat.INTERNATIONAL);
                const phone = info.createDiv({ cls: "contact-card-phone" });
                phone.createEl('a', { title: 'Call Number', text: formattedPhone, attr: { href: `tel:${phoneUtil.getNationalSignificantNumber(phoneNum)}` } });
                delete contactData.phone;
            }
    
            // Clickable Location
            if (contactData.location) {
                const location = info.createDiv({ cls: "contact-card-location" });
                location.createEl('a', { title: 'View on Map', text: contactData.location, attr: { href: `https://www.google.com/maps/place/${contactData.location}` } });
                delete contactData.location;
            }

            info.createDiv({ cls: "contact-card-separator", text: '\u00A0' });

            // Display all other fields
            for (const k in contactData) {
                const el = container.find(`.contact-card-${k}`);
                if (!el) {
                    info.createDiv({ cls: `contact-card-${k}`, text: `${k}: ${contactData[k]}` });
                }
            }
        } catch (error) {
            this.renderError(el, error);
        }
    }

}

class ContactCardsSettingTab extends PluginSettingTab {
    plugin: ContactCardsPlugin;

    constructor(app: App, plugin: ContactCardsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('HTML template file')
            .setDesc('Provide an HTML template to override the default look of rendered contact cards.')
            .addText(text => text
                .setPlaceholder('Example: templates/Contact')
                .setValue(this.plugin.settings.htmlTemplate ?? '')
                .onChange(async (value) => {
                    this.plugin.settings.htmlTemplate = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Brandfetch client ID')
            .setDesc('Provide your Brandfetch Client ID for retrieving company logos')
            .addText(text => text
                .setPlaceholder('Brandfetch Client ID')
                .setValue(this.plugin.settings.brandfetchClientId ?? '')
                .onChange(async (value) => {
                    this.plugin.settings.brandfetchClientId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default country code')
            .setDesc('Specify your country code for phone number formatting.')
            .addText(text => text
                .setPlaceholder('US')
                .setValue(this.plugin.settings.defaultCountryCode)
                .onChange(async (value) => {
                    this.plugin.settings.defaultCountryCode = value;
                    await this.plugin.saveSettings();
                }));

    }
}

function emailDigest(email: string): string {
    return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}