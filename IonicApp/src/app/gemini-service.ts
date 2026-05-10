import { Injectable } from '@angular/core';
import { Antworten } from './antworten';


/**
 * Diese Klasse enthält die Kommunikation mit dem Proxy-Server, der die KI-API aufruft.
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {

  

  /**
   * Antwortoptionen für Single-Choice-Fragen von KI erzeugen lassen.
   * Es wird ein Proxy-Server aufgerufen, der die KI-API ansteuert. 
   * Der Proxy-Server ist notwendig, damit die App nicht den API-Key für die KI-API enthalten muss, 
   * der von einem Angreifer missbraucht werden könnte. Außerdem bietet der Proxy-Server die Möglichkeit
   * Rate Limits zu implementieren, damit die KI-API nicht übermäßig oft aufgerufen wird, was zu hohen 
   * Kosten führen könnte.
   * 
   * @param frage Vom Nutzer eingegebene Single-Choice-Frage
   * 
   * @returns Antwortenobjekt mit einer richtigen Antwort und 
   *          mehreren falschen Antwortoptionen.
   */
  public async erzeugeAntworten( frage: string ): Promise<Antworten> {

    return Promise.resolve( 
      new Antworten( "Richtige Antwort", 
        [ "Falsche Antwort 1", "Falsche Antwort 2", "Falsche Antwort 3" ] ) 
      );
  }
}
