import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { GeminiService }           from '../gemini-service';
import { extrahiereFehlermeldung } from '../fehlertext.util';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  /** Single-Choice-Frage, die der Nutzer eingegeben hat, weil er dafür Antwort-Optionen haben möchte. */
  public frage: string = "";

  /** Erste Antwortoption (richtige Antwort) */  
  public antwortoption1: string = "";

  /** Zweite Antwortoption (falsche Antwort) */  
  public antwortoption2: string = "";

  /** Dritte Antwortoption (falsche Antwort) */
  public antwortoption3: string = "";

  /** Vierte Antwortoption (falsche Antwort) */
  public antwortoption4: string = "";


  /**
   * Konstruktor für *Dependency Injection*
   */
  constructor( private alertController: AlertController,
               private geminiService: GeminiService ) {}
   

  /**
   * Event-Handler für den "Erzeugen"-Button.
   */
  public async onErzeugenButton() {
   
    const frageTrimmed = this.frage.trim();

    if ( frageTrimmed.length === 0 ) {

      await this.zeigeFehlermeldung( "Bitte geben Sie eine Single-Choice-Frage ein." );
      return;
    }

    try {

      const antworten = 
            await this.geminiService.erzeugeAntworten( frageTrimmed );

      this.antwortoption1 = antworten.richtigeAntwort;
      this.antwortoption2 = antworten.falscheAntworten[0] || "";
      this.antwortoption3 = antworten.falscheAntworten[1] || "";
      this.antwortoption4 = antworten.falscheAntworten[2] || "";

    } catch ( fehler ) {

      const fehlermeldung = extrahiereFehlermeldung( fehler );
      console.error("Fehler beim Erzeugen der Antwortoptionen:", fehlermeldung );
      await this.zeigeFehlermeldung( fehlermeldung );
    } 
  }


  /**
   * Event-Handler für den "Löschen"-Button. Es wird zunächst eine Confirmation-Frage
   * anzeigt.
   */
  public async onLoeschenButton() {
    
    const alert = await this.alertController.create({
      header: "Löschen bestätigen",
      message: "Frage und alle Antworten werden gelöscht. Möchten Sie fortfahren?",
      buttons: [
        {
          text: "Abbrechen",
          role: "cancel"
        },
        {
          text: "Löschen",
          role: "destructive",
          handler: () => {

            this.frage = "";
            this.antwortoption1 = "";
            this.antwortoption2 = "";
            this.antwortoption3 = "";
            this.antwortoption4 = "";
          }
        }
      ]
    });

    await alert.present();
  }

  private async zeigeFehlermeldung( fehlermeldung: string ) {

    const alert = await this.alertController.create({
      header: "Fehler",
      message: fehlermeldung,
      buttons: ["OK"]
    });

    await alert.present();
  }
}