import createLogger from "logging";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "fs/promises";

const logger = createLogger( "gemini-service" );

/** Wert im Bereich von 0.0 bis 2.0, höher = kreativer, niedriger = fokussierter. */
const TEMPERATUR = 0.7;

/** Zentrales API-Objekt für den Zugriff auf die Gemini-API. */
let geminiApiObjekt = null;

/** KI-Modell, z.B. "gemini-3.1-flash-lite"; kann über Umgebungsvariablen konfiguriert werden. */
let geminiModell = "";


/**
 * Gemini-API initialisieren.
 *
 * @param {*} geminiApiKey API-Key für Gemini-Zugriff
 *
 * @param {*} geminiModellName Modellname, z.B. "gemini-3.1-flash-lite"
 */
export function initialisiereGeminiApi( geminiApiKey, geminiModellName ) {

    geminiApiObjekt = new GoogleGenAI({apiKey: geminiApiKey});
    geminiModell    = geminiModellName;

    logger.info(
        `Gemini-API initialisiert mit Modell "${geminiModell}" und Temperatur=${TEMPERATUR}.` );
}


/**
 * Eigentliche Gemini-Anfrage für die Erzeugung von Antwortoptionen.
 *
 * @param {string} frage Single-Choice-Frage, zu der eine richtige und
 *                       drei falsche Antworten generiert werden sollen.
 *
 * @return {Promise<string[]>} Array mit vier Antwortoptionen, wobei die
 *                             erste Option die richtige Antwort ist und die
 *                             drei folgenden Optionen falsche Antworten sind.
 */
export async function erzeugeAntwortenoptionenMitGemini( frage ) {

    const frageTrimmed = frage.trim();

    // Wegen Zustandslosigkeit der Gemini-API wird der Prompt jedes Mal komplett mitgeschickt
    const prompt = `
          Gib genau 4 Antwortoptionen zur folgenden Frage zurück.

          WICHTIGES AUSGABEFORMAT:
          - Antworte ausschließlich als gültiges JSON.
          - Kein Markdown, keine Backticks, keine Einleitung, kein Fließtext.
          - Genau dieses Schema verwenden:
          {
            "richtigeAntwort": "string",
            "falscheAntworten": ["string", "string", "string"]
          }
          - "falscheAntworten" muss genau 3 Einträge enthalten.
          - Alle Antworten kurz und stichpunktartig (nur Text, keine Nummerierung).

          Frage: ${frageTrimmed}`;

    const geminiAnfrageObjekt = {
                                    model   : geminiModell,
                                    contents: prompt,
                                    config  : {
                                      temperature: TEMPERATUR
                                    }
                                };

    const antwortGemini =
              await geminiApiObjekt.models.generateContent( geminiAnfrageObjekt );

    //console.dir( { antwortGemini }, { depth: null } ); // formartierte Ausgabe des gesamten Gemini-Antwortobjekts

    const antwortTextRoh = antwortGemini.text;

    // JSON-String aus Gemini-Antwort extrahieren (falls Gemini zusätzlichen Text zurückliefert)
    const jsonStringMatch = antwortTextRoh.match( /{[\s\S]*}/ );
    const jsonString = jsonStringMatch ? jsonStringMatch[0] : null;

    if ( !jsonString ) {

      logger.error( "Ungültige Gemini-Antwort (kein JSON gefunden):", antwortTextRoh );
      throw new Error( "Ungültige Gemini-Antwort: Kein JSON-String gefunden." );
    }

    const antwortObjekt = JSON.parse( jsonString );

    antwortObjekt.richtigeAntwort       = antwortObjekt.richtigeAntwort.trim();
    antwortObjekt.falscheAntwortenArray = antwortObjekt.falscheAntworten
                                                       .map( (antwort) => antwort.trim() );

    return [ antwortObjekt.richtigeAntwort, ...antwortObjekt.falscheAntwortenArray ];
}
