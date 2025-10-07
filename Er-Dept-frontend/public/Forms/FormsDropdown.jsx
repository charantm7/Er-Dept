import React, { useMemo, useState, useRef, useEffect } from "react";

// Utility to import all files from Forms directory (images/PDFs)
// Supported: png, jpg, jpeg, webp, pdf
const useFormsList = () => {
  // require.context is available in CRA (react-scripts)
  let forms = [];
  try {
    const ctx = require.context("./", false, /\.(png|jpe?g|webp|pdf)$/i);
    forms = ctx.keys().map((key) => {
      const url = ctx(key);
      // key like './My Form Name.png' → 'My Form Name'
      const fileName = key.replace("./", "");
      const name = fileName.replace(/\.[^.]+$/, "");
      return { name, url };
    });
  } catch (e) {
    // No forms found; leave empty
    forms = [];
  }
  // Sort by name for stable order
  return useMemo(() => forms.sort((a, b) => a.name.localeCompare(b.name)), []);
};

const FormsDropdown = () => {
  const [open, setOpen] = useState(false);
  const forms = useFormsList();
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpen = () => setOpen((v) => !v);
  const handleOpenForm = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="btn-primary">
        Forms
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {forms.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No forms found</div>
          ) : (
            <ul className="py-1">
              {forms.map((f) => (
                <li key={f.name}>
                  <button
                    onClick={() => handleOpenForm(f.url)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    title={f.name}
                  >
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FormsDropdown;
