import React, { useState } from "react";
import Fragen from "./components/Frage";
import Foerderung from "./components/Foerderung";
import { logo } from "./assets";

/**
 * Konvertiert die Antworten in das CSV-Format
 * @param {Object} answers - Die Antworten des Benutzers
 * @param {Array} questions - Die Fragenliste
 * @param {Array} ansprechpersonen - Die Ansprechpersonen
 * @returns {string} - Die CSV-Daten als String
 */
const convertToCSV = (answers, questions, ansprechpersonen) => {
  const rows = [];

  // Durchläuft alle Fragen und formatiert die Antworten für CSV
  questions.forEach((question) => {
    const answer = answers[question.id];

    let formattedAnswer = "";
    // Verarbeitet verschiedene Antworttypen (Objekte, Arrays, einfache Werte)
    if (typeof answer === "object") {
      if (Array.isArray(answer)) {
        formattedAnswer = answer
          .map((v) => v.option + (v.custom ? `: ${v.custom}` : ""))
          .join(" | ");
      } else {
        formattedAnswer = answer.option + (answer.custom ? `: ${answer.custom}` : "");
      }
    } else {
      formattedAnswer = answer || "";
    }

    rows.push(`"${question.label}","${formattedAnswer}"`);

    // Fügt Ansprechpersonen nach der Standort-Frage (ID 3) ein
    if (question.id === 3) {
      ansprechpersonen.forEach((person, index) => {
        rows.push(`"Ansprechperson ${index + 1}","${person.ansprechperson}"`);
        rows.push(`"Telefon ${index + 1}","${person.telefon}"`);
        rows.push(`"Email ${index + 1}","${person.email}"`);
      });
    }
  });

  return `"FRAGE","ANTWORT"\n` + rows.join("\n");
};

/**
 * Löst den Download der CSV-Datei aus
 * @param {string} csvData - Die CSV-Daten
 * @param {string} filename - Der Dateiname
 */
const downloadCSV = (csvData, filename = "umfrage.csv") => {
  const blob = new Blob([csvData], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Layout-Konfiguration für die verschiedenen Fragengruppen
const groups = {
  name: { layout: "horizontal" }, // Horizontale Anordnung
  kontakt: { layout: "horizontal" },
  ansprechperson: { layout: "horizontal" },
  standort: { layout: "vertical" }, // Vertikale Anordnung
  allgemein: { layout: "vertical" },
  Koop: { layout: "horizontal" },
  allgemein2: { layout: "vertical" },
};

// Definition aller Fragen mit Eigenschaften und Bedingungen
const questions = [
  {
    id: 1,
    type: "text",
    label: "Name der Einrichtung/ des Unternehmens:",
    required: true,
    group: "name", 
  },
  {
    id: 2,
    type: "text",
    label: "ggf. zugehörig zu: ",
    group: "name",
  },
  {
    id: 3,
    type: "text",
    label: "Standort:",
    group: "standort", 
  },

  {
    id: 7,
    type: "checkbox",
    label:
      "1. Zu welcher der nachfolgenden Kategorien zählen Sie Ihr Unternehmen/ Ihre Einrichtung? ",
    options: [
      "Start-Up",
      "KMU",
      "Großunternehmen",
      "Institut",
      "Hochschule/ Universität",
      "anderes, und zwar:",
    ],
    textInputOptions: ["anderes, und zwar:"],
    required: true,
    group: "allgemein", 
  },
  {
    id: 8,
    type: "checkbox",
    label:
      "2. Welchem Zweck der Biotechnologie ist Ihr Unternehmen/Ihre Arbeitsgruppe zuzuordnen?  ",
    options: [
      "Pflanzenbiotechnologie",
      "medizinische/ pharmazeutische Biotechnologie",
      "industrielle Biotechnologie",
      "Umweltbiotechnologie",
      "Biotechnologische Abfallwirtschaft",
      "Lebensmitteltechnologie",
      "anderes, und zwar:",
    ],
    textInputOptions: ["anderes, und zwar:"],
    required: true,
    group: "allgemein",
  },
  {
    id: 9,
    type: "checkbox",
    label:
      "3. In welchem Bereich sind Sie tätig? /Welches ist das Hauptgeschäft ihres Unternehmens?",
    options: [
      "biotechnologische Forschung",
      "biotechnologische Dienstleistung",
      "biotechnologische Produktion",
      "Zulieferer/ Produzent für biotechnologische Unternehmen",
      "Dienstleister für biotechnologische Unternehmen",
      "anderes, und zwar:",
    ],
    required: true,
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein", 
  },
  {
    id: 10,
    type: "text",
    label:
      "4. Mit welchen Stichworten würden Sie die Kompetenzen Ihres Unternehmens/Ihrer Arbeitsgruppe beschreiben?",
    placeholder: "z.B. Bioprozesstechnik, Forschung, Produktion,...",
    required: true,
    group: "allgemein",
  },
  {
    id: 11,
    type: "radio",
    label: "5. Betreiben Sie Forschung?",
    options: ["Ja", "Nein"],
    required: true,
    group: "allgemein", 
  },
  {
    id: 12,
    type: "checkbox",
    label:
      "Auf welche Finanzierungsmöglichkeiten haben Sie bereits zurückgegriffen? (Mehrfachnennung möglich)",
    options: [
      "Eigenfinanzierung",
      "Förderung durch das Land NRW",
      "Förderung durch den Bund (z.B. BMBF, BMWK)",
      "Förderung durch die EU (z.B. EFRE)",
      "Förderung durch Forschungsgemeinschaften/Vereine (z.B. DFG)",
      "Förderung durch Unternehmen",
      "anderes, und zwar:",
    ],
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein",
    condition: (answers) => answers[11]?.option === "Ja", // Nur anzeigen, wenn Frage 11 mit "Ja" beantwortet wurde
  },
  {
    id: 13,
    type: "radio",
    label: "6.  Wie viele Mitarbeitende sind in Ihrem Unternehmen beschäftigt?",
    options: ["unter 10", "10-49", "50-249", "mehr als 250"],
    group: "allgemein", 
  },
  {
    id: 14,
    type: "radio",
    label:
      "7. Wie beurteilen Sie die Möglichkeiten in der Region Westfalen/Ruhrgebiet Arbeitskräfte zu gewinnen?",
    options: [
      "Sehr gut",
      "gut",
      "eher gut",
      "eher schlecht",
      "schlecht",
      "Sehr schlecht",
    ],
    group: "allgemein", 
  },
  {
    id: 15,
    type: "checkbox",
    label:
      "In welchem Bereich gibt es Schwierigkeiten bei der Gewinnung von Arbeitskräften?",
    options: [
      "Hochschul-/Universitätsabsolventen mit biotechnologischem Bezug",
      "Hochschul-/Universitätsabsolventen anderer Fachrichtungen, und zwar:",
      "Arbeitskräfte mit Berufsausbildung mit biotechnologischem Bezug",
      "Arbeitskräfte mit Berufsausbildung anderer Fachrichtungen, und zwar:",
      "anderes, und zwar:",
    ],
    textInputOptions: [
      "Hochschul-/Universitätsabsolventen anderer Fachrichtungen, und zwar:",
      "Arbeitskräfte mit Berufsausbildung anderer Fachrichtungen, und zwar:",
      "anderes, und zwar:",
    ],
    group: "allgemein", 
    condition: (answers) =>
      ["eher schlecht", "schlecht", "Sehr schlecht"].includes(
        answers[14]?.option
      ),
  },
  {
    id: 16,
    type: "number",
    label:
      "8. Welches Jahr wurde Ihr Unternehmen gegründet? Bzw. Wann wurde der Standort eröffnet?",
    group: "allgemein",
  },
  {
    id: 17,
    type: "radio",
    label:
      "9. <strong>Für Unternehmen:</strong></br>Ist das Unternehmen eine Ausgründung aus einem anderen Unternehmen/ einem Institut/ einer Hochschule?",
    options: [
      "Ja, einer Hochschule",
      "Ja, einem Institut",
      "Ja, einem anderen Unternehmen",
      "Nein, Neugründung",
    ],
    group: "allgemein",
  },
  {
    id: 18,
    type: "radio",
    label:
      "10.  Wurde Ihr Unternehmen/ Institut innerhalb der letzten 15 Jahre gegründet?",
    options: ["Ja", "Nein"],
    group: "allgemein",
  },
  {
    id: 19,
    type: "checkbox",
    label:
      "10a. Welche Finanzierungsmöglichkeiten haben Sie bei der Gründung genutzt? (Mehrfachnennung möglich)",
    options: [
      "privates Kapital",
      "öffentliche Förderung",
      "Privatinvestoren (Business Angels)",
      "Wagniskapitalfinanzierer (Venture Capital)",
      "Crowdfunding",
      "anderes, und zwar:",
    ],
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein",
    condition: (answers) => ["Ja"].includes(answers[18]?.option),
  },
  {
    id: 20,
    type: "radio",
    label:
      "10b.  Haben Sie weitere Unterstützungsangebote z.B. in Form von Beratung/ Seminaren während der Gründung genutzt?",
    options: ["Ja", "Nein"],
    group: "allgemein",
    condition: (answers) => ["Ja"].includes(answers[18]?.option),
  },
  {
    id: 21,
    type: "checkbox",
    label: "Ja, und zwar von:",
    options: [
      "einer Hochschule/Universität",
      "einem Technologiezentrum",
      "einer Wirtschaftsförderungsgesellschaft",
      "der IHK",
      "der Gründerhilfe-NRW",
      "einem STARTERCENTER NRW",
      "anderes, und zwar:",
    ],
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein",
    condition: (answers) => ["Ja"].includes(answers[20]?.option),
  },
  {
    id: 22,
    type: "text",
    label:
      "10c. Hätten Sie sich weitere Unterstützung gewünscht? Wenn ja, welche?",
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein",
    condition: (answers) => ["Ja"].includes(answers[18]?.option),
  },
  {
    id: 23,
    type: "checkbox",
    label:
      "10d.  Welche Faktoren waren bei der Auswahl des Standortes im Ruhrgebiet/ Westfalen relevant? (Mehrfachnennung möglich)",
    options: [
      "Vorhandene Infrastruktur (Ver- und Entsorgungseinrichtungen aller Art)",
      "Verkehrsinfrastruktur",
      "digitale Infrastruktur",
      "Höhe der Energiekosten",
      "Sicherheit bei der Energieversorgung",
      "Verfügbarkeit von Gewerbe- und Industrieflächen",
      "Nähe zu Zulieferern",
      "Nähe zu Abnehmern/Absatzmarkt",
      "Nähe zu anderen Unternehmen der Branche",
      "Nähe zu Hochschulen, Fachhochschulen, Instituten",
      "Höhe der Steuern und Abgaben",
      "Umweltschutzauflagen",
      "Möglichkeiten der öffentlichen Förderung",
      "Verfügbarkeit von Fachkräften",
      "Persönliche Gründe (z.B. Wohn- und Freizeitwert der Gegend)",
      "anderes, und zwar:",
      "Ich kann die Frage nicht beantworten",
    ],
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein",
    condition: (answers) => ["Ja"].includes(answers[18]?.option)
  },
  {
    id: 24,
    type: "checkbox",
    label:
      "11. Wie wichtig ist die Zusammenarbeit mit Kooperationspartnern (Bildungs-/ Forschungseinrichtungen, Unternehmen) für Ihre Arbeit?",
    options: [],
    group: "allgemein",
  },
  {
    id: 25,
    type: "radio",
    label: "In der Region:",
    options: ["sehr wichtig", "wichtig", "eher unwichtig"],
    group: "Koop",
  },
  {
    id: 26,
    type: "radio",
    label: "In Deutschland:",
    options: ["sehr wichtig", "wichtig", "eher unwichtig"],
    group: "Koop",
  },
  {
    id: 27,
    type: "radio",
    label: "Weltweit:",
    options: ["sehr wichtig", "wichtig", "eher unwichtig"],
    group: "Koop",
  },
  {
    id: 28,
    type: "radio",
    label:
      "12.	Haben Sie in der Vergangenheit schon erfolgreich mit Bildungs-/ Forschungseinrichtungen oder Unternehmen zusammengearbeitet? Können Sie ein Beispielprojekt nennen, das als positives Beispiel in unserer Studie erwähnt werden könnte?",
    options: ["Ja", "Nein"],
    group: "allgemein2",
  },
  {
    id: 29,
    type: "text",
    label: "Erläuterung",
    group: "allgemein2",
    condition: (answers) => ["Ja"].includes(answers[28]?.option),
  },
  {
    id: 30,
    type: "radio",
    label:
      "Hätte es dieses Projekt in Ihrem Unternehmen auch gegeben, wenn es die Zusammenarbeit mit dem Projektpartner nicht gegeben hätte? (Einschätzung)",
    options: ["Nein", "Eher nein", "Eher Ja", "Ja"],
    group: "allgemein2",
    condition: (answers) => ["Ja"].includes(answers[28]?.option),
  },
  {
    id: 31,
    type: "text",
    label: "Wie ist die Zusammenarbeit für dieses Projekt zustande gekommen?",
    group: "allgemein2",
    condition: (answers) => ["Ja"].includes(answers[28]?.option),
  },
  {
    id: 32,
    type: "checkbox",
    label:
      "13.  Sind Sie aktuell auf der Suche nach Kooperationspartnern mit spezifischen Kompetenzen oder technischer Ausstattung im Bereich Bioprozesstechnik/ Downstreamprocessing?",
    options: [
      "Nein, weil:",
      "Ja, und zwar nach folgenden Kompetenzen:",
      "Ja, und zwar nach folgender Technik:",
      "Ja, und zwar nach: ",
    ],
    textInputOptions: [
      "Nein, weil:",
      "Ja, und zwar nach folgenden Kompetenzen:",
      "Ja, und zwar nach folgender Technik:",
      "Ja, und zwar nach: ",
    ],
    group: "allgemein2",
  },
  {
    id: 33,
    type: "checkbox",
    label:
      "14.  Würden Sie in einem dieser Bereiche Beratung z.B. für Start-Ups, Gründer anbieten können?",
    options: [
      "Wissenschaftliche Fragestellungen",
      "Prozessführung und Analytik",
      "Qualifizierung und Validierung",
      "Fördermöglichkeiten und Investoren",
      "weiteres, und zwar:",
    ],
    textInputOptions: ["weiteres, und zwar:"],
    group: "allgemein2",
  },
  {
    id: 34,
    type: "radio",
    label:
      "15.  Sind Sie/ Ihr Unternehmen Mitglied in einem Netzwerk mit biotechnologischem Schwerpunkt?",
    options: ["Ja", "Nein"],
    group: "allgemein2",
  },
  {
    id: 35,
    type: "checkbox",
    label: "In welchen?",
    options: [
      "CLIB",
      "DECHEMA",
      "BioDeutschland/BioRegionen",
      "GDCh",
      "Bio.NRW",
      "BioIndustry e.V.",
      "BioRiver",
      "Förderverein Biotechnologie NRW e.V.",
      "Bioanalytik Münster e.V.",
      "anderes, und zwar:",
    ],
    textInputOptions: ["anderes, und zwar:"],
    group: "allgemein2",
    condition: (answers) => ["Ja"].includes(answers[34]?.option),
  },
  {
    id: 36,
    type: "checkbox",
    label:
      "16.  Wir untersuchen zurzeit den Bedarf einer lokalen Altgeräte-Börse speziell für Laborgeräte. Wäre eine solche lokale Altgeräte-Börse für Ihre Arbeitsgruppe/ Ihr Unternehmen interessant?",
    options: [
      "Ja, für den Verkauf von Geräten",
      "Ja, für den Ankauf von Geräten",
      "Ja, für Angebote als Dauerleihgabe ",
      "Ja, für Ausleihe von Dauerleihgaben",
      "Nein",
    ],
    group: "allgemein2",
  },
  {
    id: 37,
    type: "radio",
    label:
      "17.  Haben Sie Kontakt zu anderen biotechnologischen Unternehmen/ Instituten in NRW, die Interesse an einer Vernetzung und/oder am Geräte-Sharing haben könnten?",
    options: ["Ja, und zwar:", "Nein"],
    textInputOptions: ["Ja, und zwar:"],
    group: "allgemein2",
  },
  {
    id: 38,
    type: "radio",
    label:
      "18. Gibt es in Ihrem Unternehmen Überlegungen etablierte chemische Prozesse auf biologische Prozesse umzustellen oder neue biologische Prozesse aufzubauen?",
    options: ["Ja", "Nein"],
    group: "allgemein2",
  },
  {
    id: 39,
    type: "text",
    label: "Erläuterung",
    group: "allgemein2",
    condition: (answers) => ["Ja", "Nein"].includes(answers[38]?.option),
  },
  {
    id: 40,
    type: "radio",
    label:
      "19. Hätten Sie Interesse an Unterstützungsangeboten, um Potenziale zur Biologisierung von Prozessen zu identifizieren und/ oder umzusetzen?",
    options: [
      "Ja, an individuellen Beratungsangeboten",
      "Ja, an Kooperationsprojekten mit Hochschulen/ Universitäten",
      "Ja, an themenbetogenen Branchentreffs",
      "anderes, und zwar: ",
      "Nein",
    ],
    textInputOptions: ["anderes, und zwar: "],
    group: "allgemein2",
  },
];

// Hauptkomponente der Anwendung
function App() {
  // State für die Antworten und Ansprechpersonen
  const [answers, setAnswers] = useState({});
  const [ansprechpersonen, setAnsprechpersonen] = useState([
    { id: 1, ansprechperson: "", telefon: "", email: "" },
  ]);

  /**
   * Fügt eine neue Ansprechperson hinzu
   */
  const handleAddAnsprechperson = () => {
    setAnsprechpersonen((prev) => [
      ...prev,
      { id: prev.length + 1, ansprechperson: "", telefon: "", email: "" },
    ]);
  };

  /**
   * Entfernt die letzte Ansprechperson
   */
  const handleRemoveAnsprechperson = () => {
    setAnsprechpersonen((prev) => prev.slice(0, -1));
  };

  /**
   * Aktualisiert die Daten einer Ansprechperson
   * @param {number} id - Die ID der Ansprechperson
   * @param {string} field - Das zu ändernde Feld
   * @param {string} value - Der neue Wert
   */
  const handleAnsprechpersonChange = (id, field, value) => {
    setAnsprechpersonen((prev) =>
      prev.map((person) =>
        person.id === id ? { ...person, [field]: value } : person
      )
    );
  };

  /**
   * Validiert die Antworten auf erforderliche Fragen
   * @param {Object} answers - Die Antworten
   * @param {Array} questions - Die Fragen
   * @returns {Array} - Liste der Fehlermeldungen
   */
  const validateAnswers = (answers, questions) => {
    const errors = [];

    questions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];

        // Überprüft verschiedene Antworttypen
        if (answer === undefined || answer === null || answer === "") {
          errors.push(`Frage "${question.label}" ist erforderlich`);
        } else if (typeof answer === "object") {
          if (Array.isArray(answer) && answer.length === 0) {
            errors.push(`Frage "${question.label}" ist erforderlich`);
          } else if (!Array.isArray(answer) && !answer.option) {
            errors.push(`Frage "${question.label}" ist erforderlich`);
          }
        }
      }
    });

    return errors;
  };

  /**
   * Behandelt das Formular-Submit
   * @param {Event} e - Das Submit-Event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateAnswers(answers, questions);
    if (validationErrors.length > 0) {
      alert(
        `Bitte beantworten Sie alle erforderlichen Fragen:\n\n${validationErrors.join("\n")}`
      );
      return;
    }

    const csvData = convertToCSV(answers, questions, ansprechpersonen);
    downloadCSV(csvData);
    alert(
      "Die Umfrage wurde abgeschickt und die CSV-Datei wurde heruntergeladen."
    );
  };

  // Gruppiert die Fragen nach ihren Gruppen
  const groupedQuestions = questions.reduce((acc, question) => {
    const group = question.group || "ungrouped";
    acc[group] = acc[group] || [];
    acc[group].push(question);
    return acc;
  }, {});

  // Reihenfolge der Fragengruppen
  const groupOrder = [
    "name",
    "standort",
    "ansprechperson",
    "kontakt",
    "allgemein",
    "Koop",
    "allgemein2",
  ];

  return (
    <>
      <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Logo" />
          </div>
          <h2 className="text-4xl text-black font-medium mb-6 text-center">
            Kompetenzstudie Ruhr/Westfalen
          </h2>
          
          {/* Hauptformular */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {groupOrder.map((group) => (
              <div
                key={group}
                className={
                  groups[group]?.layout === "horizontal"
                    ? "flex space-x-4"
                    : "space-y-4"
                }
              >
                {groupedQuestions[group]?.map((question) => {
                  // Überspringt Fragen, deren Bedingung nicht erfüllt ist
                  if (question.condition && !question.condition(answers)) {
                    return null;
                  }

                  // Spezielle Behandlung für Ansprechpersonen (nach Frage ID 3)
                  if (question.id === 3) {
                    return (
                      <React.Fragment key={question.id}>
                        {/* Standort-Frage */}
                        <div className={groups[group]?.layout === "horizontal" ? "flex-1" : ""}>
                          <Fragen
                            question={question}
                            value={answers[question.id] || ""}
                            onChange={(value) =>
                              setAnswers({ ...answers, [question.id]: value })
                            }
                          />
                        </div>

                        {/* Dynamische Ansprechpersonen-Felder */}
                        {ansprechpersonen.map((person) => (
                          <div key={person.id} className="space-y-4">
                            {/* Ansprechperson */}
                            <Fragen
                              question={{
                                id: `ansprechperson-${person.id}`,
                                type: "text",
                                label: "Ansprechperson:",
                              }}
                              value={person.ansprechperson}
                              onChange={(value) =>
                                handleAnsprechpersonChange(
                                  person.id,
                                  "ansprechperson",
                                  value
                                )
                              }
                            />
                            
                            {/* Telefon und Email nebeneinander */}
                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <Fragen
                                  question={{
                                    id: `telefon-${person.id}`,
                                    type: "text",
                                    label: "Telefon:",
                                  }}
                                  value={person.telefon}
                                  onChange={(value) =>
                                    handleAnsprechpersonChange(
                                      person.id,
                                      "telefon",
                                      value
                                    )
                                  }
                                />
                              </div>
                              <div className="flex-1">
                                <Fragen
                                  question={{
                                    id: `email-${person.id}`,
                                    type: "text",
                                    label: "Email:",
                                  }}
                                  value={person.email}
                                  onChange={(value) =>
                                    handleAnsprechpersonChange(
                                      person.id,
                                      "email",
                                      value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Buttons für neue Ansprechperson*/}
                        <button
                          type="button"
                          onClick={handleAddAnsprechperson}
                          className="w-full bg-[#152a49] text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Weitere Ansprechperson hinzufügen
                        </button>

                        {ansprechpersonen.length > 1 && (
                          <div className="flex justify-evenly">
                            {/* Buttons für löschen der letzten Ansprechperson*/}
                            <button
                              type="button"
                              onClick={handleRemoveAnsprechperson}
                              className="w-xl bg-red-700 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 "
                            >
                              Letzte Ansprechperson entfernen
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  }
                  
                  // Standard-Fragenanzeige
                  return (
                    <div
                      key={question.id}
                      className={groups[group]?.layout === "horizontal" ? "flex-1" : ""}
                    >
                      <Fragen
                        question={question}
                        value={answers[question.id] || ""}
                        onChange={(value) =>
                          setAnswers({ ...answers, [question.id]: value })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Submit-Button */}
            <button
              type="submit"
              className="w-full bg-[#152a49] text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Abschicken
            </button>
          </form>
        </div>
      </div>
      
      {/* FoerderLogos Komponente */}
      <div>
        <Foerderung></Foerderung>
      </div>
    </>
  );
}

export default App;