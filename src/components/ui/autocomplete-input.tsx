import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ParsedPlace {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  formattedAddress: string;
  placeId: string;
}

interface AutocompleteInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: ParsedPlace) => void;
  countryRestriction?: string;
}

export const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ value, onChange, onPlaceSelected, countryRestriction = "in", className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);

    useEffect(() => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      // Initialize autocomplete
      const googleMaps = window.google.maps;
      autocompleteRef.current = new googleMaps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: countryRestriction },
        fields: ["address_components", "formatted_address", "place_id"],
      });

      // Listen for place selection
      const listener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.address_components) return;

        const parsed = parseAddressComponents(place);
        onPlaceSelected(parsed);
      });

      return () => {
        if (listener && window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener);
        }
      };
    }, [countryRestriction, onPlaceSelected]);

    const parseAddressComponents = (place: any): ParsedPlace => {
      const components = place.address_components || [];
      
      let street = "";
      let city = "";
      let state = "";
      let zip = "";
      let country = "";

      components.forEach((component) => {
        const types = component.types;

        if (types.includes("street_number")) {
          street = component.long_name + " ";
        }
        if (types.includes("route")) {
          street += component.long_name;
        }
        if (types.includes("sublocality_level_1") || types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (types.includes("postal_code")) {
          zip = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
      });

      return {
        street: street.trim() || "",
        city: city || "",
        state: state || "",
        zip: zip || "",
        country: country || "",
        formattedAddress: place.formatted_address || "",
        placeId: place.place_id || "",
      };
    };

    return (
      <Input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(className)}
        autoComplete="off"
        {...props}
      />
    );
  }
);

AutocompleteInput.displayName = "AutocompleteInput";
