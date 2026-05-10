import express      from "express";
import createLogger from "logging";

const logger = createLogger( "gemini-proxy" );

const API_KEY = process.env.GEMINI_API_KEY;
if ( !API_KEY ) {

  console.error( "Fehler: Umgebungsvariable GEMINI_API_KEY ist nicht gesetzt." );
  process.exit( 1 );
}

const GEMINI_MODELL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
logger.info( "KI-Modell:", GEMINI_MODELL );

const PORTNUMMER = process.env.PORT || 8080;

const expressObjekt = express();


/**
 * Middleware-Funktion zum Setzen der CORS-Header.
 */
expressObjekt.use( ( req, res, next ) => {

  res.header( "Access-Control-Allow-Origin", "*" );
  res.header( "Access-Control-Allow-Methods", "POST" );
  res.header( "Access-Control-Allow-Headers", "Content-Type, Authorization" );

  if ( req.method === "OPTIONS" ) {

    return res.sendStatus( 204 );
  }

  return next();
} );
expressObjekt.use( express.json() );


expressObjekt.post( "/erzeugeAntworten", async ( req, res ) => {

    const frage = req.body.frage || ""

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

    const ergebnisObjekt = {
        richtigeAntwort: "London",
        falscheAntworten: [
            "Paris",
            "Berlin",
            "Madrid"
        ]
    };

    res.json( ergebnisObjekt );
} );



expressObjekt.listen( PORTNUMMER, () => {

  logger.info( `Gemini-Proxy lauscht auf Port ${PORTNUMMER}.` );
} );