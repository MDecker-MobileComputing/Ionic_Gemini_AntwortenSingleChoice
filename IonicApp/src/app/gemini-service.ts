import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Capacitor } from '@capacitor/core';

import { Antworten } from './antworten';


/**
 * Diese Klasse enthält die Kommunikation mit dem Proxy-Server, der die KI-API aufruft.
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {

  /**
   * UUID für Sitzung, wird in jedem Request für Rate Limits mitgeschickt.
   * Für eine richtige Implementierung müsste die UUID mindestens persistiert werden,
   * eine saubere Lösung wäre es, wenn die Sitzungs-ID nach Authentifizierung
   * vom Server generiert und zurückgegeben wird, damit sie nicht von einem Angreifer
   * gefälscht werden kann.
   */
  static readonly SITZUNG_ID = uuidv4();

  /**
   * URL für Zugriff auf den Proxy-Server`; Hostname abhängig von Betrieb der
   * App auf Android-Emulator (`10.0.2.2`) oder im Browser (`localhost`) mit
   * `ionic serve`.
   */
  private proxyUrl : string = "";


  /**
   * Konstruktor für *Dependency Injection*
   */
  constructor( private httpClient: HttpClient ) {

      const appLaeuftAufAndroid = Capacitor.isNativePlatform();

      let hostname = "localhost";
      if ( appLaeuftAufAndroid ) {

        hostname = "10.0.2.2"; // Android-Emulator verwendet diese IP-Adresse, um auf localhost des Host-Computers zuzugreifen
      }

      this.proxyUrl = `http://${hostname}:8080/erzeugeAntworten`;
      console.log( `URL für Proxy-Server: ${this.proxyUrl}` );
  }


  /**
   * Antwortoptionen für Single-Choice-Fragen von KI erzeugen lassen.
   * Es wird ein Proxy-Server aufgerufen, der die KI-API ansteuert.
   * Der Proxy-Server ist notwendig, damit die App nicht den API-Key für die KI-API enthalten muss,
   * der von einem Angreifer missbraucht werden könnte. Außerdem bietet der Proxy-Server die Möglichkeit
   * Rate Limits zu implementieren, damit die KI-API nicht übermäßig oft aufgerufen wird, was zu hohen
   * Kosten führen könnte.
   *
   * @param singleChoiceFrage Vom Nutzer eingegebene Single-Choice-Frage
   *
   * @returns Antwortenobjekt mit einer richtigen Antwort und mehreren
   *           falschen Antwortoptionen.
   */
  public async erzeugeAntworten( singleChoiceFrage: string ): Promise<Antworten> {

    const requestObjekt = {
                            frage    : singleChoiceFrage,
                            sitzungId: GeminiService.SITZUNG_ID
                          };

    const requestObserver =
              this.httpClient.post<Antworten>( this.proxyUrl, requestObjekt );

    const antworten = await firstValueFrom( requestObserver );

    return antworten;
  }
}
