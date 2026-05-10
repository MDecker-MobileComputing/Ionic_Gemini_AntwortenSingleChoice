
/**
 * Middleware-Funktionen zum Setzen der CORS-Header.
 * 
 * Diese Header werden benötigt, damit der Browser (in dem die Ionic-App läuft) Anfragen an den Proxy-Server senden darf, 
 * der auf einem anderen Host/Port läuft.
 */
export function corsMiddleware( req, res, next ) {

  res.header( "Access-Control-Allow-Origin", "*"             ); // Host/Port von Client-App egal
  res.header( "Access-Control-Allow-Methods", "POST"         );
  res.header( "Access-Control-Allow-Headers", "Content-Type" );

  if ( req.method === "OPTIONS" ) {

    return res.sendStatus( 204 ); // No Content
  }

  return next();
}
