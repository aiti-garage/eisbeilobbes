/* Kennzeichnung KI-generierter Bilder (EU-KI-Verordnung Art. 50, gilt ab 02.08.2026).
   Zwei Ebenen:
   1. sichtbarer Hinweis, der direkt ins erzeugte Bild gezeichnet wird (KI_HINWEIS)
   2. maschinenlesbare Angabe als XMP im PNG. Plattformen wie Instagram und
      Facebook lesen "IPTC DigitalSourceType" aus und kennzeichnen den Beitrag
      dann selbst als KI-Inhalt.

   Die Fotos sind KI-erzeugt, Text und Grafik werden per Programm darüber
   gezeichnet - laut IPTC ist das "compositeWithTrainedAlgorithmicMedia". */

/* Wortlaut absichtlich vollständig ausgeschrieben statt "KI-Bild" - der Satz
   steht so im Bild, in den Metadaten und in der Bildunterschrift. */
const KI_HINWEIS = 'Dieses Bild wurde mit künstlicher Intelligenz erzeugt';

const XMP_KOMPOSIT = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"
    xmlns:dc="http://purl.org/dc/elements/1.1/">
   <Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>
   <dc:description>
    <rdf:Alt><rdf:li xml:lang="x-default">${KI_HINWEIS}</rdf:li></rdf:Alt>
   </dc:description>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

const CRC_TABELLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABELLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

/* Setzt einen iTXt-Block mit dem XMP-Paket direkt hinter den IHDR-Block. */
function pngMitXmp(puffer, xmp) {
    const alt = new Uint8Array(puffer);
    const schluessel = 'XML:com.adobe.xmp';
    const text = new TextEncoder().encode(xmp);

    const inhalt = new Uint8Array(schluessel.length + 5 + text.length);
    let p = 0;
    for (let i = 0; i < schluessel.length; i++) inhalt[p++] = schluessel.charCodeAt(i);
    inhalt[p++] = 0;   // Ende des Schlüsselworts
    inhalt[p++] = 0;   // nicht komprimiert
    inhalt[p++] = 0;   // Kompressionsverfahren
    inhalt[p++] = 0;   // leerer Sprachcode
    inhalt[p++] = 0;   // leere Übersetzung des Schlüsselworts
    inhalt.set(text, p);

    const typ = new Uint8Array([0x69, 0x54, 0x58, 0x74]);   // "iTXt"
    const chunk = new Uint8Array(12 + inhalt.length);
    const sicht = new DataView(chunk.buffer);
    sicht.setUint32(0, inhalt.length);
    chunk.set(typ, 4);
    chunk.set(inhalt, 8);

    const fuerPruefsumme = new Uint8Array(4 + inhalt.length);
    fuerPruefsumme.set(typ, 0);
    fuerPruefsumme.set(inhalt, 4);
    sicht.setUint32(8 + inhalt.length, crc32(fuerPruefsumme));

    // 8 Byte Signatur + 25 Byte IHDR-Block
    const schnitt = 33;
    const neu = new Uint8Array(alt.length + chunk.length);
    neu.set(alt.subarray(0, schnitt), 0);
    neu.set(chunk, schnitt);
    neu.set(alt.subarray(schnitt), schnitt + chunk.length);
    return neu;
}

/* Liefert das Canvas als PNG-Blob, inklusive KI-Kennzeichnung in den Metadaten. */
function pngMitKennzeichnung(canvas) {
    return new Promise((fertig, fehler) => {
        try {
            canvas.toBlob(b => b ? fertig(b) : fehler(new Error('leeres Bild')), 'image/png');
        } catch (err) {
            fehler(err);
        }
    }).then(blob =>
        blob.arrayBuffer()
            .then(puffer => new Blob([pngMitXmp(puffer, XMP_KOMPOSIT)], { type: 'image/png' }))
            // Metadaten sind Zugabe: klappt das nicht, zählt der sichtbare Hinweis im Bild
            .catch(() => blob)
    );
}
