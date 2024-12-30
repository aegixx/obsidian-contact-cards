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
            let html = `
                <div class="contact-card-content">
                    <div class="contact-card">
                        <a href="https://www.linkedin.com/search/results/people/?keywords={{name}}">
                            <img src="{{photo_url}}" class="contact-card-photo" />
                        </a>
                        <a href="https://www.linkedin.com/search/results/companies/?keywords={{company}}">
                            <img src="{{logo_url}}" class="contact-card-logo contact-card-hidden"" />
                        </a>
                        <div class="contact-card-info">
                            <div class="contact-card-name">{{name}}</div>
                            <div class="contact-card-title contact-card-hidden"">{{title}}</div>
                            <div class="contact-card-separator">&nbsp;</div>
                            <div class="contact-card-company contact-card-hidden"">
                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M14 0H2V16H6V12H10V16H14V0ZM5 3H7V5H5V3ZM7 7H5V9H7V7ZM9 3H11V5H9V3ZM11 7H9V9H11V7Z" fill="#000000"></path> </g></svg>
                                {{company}}
                            </div>
                            <div class="contact-card-email contact-card-hidden"">
                                <svg viewBox="0 -2.5 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>email [#1572]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-340.000000, -922.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M294,774.474 L284,765.649 L284,777 L304,777 L304,765.649 L294,774.474 Z M294.001,771.812 L284,762.981 L284,762 L304,762 L304,762.981 L294.001,771.812 Z" id="email-[#1572]"> </path> </g> </g> </g> </g></svg>
                                <a href="mailto:{{email}}">{{email}}</a>
                            </div>
                            <div class="contact-card-phone contact-card-hidden">
                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1 5V1H7V5L4.5 7.5L8.5 11.5L11 9H15V15H11C5.47715 15 1 10.5228 1 5Z" fill="#000000"></path> </g></svg>
                                <a href="tel:{{phone}}">{{phone}}</a>
                            </div>
                            <div class="contact-card-location contact-card-hidden">
                                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 293.334 293.334" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path style="fill:#010002;" d="M146.667,0C94.903,0,52.946,41.957,52.946,93.721c0,22.322,7.849,42.789,20.891,58.878 c4.204,5.178,11.237,13.331,14.903,18.906c21.109,32.069,48.19,78.643,56.082,116.864c1.354,6.527,2.986,6.641,4.743,0.212 c5.629-20.609,20.228-65.639,50.377-112.757c3.595-5.619,10.884-13.483,15.409-18.379c6.554-7.098,12.009-15.224,16.154-24.084 c5.651-12.086,8.882-25.466,8.882-39.629C240.387,41.962,198.43,0,146.667,0z M146.667,144.358 c-28.892,0-52.313-23.421-52.313-52.313c0-28.887,23.421-52.307,52.313-52.307s52.313,23.421,52.313,52.307 C198.98,120.938,175.559,144.358,146.667,144.358z"></path> <circle style="fill:#010002;" cx="146.667" cy="90.196" r="21.756"></circle> </g> </g> </g></svg>
                                <a href="https://www.google.com/maps/place/{{location}}">{{location}}</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // If they provide their own template, use that
            if (this.settings.htmlTemplate) {
                const templateFile = this.app.vault.getAbstractFileByPath(this.settings.htmlTemplate);
                if (templateFile instanceof TFile) {
                    const templateContent = await this.app.vault.cachedRead(templateFile);
                    html = templateContent;
                } else {
                    throw new Error(`${this.settings.htmlTemplate} is not a Template file`);
                }
            }

            // Always parse images (since the img tag will still try to render)
            let photoUrl = contactData.photo_url;
            if (!photoUrl) {
                // Only use Gravatar if a photo_url was not provided
                const emailHash = emailDigest(contactData.email ?? '');
                photoUrl = `https://gravatar.com/avatar/${emailHash}.jpg?s=120&d=mp`;
            }
            html = html.replace(/{{photo_url}}/g, photoUrl);

            let logoUrl = contactData.logo_url;
            if (!logoUrl && contactData.email) {
                // Only use Brandfetch if a logo_url was not provided
                const emailDomain = contactData.email.slice(contactData.email.indexOf('@') + 1).toLowerCase();
                logoUrl = `https://cdn.brandfetch.io/${emailDomain}/w/100/h/100?c=${this.settings.brandfetchClientId}`;
            }
            html = html.replace(/{{logo_url}}/g, logoUrl ?? '');

            // Populate variables
            for (const k in contactData) {
                switch (k) {
                    case 'phone': {
                        const phoneUtil = PhoneNumberUtil.getInstance();
                        const phoneNum = phoneUtil.parse(contactData.phone.toString(), this.settings.defaultCountryCode);
                        const regionCode = phoneUtil.getRegionCodeForNumber(phoneNum);
                        html = html.replace(/{{phone}}/g, phoneUtil.format(phoneNum, regionCode === this.settings.defaultCountryCode ? PhoneNumberFormat.NATIONAL : PhoneNumberFormat.INTERNATIONAL));
                        break;
                    }

                    default:
                        html = html.replace(new RegExp(`{{${k}}}`, 'g'), contactData[k]);
                }
            }

            container.innerHTML = html;

            // Unhide all elements that are present
            for (const k in contactData) {
                container.find(`.contact-card-${k}`)?.removeClass('contact-card-hidden');

                if (k === 'company') {
                    container.find('.contact-card-logo')?.removeClass('contact-card-hidden');
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