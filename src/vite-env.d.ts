/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }

  namespace google {
    namespace maps {
      namespace places {
        class Autocomplete {
          constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
          addListener(eventName: string, handler: () => void): any;
          getPlace(): PlaceResult;
        }

        interface AutocompleteOptions {
          types?: string[];
          componentRestrictions?: { country: string };
          fields?: string[];
        }

        interface PlaceResult {
          address_components?: AddressComponent[];
          formatted_address?: string;
          place_id?: string;
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }
      }

      namespace event {
        function removeListener(listener: any): void;
      }
    }
  }
}

export {}
