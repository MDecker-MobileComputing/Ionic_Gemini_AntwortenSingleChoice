/**
 * Klasse für die von der KI zurückgelieferten Antworten. 
 * Es gibt eine richtige Antwort und mehrere falsche Antwortoptionen.
 */
export class Antworten {

  public richtigeAntwort: string;

  public falscheAntwortOptionen: string[];


  constructor( richtigeAntwort: string = '', falscheAntwortOptionen: string[] = [] ) {

    this.richtigeAntwort        = richtigeAntwort;
    this.falscheAntwortOptionen = falscheAntwortOptionen;
  }
}
