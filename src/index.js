/**
 * Build styles
 */
import './index.css';

import { IconHtml } from '@codexteam/icons';

/**
 * Raw HTML Tool for CodeX Editor
 *
 * @author CodeX (team@codex.so)
 * @author David Fernández Sancho (dfernandez@maldita.es)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

/**
 *
 */
export default class RawTool {
  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Should this tool be displayed at the Editor's Toolbox
   *
   * @returns {boolean}
   * @public
   */
  static get displayInToolbox() {
    return true;
  }

  /**
   * Allow to press Enter inside the RawTool textarea
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: IconHtml,
      title: 'Raw HTML',
    };
  }

  /**
   * @typedef {object} RawData — plugin saved data
   * @param {string} html - previously saved HTML code
   * @property
   */

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {RawData} data — previously saved HTML data
   * @param {object} config - user config for Tool
   * @param {object} api - CodeX Editor API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;

    this.placeholder = config.placeholder || this.api.i18n.t('Enter HTML code');

    this.CSS = {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      wrapper: 'ce-rawtool',
      textarea: 'ce-rawtool__textarea',
    };

    this.data = {
      html: data.html || '',
    };

    this.mode = "html";
    this.textarea = null;
    this.renderDiv = null;
    this.resizeDebounce = null;
    this.switchButton = null;
    this.wrapper = null;
    this.updateRender = this.updateRender.bind(this);
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement} this.element - RawTool's wrapper
   * @public
   */
  render() {
    if (!this.wrapper) {
      this.wrapper = document.createElement('div');
    } else {
      while (this.wrapper.firstChild) {
        this.wrapper.removeChild(this.wrapper.firstChild);
      }
    }

    const renderingTime = 100;

    this.textarea = document.createElement('textarea');
    this.renderDiv = document.createElement('div');

    this.wrapper.classList.add(this.CSS.baseClass, this.CSS.wrapper);

    this.textarea.classList.add(this.CSS.textarea, this.CSS.input);
    this.textarea.textContent = this.data.html;
    this.textarea.placeholder = this.placeholder;

    this.renderDiv.classList.add(this.CSS.wrapper);

    this.switchButton = document.createElement('button');
    this.switchButton.textContent = this.mode === 'html' ? this.api.i18n.t('Switch to render mode') : this.api.i18n.t('Switch to HTML mode');
    this.switchButton.addEventListener('click', () => {
      this.switchMode();
    });

    // Add Event Listener for MouseOver
    this.switchButton.addEventListener('mouseover', function(){
      this.style.backgroundColor = 'whitesmoke';
    });

// Add Event Listener for MouseOut
    this.switchButton.addEventListener('mouseout', function(){
      this.style.backgroundColor = '#ffffff'; // Back to original color
    });

    // Add some inline styles to the button
    this.switchButton.style.backgroundColor = '#ffffff'; // White background
    this.switchButton.style.color = '#888'; // Gray text
    this.switchButton.style.borderRadius = '28px'; // Rounded corners
    this.switchButton.style.border = '1px solid #888'; // Gray border
    this.switchButton.style.padding = '5px 20px'; // Some padding
    this.switchButton.style.cursor = 'pointer';
    this.switchButton.style.outline = 'none'; // Remove focus outline
    this.switchButton.style.marginTop = '12px'; // Remove focus outline


    if (this.mode === 'html') {
      this.textarea.style.display = 'block';
      this.renderDiv.style.display = 'none';
    } else {
      this.textarea.style.display = 'none';
      this.renderDiv.style.display = 'block';
      this.updateRender();
    }

    // Always update this.data.html on input
    this.textarea.addEventListener('input', () => {
      this.data.html = this.textarea.value; // Store textarea's value
      this.onInput();
    });

    // Disable textarea only in read-only mode
    if (this.readOnly) {
      this.textarea.disabled = true;
    }

    this.wrapper.appendChild(this.textarea);
    this.wrapper.appendChild(this.renderDiv);
    this.wrapper.appendChild(this.switchButton);

    setTimeout(() => {
      this.resize();
    }, renderingTime);

    return this.wrapper;
  }

  switchMode() {
    this.mode = this.mode === 'html' ? 'render' : 'html';

    if (this.mode === 'render') {
      // Get all script tags from the HTML code
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(this.data.html, 'text/html');
      let scripts = htmlDoc.getElementsByTagName('script');

      for (let script of scripts) {
        // Create a new script tag
        let newScript = document.createElement('script');

        // Copy the attributes of the original script tag to the new one
        for (let attr of script.attributes) {
          newScript.setAttribute(attr.name, attr.value);
        }

        // If the script has inline code, also copy it to the new script tag
        if (script.textContent) {
          newScript.textContent = script.textContent;
        }

        // Append the new script tag to the renderDiv
        this.renderDiv.appendChild(newScript);
      }
    }

    this.render();
  }

  updateRender() {
    this.renderDiv.innerHTML = this.textarea.value;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLDivElement} rawToolsWrapper - RawTool's wrapper, containing textarea with raw HTML code
   * @returns {RawData} - raw HTML code
   * @public
   */
  save(rawToolsWrapper) {
    return {
      html: rawToolsWrapper.querySelector('textarea').value,
    };
  }

  /**
   * Automatic sanitize config
   */
  static get sanitize() {
    return {
      html: true, // Allow HTML tags
    };
  }

  /**
   * Textarea change event
   *
   * @returns {void}
   */
  onInput() {
    if (this.resizeDebounce) {
      clearTimeout(this.resizeDebounce);
    }

    this.resizeDebounce = setTimeout(() => {
      this.resize();
    }, 200);
  }

  /**
   * Resize textarea to fit whole height
   *
   * @returns {void}
   */
  resize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}
