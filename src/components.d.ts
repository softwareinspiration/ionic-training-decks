/**
 * This is an autogenerated file created by the Stencil build process.
 * It contains typing information for all components that exist in this project
 * and imports for stencil collections that might be configured in your stencil.config.js file
 */

import '@stencil/router';


import {
  AppMarkdown as AppMarkdown
} from './components/app-markdown/app-markdown';

declare global {
  interface HTMLAppMarkdownElement extends AppMarkdown, HTMLElement {
  }
  var HTMLAppMarkdownElement: {
    prototype: HTMLAppMarkdownElement;
    new (): HTMLAppMarkdownElement;
  };
  interface HTMLElementTagNameMap {
    "app-markdown": HTMLAppMarkdownElement;
  }
  interface ElementTagNameMap {
    "app-markdown": HTMLAppMarkdownElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      "app-markdown": JSXElements.AppMarkdownAttributes;
    }
  }
  namespace JSXElements {
    export interface AppMarkdownAttributes extends HTMLAttributes {
      path?: string;
    }
  }
}


import {
  AppMenu as AppMenu
} from './components/app-menu/app-menu';

declare global {
  interface HTMLAppMenuElement extends AppMenu, HTMLElement {
  }
  var HTMLAppMenuElement: {
    prototype: HTMLAppMenuElement;
    new (): HTMLAppMenuElement;
  };
  interface HTMLElementTagNameMap {
    "app-menu": HTMLAppMenuElement;
  }
  interface ElementTagNameMap {
    "app-menu": HTMLAppMenuElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      "app-menu": JSXElements.AppMenuAttributes;
    }
  }
  namespace JSXElements {
    export interface AppMenuAttributes extends HTMLAttributes {
      lab?: string;
      menu?: any;
    }
  }
}

