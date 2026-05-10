import express      from "express";
import createLogger from "logging";
import { erzeugeAntwortenController } from "./controller.js";
import { corsMiddleware } from "./middleware.js";

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
expressObjekt.use( corsMiddleware );
expressObjekt.use( express.json() );


expressObjekt.post( "/erzeugeAntworten", erzeugeAntwortenController );



expressObjekt.listen( PORTNUMMER, () => {

  logger.info( `Gemini-Proxy lauscht auf Port ${PORTNUMMER}.` );
} );