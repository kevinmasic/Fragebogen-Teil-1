import React, { useState, useRef, useEffect } from "react";

// Komponente für automatisch wachsende Textareas
const AutoResizingTextInput = ({ value, onChange, ...props }) => {
  const textareaRef = useRef(null);
  
  // Passt die Höhe der Textarea bei Änderungen des Werts automatisch an
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      rows={1}
      style={{ minHeight: "2.5rem" }}
      className="resize-none overflow-hidden block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
      {...props}
    />
  );
};

// Hauptkomponente für die Darstellung verschiedener Fragetypen
const Frage = ({ question, value, onChange }) => {
  const [customInputs, setCustomInputs] = useState({});
  // Sichert die Verwendung von Arrays für Checkbox-Werte
  const safeValue = Array.isArray(value) ? value : [];

  // Verarbeitet Änderungen an benutzerdefinierten Eingabefeldern
  const handleCustomInputChange = (option, text) => {
    setCustomInputs((prev) => ({ ...prev, [option]: text }));

    if (question.type === "radio") {
      // Für Radio-Buttons wird nur eine Option gespeichert
      onChange({ option, custom: text });
    } else if (question.type === "checkbox") {
      // Für Checkboxen werden mehrere Optionen aktualisiert
      const updatedValue = safeValue.map((v) =>
        v.option === option ? { ...v, custom: text } : v
      );
      onChange(updatedValue);
    }
  };

  // Rendert unterschiedliche Fragetypen basierend auf question.type
  switch (question.type) {
    case "text":
      return (
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            dangerouslySetInnerHTML={{ __html: question.label }} 
          ></label>
          <AutoResizingTextInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
          />
        </div>
      );
    case "number":
      return (
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            dangerouslySetInnerHTML={{ __html: question.label }}
          ></label>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
          />
        </div>
      );
    case "radio":
      return (
        <div>
          <label
            className="block text-[15px] font-medium text-gray-700"
            dangerouslySetInnerHTML={{ __html: question.label }}
          ></label>
          <div className="mt-1 mb-5 space-y-2">
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={value?.option === option}
                  onChange={() => onChange({ option })}
                  required={question.required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-black">{option}</span>
                {question.textInputOptions?.includes(option) && (
                  <input
                    type="text"
                    value={customInputs[option] || ""}
                    onChange={(e) => handleCustomInputChange(option, e.target.value)}
                    className="ml-2 text-sm px-2 py-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-96 text-black placeholder-gray-400"
                    placeholder="Bitte angeben..."
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div>
          <label
            className="block text-[15px] font-medium text-gray-700"
            dangerouslySetInnerHTML={{ __html: question.label }}
          ></label>
          <div className="mt-1 mb-5 space-y-2">
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={safeValue.some((v) => v.option === option)}
                  onChange={(e) => {
                    let newValue;
                    if (e.target.checked) {
                      newValue = [...safeValue, { option }];
                    } else {
                      // Entfernt nicht-aktive Checkboxen und deren Custom-Input
                      newValue = safeValue.filter((v) => v.option !== option);
                      setCustomInputs((prev) => {
                        const updated = { ...prev };
                        delete updated[option];
                        return updated;
                      });
                    }
                    onChange(newValue);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-black">{option}</span>
                {question.textInputOptions?.includes(option) && (
                  <input
                    type="text"
                    value={customInputs[option] || ""}
                    onChange={(e) => handleCustomInputChange(option, e.target.value)}
                    disabled={!safeValue.some((v) => v.option === option)}
                    className="ml-2 text-sm px-2 py-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-96 text-black placeholder-gray-400"
                    placeholder="Bitte angeben..."
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Frage;