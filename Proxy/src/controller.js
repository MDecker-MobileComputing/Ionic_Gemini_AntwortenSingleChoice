import createLogger from "logging";
import { GoogleGenAI } from "@google/genai";

import { erzeugeAntwortenoptionenMitGemini } from "./gemini-service.js";


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

    logger.info(
      `Frage von Client-Sitzung ${sitzungID} erhalten: "${frageTrimmed}"`
    );


    try {

      const antwortenArray =
          await erzeugeAntwortenoptionenMitGemini( frageTrimmed );

      // erste Antwort im Array ist die richtige, alle anderen sind falsch
      const ergebnisObjekt = {
                              richtigeAntwort : antwortenArray[0],
                              falscheAntworten: antwortenArray.slice(1)
                           };

      res.json( ergebnisObjekt );

      logger.info( `Gemini-Antwort für Sitzung ${sitzungID} verarbeitet.` );

    } catch ( fehler ) {

      logger.error( `Gemini-Fehler für Sitzung ${sitzungID}:`, fehler );

      return res.status( 500 ).json( {
        error: "Interner Serverfehler bei der Antwortgenerierung."
      });
    }
}