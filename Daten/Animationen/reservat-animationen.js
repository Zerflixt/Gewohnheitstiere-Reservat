
/* =========================================================
RESERVAT - ANIMATIONEN 1.1
Feuerwerk: Canvas, unabhängig von Firebase
========================================================= */
(function () {
    "use strict";

    if (window.reservatFeuerwerk && typeof window.reservatFeuerwerk.destroy === "function") {
        window.reservatFeuerwerk.destroy();
    }

    const PALETTEN = {
        gold: ["#fff8da", "#ffe49a", "#ffc34c", "#f68c29", "#b94e23"],
        tuerkis: ["#f2ffff", "#b4fff6", "#4be6e2", "#1b9dc7", "#4568bc"],
        violett: ["#fff0ff", "#ffc7ef", "#f78bd1", "#b66ae8", "#7657c7"]
    };
    const allePaletten = Object.keys(PALETTEN);
    const raketen = [];
    const funken = [];
    const lichtblitze = [];
    let canvas = null;
    let ctx = null;
    let zoomEbene = null;
    let spielfeld = null;
    let frameId = 0;
    let letzterFrame = 0;
    let letzterStart = -Infinity;
    let generation = 0;

    function zufallsgenerator(seed) {
        let zustand = seed >>> 0;
        return function () {
            zustand += 0x6D2B79F5;
            let t = zustand;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    } /* Ende Zufallsgenerator */

    function zeichnungsflaecheSichern() {
        spielfeld = document.getElementById("spielfeld");
        const aktuelleEbene = document.getElementById("reservatZoomEbene");
        if (!spielfeld || !aktuelleEbene) return false;

        if (canvas && zoomEbene !== aktuelleEbene) {
            canvas.remove();
            canvas = null;
            ctx = null;
            raketen.length = 0;
            funken.length = 0;
        }
        zoomEbene = aktuelleEbene;
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "reservatFeuerwerkCanvas";
            Object.assign(canvas.style, {
                position: "absolute", left: "0", top: "0",
                width: "100%", height: "100%", pointerEvents: "none",
                zIndex: "60", background: "transparent"
            });
            zoomEbene.appendChild(canvas);
            ctx = canvas.getContext("2d");
        }
        const breite = Math.max(1, Math.round(spielfeld.clientWidth));
        const hoehe = Math.max(1, Math.round(spielfeld.clientHeight));
        if (canvas.width !== breite || canvas.height !== hoehe) {
            canvas.width = breite;
            canvas.height = hoehe;
        }
        return true;
    } /* Ende Zeichenfläche sichern */

    function pixel(x, y, groesse, farbe, alpha) {
        if (alpha <= 0) return;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = farbe;
        const g = Math.max(1, Math.round(groesse));
        ctx.fillRect(Math.round(x - g / 2), Math.round(y - g / 2), g, g);
    } /* Ende Pixel zeichnen */

    function explosion(rakete) {
		/* -----------------------------------
        Lichtblitz zur Explosion erzeugen
        ----------------------------------- */

        lichtblitze.push({
            x: rakete.startX,
            y: rakete.startY,
            farbe:
			rakete.farben === PALETTEN.gold
				? "#e8a044"
				: rakete.farben === PALETTEN.tuerkis
					? "#48b7a8"
					: "#ad79ca",
			radius: (spielfeld.clientWidth / 10) * 3.75,
			dauer: 1.80,
            alter: 0
        });

        /* Ende Lichtblitz erzeugen */
        const rand = rakete.rand;
        const farben = rakete.farben;
        const anzahl = Math.round((85 + rand() * 45) * rakete.groesse);
        const grundwinkel = rand() * Math.PI * 2;
        for (let i = 0; i < anzahl; i++) {
            const winkel = grundwinkel + (i / anzahl) * Math.PI * 2 + (rand() - 0.5) * 0.33;
            const tempo = (34 + rand() * 86) * Math.sqrt(rakete.groesse);
            funken.push({
                x: rakete.x, y: rakete.y,
                vx: Math.cos(winkel) * tempo,
                vy: Math.sin(winkel) * tempo,
                leben: 1, dauer: 1.35 + rand() * 0.75,
                farben, farbindex: 1 + Math.floor(rand() * (farben.length - 1)),
                kern: rand() > 0.89 ? 2 : 1,
                schweif: 1 + Math.floor(rand() * 3),
                flimmern: rand() * 6.28,
                alter: 0
            });
        }
        funken.push({ x: rakete.x, y: rakete.y, blitz: true, alter: 0, dauer: 0.16, leben: 1 });
    } /* Ende Explosion */

    function bildBerechnen(zeit) {
        frameId = 0;
        if (!zeichnungsflaecheSichern()) return;
        const dt = Math.min(0.04, Math.max(0, (zeit - (letzterFrame || zeit)) / 1000));
        letzterFrame = zeit;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = raketen.length - 1; i >= 0; i--) {
            const r = raketen[i];
            r.alter += dt;
            const t = Math.min(1, r.alter / r.dauer);
            const xAlt = r.x, yAlt = r.y;
            r.x = r.startX + r.drift * t * t;
            r.y = r.startY - r.hoehe * (1 - Math.pow(1 - t, 1.22));
            for (let k = 5; k >= 1; k--) {
                pixel(r.x - (r.x - xAlt) * k * 0.6, r.y + 3 * k + (yAlt - r.y) * k * 0.45,
                    k > 3 ? 1 : 2, r.farben[Math.min(4, k)], (1 - k / 6) * 0.85);
            }
            pixel(r.x, r.y, 3, "#fffefa", 1);
            pixel(r.x, r.y - 2, 1, r.farben[1], 0.85);
            if (t >= 1) {
                explosion(r);
                raketen.splice(i, 1);
            }
        }
        /* -----------------------------------
        Lichtblitze zeichnen
        ----------------------------------- */

        for (let i = lichtblitze.length - 1; i >= 0; i--) {

            const blitz = lichtblitze[i];

            blitz.alter += dt;

            const rest = Math.max(
                0,
                1 - blitz.alter / blitz.dauer
            );

            if (rest <= 0) {
                lichtblitze.splice(i, 1);
                continue;
            }

            /* Licht schnell abklingen lassen */

			/* -----------------------------------
			Lichtschein mit sanftem Nachflackern
			----------------------------------- */

			/* Grundhelligkeit: 10 % schwächer */
			const grundhelligkeit =
				0.315 * Math.pow(rest, 0.9);

			/* Flackern erst in der zweiten Hälfte */
			let flackern = 1;

			if (rest < 0.5) {

				const schwankung =
					Math.sin(blitz.alter * 43) *
					Math.sin(blitz.alter * 17);

				const flackerStaerke =
					(0.5 - rest) * 0.30;

				flackern += schwankung * flackerStaerke;
			}

			const helligkeit =
				grundhelligkeit * flackern;

			/* Ende Lichtschein mit Nachflackern */

            const verlauf =
                ctx.createRadialGradient(
                    blitz.x,
                    blitz.y,
                    0,
                    blitz.x,
                    blitz.y,
                    blitz.radius
                );

            verlauf.addColorStop(
                0,
                blitz.farbe
            );

            verlauf.addColorStop(
                0.25,
                blitz.farbe
            );

            verlauf.addColorStop(
                1,
                "transparent"
            );

            ctx.save();

            ctx.globalCompositeOperation =
                "screen";

            ctx.globalAlpha =
                helligkeit;

            ctx.fillStyle =
                verlauf;

            ctx.beginPath();

            ctx.arc(
                blitz.x,
                blitz.y,
                blitz.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();

        }

        /* Ende Lichtblitze zeichnen */
        for (let i = funken.length - 1; i >= 0; i--) {
            const f = funken[i];
            f.alter += dt;
            const rest = Math.max(0, 1 - f.alter / f.dauer);
            if (rest <= 0) { funken.splice(i, 1); continue; }
            if (f.blitz) {
                pixel(f.x, f.y, 5, "#fffef0", rest);
                pixel(f.x - 4, f.y, 2, "#ffe4a1", rest * 0.8);
                pixel(f.x + 4, f.y, 2, "#ffe4a1", rest * 0.8);
                continue;
            }
            const altX = f.x, altY = f.y;
            const bremse = Math.exp(-1.05 * dt);
            f.vx *= bremse;
            f.vy = f.vy * bremse + 25 * dt;
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            const flackern = 0.78 + 0.22 * Math.sin(f.alter * 24 + f.flimmern);
            const alpha = Math.pow(rest, 0.8) * flackern;
            for (let k = f.schweif; k >= 1; k--) {
                pixel(f.x + (altX - f.x) * k * 1.7,
                    f.y + (altY - f.y) * k * 1.7,
                    1, f.farben[Math.min(f.farben.length - 1, f.farbindex + (k > 1 ? 1 : 0))],
                    alpha * (1 - k / (f.schweif + 1)));
            }
            pixel(f.x, f.y, f.kern, f.farben[f.farbindex], alpha);
            if (rest > 0.35) pixel(f.x, f.y, 1, f.farben[0], alpha * 0.95);
        }
        ctx.globalAlpha = 1;
        if (
    raketen.length ||
    funken.length ||
    lichtblitze.length
) {
    frameId = requestAnimationFrame(bildBerechnen);
}
        else letzterFrame = 0;
    } /* Ende Animationsschleife */

    function start(optionen = {}) {
		/* -----------------------------------
		Startsperre nur für eigene Raketen
		----------------------------------- */

		const jetzt = performance.now();

		const empfangeneRakete =
			optionen.vonFirebase === true;

		if (
			!empfangeneRakete &&
			jetzt - letzterStart < 750
		) {
			return false;
		}

		/* Ende Startsperre */
        if (!zeichnungsflaecheSichern()) {
            console.warn("Feuerwerk: Spielfeld noch nicht bereit.");
            return false;
        }
        /* -----------------------------------
		Startposition bestimmen

		Eigene Position als Standard.
		Bei Multiplayer kann eine fremde
		Position übergeben werden.
		----------------------------------- */

		const position =
			optionen.position ||
			window.aktuelleSpielerPosition;

		/* Ende Startposition bestimmen */
        if (!position || !Number.isFinite(Number(position.x)) || !Number.isFinite(Number(position.y))) {
            console.warn("Feuerwerk: Eigene Avatarposition noch nicht verfügbar.");
            return false;
        }
        const seed = Number.isFinite(Number(optionen.seed)) ? Number(optionen.seed) : Math.floor(Math.random() * 4294967296);
        const rand = zufallsgenerator(seed);
        const palettenName = PALETTEN[optionen.palette] ? optionen.palette : allePaletten[Math.floor(rand() * allePaletten.length)];
        const groesse = Math.min(1.5, Math.max(0.65, Number(optionen.groesse) || 1));
        const feld = spielfeld.clientWidth / 10;
        const startX = (Number(position.x) + 0.5) * feld;
        const startY = (Number(position.y) + 0.70) * feld;
        const hoehe = feld * (2.0 + rand() * 1.2) * groesse;
        const drift = feld * (rand() - 0.5) * 1.25;
        raketen.push({
            startX, startY, x: startX, y: startY,
            hoehe, drift, groesse, rand, farben: PALETTEN[palettenName],
            dauer: 0.8 + rand() * 0.4, alter: 0, seed
        });
        /* -----------------------------------
		Nur eigene Starts sperren
		----------------------------------- */

		if (!empfangeneRakete) {
			letzterStart = jetzt;
		}

		/* Ende eigene Starts sperren */
        if (!frameId) {
            letzterFrame = 0;
            frameId = requestAnimationFrame(bildBerechnen);
        }
        return true;
    } /* Ende Rakete starten */

    function destroy() {
        generation++;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        letzterFrame = 0;
        letzterStart = -Infinity;
        raketen.length = 0;
        funken.length = 0;
		lichtblitze.length = 0;
        if (canvas) canvas.remove();
        canvas = null;
        ctx = null;
        zoomEbene = null;
        spielfeld = null;
    } /* Ende Feuerwerk entfernen */

    window.reservatAnimationenVersion = "1.2";
    window.reservatFeuerwerk = { start, destroy };
    console.log("Reservat-Animationen geladen, Version 1.2");
})();
/* Ende Reservat - Animationen */
