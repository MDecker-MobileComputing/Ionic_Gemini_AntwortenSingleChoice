/**
 * Klasse für die von der KI zurückgelieferten Antworten. 
 * Es gibt eine richtige Antwort und mehrere falsche Antwortoptionen.
 */
export class Antworten {

  public richtigeAntwort: string;

  public falscheAntworten: string[];


  constructor( richtigeAntwort: string = '', falscheAntworten: string[] = [] ) {

    this.richtigeAntwort  = richtigeAntwort;
    this.falscheAntworten = falscheAntworten;
  }
}
