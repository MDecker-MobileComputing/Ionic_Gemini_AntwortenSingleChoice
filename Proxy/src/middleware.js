import createLogger from "logging";


/**
 * Middleware-Funktionen für den Express-Server registrieren.
 */
export function registriereMiddlewareFunktionen( expressObjekt ) {

  expressObjekt.use( corsMiddleware         );
  expressObjekt.use( rateLimitingMiddleware );
}


/**
 * Middleware-Funktionen zum Setzen der CORS-Header.
 *
 * Diese Header werden benötigt, damit der Browser (in dem die Ionic-App läuft) Anfragen an den Proxy-Server senden darf,
 * der auf einem anderen Host/Port läuft.
 */
function corsMiddleware( req, res, next ) {

  res.header( "Access-Control-Allow-Origin" , "*"            ); // Host/Port von Client-App egal
  res.header( "Access-Control-Allow-Methods", "POST"         );
  res.header( "Access-Control-Allow-Headers", "Content-Type" );

  if ( req.method === "OPTIONS" ) {

    return res.sendStatus( 204 ); // No Content
  }

  return next();
}



const logger = createLogger( "rate-limiter" );

const letzterRequestMap = new Map(); // Map bildet Sitzungs-ID auf Zeitstempel des letzten Requests ab

const MINDESTABSTAND_MS = 30*1000; // Mindestabstand zwischen zwei Requests von derselben Sitzung in Millisekunden


/**
 * Middleware-Funktion für Rate Limiting: Es wird die Sitzungs-ID extrahiert.
 * Wenn diese nicht vorhanden ist, dann wird der Request abgebrochen.
 *
 * @param {*} req Request-Objekt, das im Body das Attribut "sitzungID" (string)
 *                enthalten muss
 *
 * @param {*} res Antwort-Objekt, das im Fehlerfall eine Fehlermeldung zurückgibt
 *
 * @param {*} next Funktion um Request weiterzugeben, wenn die Sitzung-ID erfolgreich
 *                 extrahiert wurde
 */
function rateLimitingMiddleware( req, res, next ) {

  const body = req.body || {};
  const sitzungID = body.sitzungID || body.sitzungId || "";
  if ( sitzungID.trim().length === 0 ) {

    return res.status( 400 ).json( {
      error: "Bad Request: Keine Sitzung-ID enthalten."
    });
  }


  const jetzt = Date.now();

  if ( !letzterRequestMap.has( sitzungID ) ) {

    logger.info( `Erste Anfrage für Sitzung ${sitzungID} erhalten.` );
    letzterRequestMap.set( sitzungID, jetzt );
    logger.info( `Anzahl Sitzungen in Datenbank: ${letzterRequestMap.size}` );
    return next();

  } else {

    const zeitstempelLetzterRequest = letzterRequestMap.get( sitzungID );
    const zeitSeitLetztemRequest    = jetzt - zeitstempelLetzterRequest;

    if ( zeitSeitLetztemRequest < MINDESTABSTAND_MS ) {

      logger.warn(
        `Anfrage für Sitzung ${sitzungID} abgelehnt weil Zeit seit letztem Request nur ${zeitSeitLetztemRequest}ms.` );

      return res.status( 429 ).json( {
        error: "Too Many Requests: Bitte warten."
      });

    } else {

      logger.info(
        `Anfrage für Sitzung ${sitzungID} akzeptiert. Zeit seit letztem Request: ${zeitSeitLetztemRequest} ms.` );

      letzterRequestMap.set( sitzungID, jetzt );
      return next();
    }
  }


  const letzterRequestZeitstempel = letzterRequestMap.get( sitzungID ) || 0;

  if ( jetzt - letzterRequestZeitstempel < MINDESTABSTAND_MS ) {

    logger.warn( `Anfrage für Sitzung ${sitzungID} abgelehnt.` );

    return res.status( 429 ).json( {
      error: "Too Many Requests: Bitte warten."
    });

  } else {

      letzterRequestMap.set( sitzungID, jetzt );
      return next();
  }
}
