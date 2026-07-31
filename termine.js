/* Kopie von termine.csv für die lokale Vorschau ohne Webserver.
   Online hat immer termine.csv Vorrang – diese Datei wird nur benutzt,
   wenn die Seite per Doppelklick (file://) geöffnet wird, weil der
   Browser dann kein fetch() auf lokale Dateien erlaubt.
   Beim Ändern der Termine also termine.csv pflegen und den Block
   hier unten gleich mitkopieren. */
window.TERMINE_CSV = `datum;uhrzeit;ort;beschreibung
2026-04-19;13:00;Reitverein Tangerhütte;
2026-04-25;10:00;Berufsbildungswerk Stendal;
2026-05-01;10:00;Gärtnerei Mahlwinkel;
2026-05-02;13:00;Feuerwehr Tangerhütte;
2026-05-08;;Blütenfest Rogätz;Tag 1 von 3
2026-05-09;;Blütenfest Rogätz;Tag 2 von 3
2026-05-10;;Blütenfest Rogätz;Tag 3 von 3
2026-05-14;;Sportplatz Angern;Himmelfahrt
2026-05-19;16:00;Seniorenwohnheim Dolle;
2026-05-23;14:00;Sportplatz Mahlwinkel;
2026-05-24;14:00;Dorfgemeinschaftshaus Schernebeck;
2026-05-25;11:00;Mühle Jerichow;
2026-07-04;;Jerchel;Dorffest
2026-07-05;;Bölsdorf;Deutsche Meisterschaft im Modellflug
2026-07-12;;Schlosspark Tangerhütte;Picknick im Gartentraum
2026-07-14;;Seniorenwohnheim Dolle;
2026-07-17;;Bertingen;Rock unter den Eichen - Tag 1 von 2
2026-07-18;;Bertingen;Rock unter den Eichen - Tag 2 von 2
2026-07-23;;Seniorenwohnheim Goldener Herbst Tangermünde;
2026-07-25;;Angelverein Uetz am Kolk;
2026-08-02;;Schlosspark Tangerhütte;Konzert im Gartentraum
`;
