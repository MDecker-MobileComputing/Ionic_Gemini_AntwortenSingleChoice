import createLogger from "logging";
import { GoogleGenAI } from "@google/genai";

const logger = createLogger( "controller" );

/** 
 * API-Objekt für den Zugriff auf die Gemini AI erzeugen;
 * es wurde zuvor schon sichergestellt, dass die Umgebungsvariable  
 * `GEMINI_API_KEY` gesetzt ist.
 */
const geminiAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});


/**
 * Event-Handler für die Route "/erzeugeAntworten". 
 * 
 * @param {*} req Muss im Body eine "frage" (string) und eine "sitzungID" (string) enthalten.
 * 
 * @param {*} res Antwort-Objekt, das die richtige Antwort und drei falsche Antworten zurückgibt. 
 */
export async function erzeugeAntwortenController( req, res ) {

    const frage = req.body.frage || "";

    const frageTrimmed = frage.trim();
    if ( frageTrimmed.length === 0 ) {

      return res.status( 400 ).json( {
        error: "Bad Request: Keine Frage enthalten."
      });
    }

    const sitzungID = req.body.sitzungID || req.body.sitzungId || "";
    if ( sitzungID.trim().length === 0 ) {

      return res.status( 400 ).json( {
        error: "Bad Request: Keine Sitzung-ID enthalten."
      });
    }

    logger.info( `Frage von Sitzung ${sitzungID} erhalten: ${frageTrimmed}` );

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
        
    const antwortGemini = 
              await geminiAI.models.generateContent({
                    model   : "gemini-3.1-flash-lite",
                    contents: prompt
              });

    /*
    logger.info( 
      `Antwort von Gemini für Sitzung ${sitzungID} erhalten:`, 
      antwortGemini );
    */

    const antwortText = ( antwortGemini?.text || "" ).trim();
    const antwortJsonText = antwortText
                              .replace( /^```json\s*/i, "" )
                              .replace( /^```\s*/i, "" )
                              .replace( /\s*```$/, "" )
                              .trim();
    let geminiObjekt = null;
    try {

      geminiObjekt = JSON.parse( antwortJsonText );

    } catch ( fehler ) {

      logger.error( "Gemini-Antwort konnte nicht als JSON geparst werden.", fehler );
      return res.status( 502 ).json( {
        error: "Bad Gateway: Ungültige Antwort von Gemini erhalten."
      } );
    }

    const richtigeAntwort = ( geminiObjekt?.richtigeAntwort || "" ).trim();
    const falscheAntworten = Array.isArray( geminiObjekt?.falscheAntworten )
                               ? geminiObjekt.falscheAntworten
                               : [];

    if ( richtigeAntwort.length === 0 || falscheAntworten.length !== 3 ) {

      return res.status( 502 ).json( {
        error: "Bad Gateway: Antwortformat von Gemini ist ungültig."
      } );
    }

    const ergebnisObjekt = {
                              richtigeAntwort,
                              falscheAntworten
                           };

    res.json( ergebnisObjekt );
}