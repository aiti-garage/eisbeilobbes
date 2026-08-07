/* Gemeinsame Zeichenfunktionen für die Seiten, die Bilder für Social Media
   erzeugen (insta-termine.html, buchung-werbung.html).
   Reine Helfer ohne Bezug zu einer bestimmten Seite. */

function rundesRechteck(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/* Gesperrter Text, mittig um cx. Nutzt ctx.letterSpacing, weil das
   Zeichen-für-Zeichen-Setzen bei kleinen Abständen unsauber aussieht. */
function zeichneGesperrt(ctx, text, cx, y, spacing) {
    const align = ctx.textAlign;
    if ('letterSpacing' in ctx) {
        const vorher = ctx.letterSpacing;
        ctx.letterSpacing = spacing.toFixed(2) + 'px';
        ctx.textAlign = 'center';
        ctx.fillText(text, cx + spacing / 2, y);   // Chrome zählt den Abstand hinter dem letzten Zeichen mit
        ctx.letterSpacing = vorher;
    } else {
        const zeichen = [...text];
        const breite = zeichen.reduce((s, c) => s + ctx.measureText(c).width + spacing, 0) - spacing;
        let x = cx - breite / 2;
        ctx.textAlign = 'left';
        zeichen.forEach(c => {
            ctx.fillText(c, x, y);
            x += ctx.measureText(c).width + spacing;
        });
    }
    ctx.textAlign = align;
}

/* Text auf mehrere Zeilen verteilen */
function umbrechen(ctx, text, maxBreite) {
    const worte = String(text).split(/\s+/);
    const zeilen = [];
    let zeile = '';
    worte.forEach(w => {
        const test = zeile ? zeile + ' ' + w : w;
        if (ctx.measureText(test).width > maxBreite && zeile) {
            zeilen.push(zeile);
            zeile = w;
        } else {
            zeile = test;
        }
    });
    if (zeile) zeilen.push(zeile);
    return zeilen;
}

/* Text mit … abschneiden, wenn er nicht in eine Zeile passt */
function kuerzen(ctx, text, maxBreite) {
    if (ctx.measureText(text).width <= maxBreite) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxBreite) t = t.slice(0, -1);
    return t.replace(/[\s.,-]+$/, '') + '…';
}

/* Breite/Höhe des Fotos - bestimmt, wie hoch es bei voller Breite wird */
function seitenverhaeltnis(img) {
    return img ? img.width / img.height : 2752 / 1536;
}

function ladeBild(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/* Foto füllt die Fläche und wird dabei beschnitten, oben und unten weich */
function zeichneFoto(ctx, img, x, y, w, h) {
    if (!img) return;
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const o = off.getContext('2d');
    const scale = Math.max(w / img.width, h / img.height);
    const bw = img.width * scale;
    const bh = img.height * scale;
    o.drawImage(img, (w - bw) / 2, (h - bh) / 2, bw, bh);

    const g = o.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.18, 'rgba(0,0,0,0)');
    g.addColorStop(0.82, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    o.globalCompositeOperation = 'destination-out';
    o.fillStyle = g;
    o.fillRect(0, 0, w, h);

    ctx.drawImage(off, x, y);
}

/* Foto vollständig einpassen, nichts abschneiden, alle vier Kanten weich
   auslaufen lassen, damit es nicht als Rechteck auf dem Hintergrund klebt. */
function zeichneFotoEinpassen(ctx, img, W, top, hoehe, breiteFaktor) {
    if (!img) return;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = hoehe;
    const o = off.getContext('2d');
    const scale = Math.min((W * (breiteFaktor || 0.86)) / img.width, hoehe / img.height);
    const bw = img.width * scale;
    const bh = img.height * scale;
    const links = (W - bw) / 2;
    const oben = (hoehe - bh) / 2;
    o.drawImage(img, links, oben, bw, bh);

    o.globalCompositeOperation = 'destination-out';

    const senkrecht = o.createLinearGradient(0, oben, 0, oben + bh);
    senkrecht.addColorStop(0, 'rgba(0,0,0,1)');
    senkrecht.addColorStop(0.14, 'rgba(0,0,0,0)');
    senkrecht.addColorStop(0.86, 'rgba(0,0,0,0)');
    senkrecht.addColorStop(1, 'rgba(0,0,0,1)');
    o.fillStyle = senkrecht;
    o.fillRect(links, oben, bw, bh);

    const waagerecht = o.createLinearGradient(links, 0, links + bw, 0);
    waagerecht.addColorStop(0, 'rgba(0,0,0,1)');
    waagerecht.addColorStop(0.10, 'rgba(0,0,0,0)');
    waagerecht.addColorStop(0.90, 'rgba(0,0,0,0)');
    waagerecht.addColorStop(1, 'rgba(0,0,0,1)');
    o.fillStyle = waagerecht;
    o.fillRect(links, oben, bw, bh);

    ctx.drawImage(off, 0, top);
}

function zeichneLogo(ctx, img, cx, cy, d) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    if (img) {
        // einpassen statt füllen - das Logo ist breit (2752x1536),
        // beim Füllen würde der Schriftzug links und rechts abgeschnitten
        const scale = Math.min(d / img.width, d / img.height);
        const bw = img.width * scale;
        const bh = img.height * scale;
        ctx.drawImage(img, cx - bw / 2, cy - bh / 2, bw, bh);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
    ctx.lineWidth = d * 0.045;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
}
