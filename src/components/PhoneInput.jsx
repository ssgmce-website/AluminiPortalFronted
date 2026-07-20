import { memo } from 'react';
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Handle ES module / CommonJS interop for Vite bundler
const PhoneInputComponent = PhoneInput2.default || PhoneInput2;

/**
 * Optimized PhoneInput component using react-phone-input-2.
 * Wrapped in React.memo to prevent unnecessary re-renders when parent states change.
 */
const PhoneInput = ({ value, onChange, placeholder }) => {
  const handleChange = (val, countryData) => {
    // If value is empty, notify parent with an empty string
    if (!val) {
      onChange('', countryData);
      return;
    }
    // react-phone-input-2 values do not start with a '+' by default.
    // We prepend '+' so that parser libraries (like libphonenumber-js) can parse it correctly.
    const formatted = val.startsWith('+') ? val : `+${val}`;
    onChange(formatted, countryData);
  };

  return (
    <div className="flex-1 w-full relative">
      <PhoneInputComponent
        country="in"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        enableSearch={true}
        searchPlaceholder="Search country..."
        disableSearchIcon={true}
        containerClass="!w-full !h-full !border-0 !bg-transparent"
        inputClass="!w-full !h-full !border-0 !bg-transparent !py-3.5 !pl-14 !pr-4 !text-sm !text-gray-800 placeholder-gray-300 focus:!outline-none focus:!ring-0 focus:!border-transparent focus-visible:!outline-none"
        buttonClass="!border-0 !bg-transparent !h-full !px-3 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent"
        dropdownClass="!bg-white !shadow-xl !rounded-xl !border !border-gray-200 !text-gray-800 !text-sm !mt-1 !max-h-60"
        searchClass="!bg-white !px-3 !py-2 !border-b !border-gray-100 !text-sm"
      />
      {/* Dynamic styling overrides to cleanly integrate react-phone-input-2 with our premium form design */}
      <style>{`
        .react-tel-input .flag-dropdown {
          background-color: transparent !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .react-tel-input .flag-dropdown.open,
        .react-tel-input .flag-dropdown.open .selected-flag {
          background: transparent !important;
        }
        .react-tel-input .selected-flag:hover,
        .react-tel-input .selected-flag:focus {
          background-color: transparent !important;
        }
        .react-tel-input .country-list .country {
          padding: 8px 10px !important;
        }
        .react-tel-input .country-list .country-name {
          font-size: 13px !important;
          color: #1f2937 !important;
        }
        .react-tel-input .country-list .search-box {
          width: 90% !important;
          margin: 6px auto !important;
          padding: 6px 12px !important;
          border-radius: 6px !important;
          border: 1px solid #cbd5e1 !important;
          font-size: 13px !important;
        }
      `}</style>
    </div>
  );
};

export default memo(PhoneInput);
