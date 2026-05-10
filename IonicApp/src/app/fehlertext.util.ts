/**
 * Wandelt unterschiedliche Fehlerobjekte in eine lesbare Meldung um.
 * 
 * @param fehlerObjekt Das Fehlerobjekt, das in eine Fehlermeldung umgewandelt werden soll;
 *                     v.a. Objekt, welches mit catch gefangen wurde.
 * 
 * @return Eine lesbare Fehlermeldung
 */
export function extrahiereFehlermeldung( fehlerObjekt: unknown ): string {

  if ( typeof fehlerObjekt === "string" ) {

    return fehlerObjekt;
  }

  if ( fehlerObjekt instanceof Error ) {

    return fehlerObjekt.message;
  }

  if ( fehlerObjekt && typeof fehlerObjekt === "object" ) {

    const fehlerObj = fehlerObjekt as {
      status?: number;
      statusText?: string;
      message?: string;
      error?: unknown;
    };

    const apiFehler = fehlerObj.error as {
      message?: string;
      error?: { message?: string };
    } | undefined;

    const apiFehlertext =
      apiFehler?.error?.message ??
      apiFehler?.message ??
      ( typeof fehlerObj.error === "string" ? fehlerObj.error : undefined ) ??
      fehlerObj.message;

    if ( apiFehlertext ) {

      return apiFehlertext;
    }

    if ( typeof fehlerObj.status === "number" ) {

      return `HTTP ${fehlerObj.status}${fehlerObj.statusText ? ` ${fehlerObj.statusText}` : ""}`;
    }

    try {

      return JSON.stringify( fehlerObj );

    } catch {

      return "Unbekannter Fehler";
    }
  }

  return "Unbekannter Fehler";
}
