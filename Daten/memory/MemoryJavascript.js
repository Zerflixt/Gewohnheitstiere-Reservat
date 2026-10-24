/* =====================================
   MEMORY: GRAFIKEN SICHER LADEN
   ===================================== */
   /* -----------------------------------
   Memory-Spiel starten
   ----------------------------------- */

window.memorySpielStarten = function () {
/* -----------------------------------
   Memory: Deck-Katalog laden
   ----------------------------------- */

async function memoryDeckKatalogLaden() {

    const antwort = await fetch(
        "Daten/memory/decks.json?v=2"
    );

    if (!antwort.ok) {
        throw new Error(
            "Memory-Deck-Katalog konnte nicht geladen werden."
        );
    }

    return await antwort.json();

} /* Ende memoryDeckKatalogLaden */

/* Ende Memory: Deck-Katalog laden */
/* -----------------------------------
   Memory: Karten des aktiven Decks
   ----------------------------------- */

let dateien = [];
let kartenpfad = "";

let rueckseite = "Daten/Icons/SpielkartenIcon.png";

/* Ende Memory: Karten des aktiven Decks */



const raster = document.getElementById("memoryTestRaster");
const ladeanzeige = document.getElementById("memoryLadeanzeige");
/* -----------------------------------
   Memory: Zoomzustand
   ----------------------------------- */

const sichtfenster =
    document.getElementById("memorySichtfenster");

const zoomEbene =
    document.getElementById("memoryZoomEbene");

let memoryZoomFaktor = 1;

const memoryZoomMinimum = 1;
const memoryZoomMaximum = 2;

let memoryZoomVersatzX = 0;
let memoryZoomVersatzY = 0;

/* Ende Memory: Zoomzustand */
/* -----------------------------------
   Memory: Zoom-Versatz begrenzen
   ----------------------------------- */

function memoryZoomVersatzBegrenzen() {

    if (!sichtfenster) return;

    const breite = sichtfenster.clientWidth;
    const hoehe = sichtfenster.clientHeight;

    if (memoryZoomFaktor <= memoryZoomMinimum) {

        memoryZoomVersatzX = 0;
        memoryZoomVersatzY = 0;

        return;
    }

    const minimumX =
        breite - breite * memoryZoomFaktor;

    const minimumY =
        hoehe - hoehe * memoryZoomFaktor;

    memoryZoomVersatzX = Math.min(
        0,
        Math.max(minimumX, memoryZoomVersatzX)
    );

    memoryZoomVersatzY = Math.min(
        0,
        Math.max(minimumY, memoryZoomVersatzY)
    );

} /* Ende memoryZoomVersatzBegrenzen */


/* -----------------------------------
   Memory: Zoom darstellen
   ----------------------------------- */

function memoryZoomZeichnen() {

    if (!zoomEbene) return;

    memoryZoomVersatzBegrenzen();

    zoomEbene.style.transform =
        "translate3d(" +
        memoryZoomVersatzX + "px, " +
        memoryZoomVersatzY + "px, 0) " +
        "scale(" + memoryZoomFaktor + ")";

} /* Ende memoryZoomZeichnen */
/* -----------------------------------
   Memory: Zoom auf 100 % zurücksetzen
   ----------------------------------- */

function memoryZoomZuruecksetzen() {

    if (!zoomEbene) return;

    /* Animation einschalten */

    zoomEbene.classList.add("memoryZoomRueckkehr");

    /* Zoom und Position zurücksetzen */

    memoryZoomFaktor = 1;

    memoryZoomVersatzX = 0;
    memoryZoomVersatzY = 0;

    memoryZoomZeichnen();

    /* Animation nach 500 ms abschalten */

    setTimeout(function () {

        zoomEbene.classList.remove("memoryZoomRueckkehr");

    }, 500);

} /* Ende memoryZoomZuruecksetzen */
/* -----------------------------------
   Memory: Mausrad-Zoom
   ----------------------------------- */

if (sichtfenster && zoomEbene) {

    sichtfenster.addEventListener(
        "wheel",
        function (ereignis) {

            ereignis.preventDefault();

            const rechteck =
                sichtfenster.getBoundingClientRect();

            const mausX =
                ereignis.clientX - rechteck.left;

            const mausY =
                ereignis.clientY - rechteck.top;

            const inhaltX =
                (mausX - memoryZoomVersatzX) /
                memoryZoomFaktor;

            const inhaltY =
                (mausY - memoryZoomVersatzY) /
                memoryZoomFaktor;

            const faktor =
                Math.exp(-ereignis.deltaY * 0.001);

            memoryZoomFaktor = Math.max(
                memoryZoomMinimum,
                Math.min(
                    memoryZoomMaximum,
                    memoryZoomFaktor * faktor
                )
            );

            memoryZoomVersatzX =
                mausX - inhaltX * memoryZoomFaktor;

            memoryZoomVersatzY =
                mausY - inhaltY * memoryZoomFaktor;

            memoryZoomZeichnen();

        },
        { passive: false }
    );

}

/* Ende Memory: Mausrad-Zoom */
/* -----------------------------------
   Memory: Spielfeld mit Maus verschieben
   ----------------------------------- */

if (sichtfenster && zoomEbene) {

    let mausZiehen = null;

    /* Maustaste drücken */

    sichtfenster.addEventListener(
        "mousedown",
        function (ereignis) {

            if (
                ereignis.button !== 0 ||
                memoryZoomFaktor <= 1
            ) {
                return;
            }

            mausZiehen = {
                startX: ereignis.clientX,
                startY: ereignis.clientY,
                versatzX: memoryZoomVersatzX,
                versatzY: memoryZoomVersatzY,
                aktiv: false
            };

        }
    );

    /* Maus bewegen */

    window.addEventListener(
        "mousemove",
        function (ereignis) {

            if (!mausZiehen) return;

            const deltaX =
                ereignis.clientX - mausZiehen.startX;

            const deltaY =
                ereignis.clientY - mausZiehen.startY;

			if (
				!mausZiehen.aktiv &&
				Math.hypot(deltaX, deltaY) >= 8
			) {
				mausZiehen.aktiv = true;

				/* Nächsten Kartenklick unterdrücken */

				sichtfenster.dataset.memoryWurdeGezogen = "ja";
			}

            if (mausZiehen.aktiv) {

                memoryZoomVersatzX =
                    mausZiehen.versatzX + deltaX;

                memoryZoomVersatzY =
                    mausZiehen.versatzY + deltaY;

                memoryZoomZeichnen();
            }

        }
    );

    /* Maustaste loslassen */

    window.addEventListener(
        "mouseup",
        function () {

            mausZiehen = null;

        }
    );

    /* Kartenklick nach Ziehen verhindern */

    sichtfenster.addEventListener(
        "click",
        function (ereignis) {

            if (
                sichtfenster.dataset.memoryWurdeGezogen ===
                "ja"
            ) {
                ereignis.preventDefault();
                ereignis.stopPropagation();

                sichtfenster.dataset.memoryWurdeGezogen =
                    "nein";
            }

        },
        true
    );

}

/* Ende Memory: Spielfeld mit Maus verschieben */
/* -----------------------------------
   Memory: Touch-Steuerung
   ----------------------------------- */

if (sichtfenster && zoomEbene) {

    /* Aktuelle Fingerbewegung */

    let memoryTouchStart = null;

    /* Ausgangsabstand bei Zwei-Finger-Zoom */

    let memoryTouchAbstand = 0;

    /* Zoomfaktor zu Beginn der Geste */

    let memoryTouchZoomStart = 1;
	/* Ausgangsposition beim Zwei-Finger-Zoom */

	let memoryTouchInhaltX = 0;
	let memoryTouchInhaltY = 0;
    /* -----------------------------------
       Touch-Beginn erkennen
       ----------------------------------- */

    sichtfenster.addEventListener(
	"touchstart",
	function (ereignis) {

		/* Klickschutz bei einer neuen Geste zurücksetzen */

		if (ereignis.touches.length === 1) {
			sichtfenster.dataset.memoryWurdeGezogen = "nein";
		}

		/* Ein Finger */

            if (ereignis.touches.length === 1) {

                const finger = ereignis.touches[0];

                memoryTouchStart = {
                    startX: finger.clientX,
                    startY: finger.clientY,
                    versatzX: memoryZoomVersatzX,
                    versatzY: memoryZoomVersatzY
                };

            }

            /* Zwei Finger */

            if (ereignis.touches.length === 2) {

                const finger1 = ereignis.touches[0];
                const finger2 = ereignis.touches[1];

                memoryTouchAbstand = Math.hypot(
                    finger2.clientX - finger1.clientX,
                    finger2.clientY - finger1.clientY
                );

			memoryTouchZoomStart = memoryZoomFaktor;

			/* Mittelpunkt zwischen beiden Fingern */

			const rechteck = sichtfenster.getBoundingClientRect();

			const mittelpunktX =
				(finger1.clientX + finger2.clientX) / 2 -
				rechteck.left;

			const mittelpunktY =
				(finger1.clientY + finger2.clientY) / 2 -
				rechteck.top;

			/* Position im unvergrößerten Spielfeld merken */

			memoryTouchInhaltX =
				(mittelpunktX - memoryZoomVersatzX) /
				memoryZoomFaktor;

			memoryTouchInhaltY =
				(mittelpunktY - memoryZoomVersatzY) /
				memoryZoomFaktor;

			memoryTouchStart = null;
            }

        },
        { passive: false }
    );

    /* Ende Touch-Beginn erkennen */
	    /* -----------------------------------
       Memory: Mit einem Finger verschieben
       ----------------------------------- */

    sichtfenster.addEventListener(
        "touchmove",
        function (ereignis) {

            /* Nur bei einem Finger und aktivem Zoom */

            if (
                ereignis.touches.length !== 1 ||
                memoryZoomFaktor <= 1 ||
                !memoryTouchStart
            ) {
                return;
            }

            const finger = ereignis.touches[0];

            const deltaX =
                finger.clientX - memoryTouchStart.startX;

            const deltaY =
                finger.clientY - memoryTouchStart.startY;

            /* Erst ab 8 Pixeln als Ziehen behandeln */

            if (Math.hypot(deltaX, deltaY) < 8) {
                return;
            }

            ereignis.preventDefault();

            memoryZoomVersatzX =
                memoryTouchStart.versatzX + deltaX;

            memoryZoomVersatzY =
                memoryTouchStart.versatzY + deltaY;

            memoryZoomZeichnen();

            /* Kartenklick nach Ziehen verhindern */

            sichtfenster.dataset.memoryWurdeGezogen = "ja";

        },
        { passive: false }
    );

    /* Ende Memory: Mit einem Finger verschieben */
	    /* -----------------------------------
       Memory: Zwei-Finger-Zoom
       ----------------------------------- */

    sichtfenster.addEventListener(
        "touchmove",
        function (ereignis) {

            /* Nur bei genau zwei Fingern */

            if (
                ereignis.touches.length !== 2 ||
                memoryTouchAbstand <= 0
            ) {
                return;
            }

            ereignis.preventDefault();

            const finger1 = ereignis.touches[0];
            const finger2 = ereignis.touches[1];

            /* Aktuellen Fingerabstand berechnen */

            const abstand = Math.hypot(
                finger2.clientX - finger1.clientX,
                finger2.clientY - finger1.clientY
            );

            /* Zoomfaktor berechnen und begrenzen */

            memoryZoomFaktor = Math.max(
                memoryZoomMinimum,
                Math.min(
                    memoryZoomMaximum,
                    memoryTouchZoomStart *
                    abstand / memoryTouchAbstand
                )
            );

			/* Aktuellen Mittelpunkt der beiden Finger bestimmen */

			const rechteck = sichtfenster.getBoundingClientRect();

			const mittelpunktX =
				(finger1.clientX + finger2.clientX) / 2 -
				rechteck.left;

			const mittelpunktY =
				(finger1.clientY + finger2.clientY) / 2 -
				rechteck.top;

			/* Spielfeld unter dem Fingermittelpunkt halten */

			memoryZoomVersatzX =
				mittelpunktX -
				memoryTouchInhaltX * memoryZoomFaktor;

			memoryZoomVersatzY =
				mittelpunktY -
				memoryTouchInhaltY * memoryZoomFaktor;

			/* Zoom und Verschiebung anzeigen */

			memoryZoomZeichnen();

			/* Versehentlichen Kartenklick verhindern */

            sichtfenster.dataset.memoryWurdeGezogen = "ja";

        },
        { passive: false }
    );

		/* Ende Memory: Zwei-Finger-Zoom */
		/* -----------------------------------
	   Memory: Touch-Geste beenden
	   ----------------------------------- */

	function memoryTouchBeenden(ereignis) {

		/* Keine Finger mehr auf dem Spielfeld */

		if (ereignis.touches.length === 0) {

			memoryTouchStart = null;
			memoryTouchAbstand = 0;

			return;
		}

		/* Nach Zwei-Finger-Geste bleibt ein Finger */

		if (ereignis.touches.length === 1) {

			const finger = ereignis.touches[0];

			memoryTouchAbstand = 0;

			memoryTouchStart = {
				startX: finger.clientX,
				startY: finger.clientY,
				versatzX: memoryZoomVersatzX,
				versatzY: memoryZoomVersatzY
			};
		}

	}

	/* Finger loslassen oder Geste abbrechen */

	sichtfenster.addEventListener(
		"touchend",
		memoryTouchBeenden
	);

	sichtfenster.addEventListener(
		"touchcancel",
		memoryTouchBeenden
	);

	/* Ende Memory: Touch-Geste beenden */
}

/* Ende Memory: Touch-Steuerung */
/* -----------------------------------
   Bild vollständig laden
   ----------------------------------- */

function memoryBildLaden(pfad) {

    return new Promise(function (resolve, reject) {

        const bild = new Image();

        bild.onload = async function () {

            try {

                if (typeof bild.decode === "function") {
                    await bild.decode();
                }

                resolve(bild);

            } catch (fehler) {
                reject(fehler);
            }
        };

        bild.onerror = function () {
            reject(new Error("Bild konnte nicht geladen werden: " + pfad));
        };

        bild.src = pfad;

    });

} /* Ende memoryBildLaden */

/* -----------------------------------
   Alle Grafiken vorbereiten
   ----------------------------------- */

async function memoryGrafikenVorbereiten() {

    if (!raster || !ladeanzeige || !raster.isConnected) {
        return;
    }

    raster.style.display = "none";
    raster.replaceChildren();

    ladeanzeige.textContent = "Spielkarten werden geladen ...";
	let zeitbegrenzung;

try {
/* -----------------------------------
   Memory: Standarddeck auswählen
   ----------------------------------- */

const katalog = await memoryDeckKatalogLaden();

const deck = katalog.decks.find(function (eintrag) {
    return eintrag.id === katalog.standardDeck;
});

if (!deck || !Array.isArray(deck.karten) ||
    deck.karten.length < 15) {

    throw new Error("Standarddeck fehlt oder enthält zu wenige Karten.");
}

kartenpfad = deck.kartenpfad;
rueckseite = deck.rueckseite;

/* 15 verschiedene Motive zufällig auswählen */

const gemischt = [...deck.karten];

for (let i = gemischt.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
}

dateien = gemischt.slice(0, 15);

/* Ende Memory: Standarddeck auswählen */
/* -----------------------------------
   Memory: Bildpfade des Decks erzeugen
   ----------------------------------- */

const pfade = dateien.map(function (dateiname) {

    return kartenpfad + encodeURIComponent(dateiname);

});

/* Ende Memory: Bildpfade des Decks erzeugen */

    pfade.push(rueckseite);

    /* Alle 16 Bilder parallel laden */

        const laden = Promise.all(
            pfade.map(memoryBildLaden)
        );

        /* Höchstens 15 Sekunden warten */

        const zeitlimit = new Promise(function (_, reject) {

            zeitbegrenzung = setTimeout(function () {
                reject(new Error("Ladezeit überschritten"));
            }, 15000);

        });

        await Promise.race([laden, zeitlimit]);

        /* Wurde das Memory inzwischen verlassen? */

        if (!raster.isConnected || !ladeanzeige.isConnected) {
            return;
        }
/* -----------------------------------
   Memory: Aufgedeckte Karten zählen
   ----------------------------------- */

let aufgedeckteKarten = 0;
let ersteKarte = null;
/* -----------------------------------
   Memory: Gefundene Paare zählen
   ----------------------------------- */

let gefundenePaare = 0;

const paareAnzeige =
    document.getElementById("memoryPaareAnzeige");

/* Ende Memory: Gefundene Paare zählen */
/* Ende Memory: Aufgedeckte Karten zählen */
        /* 15 Paare erzeugen und mischen */

        const karten = [...dateien, ...dateien];

        for (let i = karten.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [karten[i], karten[j]] = [karten[j], karten[i]];
        }


/* -----------------------------------
   Doppelseitige Spielkarten erzeugen
   ----------------------------------- */

const fragment = document.createDocumentFragment();

for (const name of karten) {

    /* Äußerer Kartenrahmen */

    const karte = document.createElement("div");
    karte.className = "memoryTestKarte";
    karte.dataset.spieler = name;

    /* Drehbarer Teil */

    const inneres = document.createElement("div");
    inneres.className = "memoryKartenInneres";

    /* Rückseite */

    const hinten = document.createElement("div");
    hinten.className = "memoryKartenSeite memoryKartenHinten";

    const rueckbild = document.createElement("img");
    rueckbild.src = rueckseite;
    rueckbild.alt = "Verdeckte Spielkarte";
    rueckbild.draggable = false;

    hinten.appendChild(rueckbild);

    /* Vorderseite */

    const vorne = document.createElement("div");
    vorne.className = "memoryKartenSeite memoryKartenVorne";

    const vorderbild = document.createElement("img");

/* -----------------------------------
   Memory: Vorderseite aus aktivem Deck
   ----------------------------------- */

vorderbild.src =
    kartenpfad + encodeURIComponent(name);

/* Ende Memory: Vorderseite aus aktivem Deck */

    vorderbild.alt = name;
    vorderbild.draggable = false;

    vorne.appendChild(vorderbild);

    /* Karte zusammensetzen */

    inneres.appendChild(hinten);
    inneres.appendChild(vorne);

    karte.appendChild(inneres);

    /* -----------------------------------
       Karte beim Anklicken aufdecken
       ----------------------------------- */


    /* -----------------------------------
       Karte aufdecken und Paar vergleichen
       ----------------------------------- */

    karte.addEventListener("click", async function () {

        /* Während des Vergleichs keine weiteren Klicks */

        if (aufgedeckteKarten >= 2) {
            return;
        }

        /* Bereits aufgedeckte Karten ignorieren */

        if (karte.classList.contains("aufgedeckt")) {
            return;
        }

        /* Karte wenden */

        karte.classList.add("aufgedeckt");
        aufgedeckteKarten++;

        /* Erste Karte merken */

        if (ersteKarte === null) {
            ersteKarte = karte;
            return;
        }

        /* Zweite Karte merken */

        const zweiteKarte = karte;

        /* Aufdeckanimation abwarten: 0,4 Sekunden */

        await new Promise(function (resolve) {
            setTimeout(resolve, 400);
        });

        /* Memory inzwischen verlassen? */

        if (!raster.isConnected) {
            return;
        }

        /* -----------------------------------
           Gleiche Karten gefunden
           ----------------------------------- */

        if (
            ersteKarte.dataset.spieler ===
            zweiteKarte.dataset.spieler
        ) {

            ersteKarte.classList.add("gefunden");
            zweiteKarte.classList.add("gefunden");
            /* Paarzähler aktualisieren */

            gefundenePaare++;

            if (paareAnzeige) {
                paareAnzeige.textContent =
                    "Paare: " + gefundenePaare + " / 15";
            }

            /* Ende Paarzähler aktualisieren */
		/* Beide Karten bleiben 1,5 Sekunden leuchtend sichtbar */

		await new Promise(function (resolve) {
			setTimeout(resolve, 1500);
		});

		/* Memory inzwischen verlassen? */

		if (!raster.isConnected) {
			return;
		}

		/* Ende Betrachtungszeit */

		/* -----------------------------------
		   Gefundenes Paar verschwinden lassen
		   ----------------------------------- */

		/* Beide Karten gleichzeitig animieren */

		ersteKarte.classList.add("memoryPaarVerschwindet");
		zweiteKarte.classList.add("memoryPaarVerschwindet");

		/* Gleichzeitig Zoom zurücksetzen */

		memoryZoomZuruecksetzen();

		/* Beide Animationen dauern 500 ms */

		await new Promise(function (resolve) {
			setTimeout(resolve, 500);
		});

		/* Memory inzwischen verlassen? */

		if (!raster.isConnected) {
			return;
		}

		/* Nächsten Zug freigeben */

		ersteKarte = null;
		aufgedeckteKarten = 0;

		/* Ende gefundenes Paar verschwinden lassen */

		return;
        }

        /* Ende gleiche Karten gefunden */

        /* -----------------------------------
           Unterschiedliche Karten
           ----------------------------------- */

        /* 1,5 Sekunden Betrachtungszeit */

        await new Promise(function (resolve) {
            setTimeout(resolve, 1500);
        });

        if (!raster.isConnected) {
            return;
        }

        /* Beide Karten zurückdrehen */

        ersteKarte.classList.remove("aufgedeckt");
        zweiteKarte.classList.remove("aufgedeckt");

        /* Rückwendeanimation: 0,4 Sekunden */

        await new Promise(function (resolve) {
            setTimeout(resolve, 400);
        });

        if (!raster.isConnected) {
            return;
        }

		/* Zoom nach falschem Paar zurücksetzen */

		memoryZoomZuruecksetzen();

		/* Ende Zoom zurücksetzen */

		/* Nächste Auswahl freigeben */

		ersteKarte = null;
		aufgedeckteKarten = 0;

        /* Ende unterschiedliche Karten */

    });

    /* Ende Karte beim Anklicken aufdecken */


    fragment.appendChild(karte);
}

raster.appendChild(fragment);

/* Ende doppelseitige Spielkarten erzeugen */


        ladeanzeige.textContent = "";
        ladeanzeige.style.display = "none";
        raster.style.display = "grid";

    } catch (fehler) {

        if (!raster.isConnected || !ladeanzeige.isConnected) {
            return;
        }

        console.error("Memory-Ladefehler:", fehler);

        ladeanzeige.replaceChildren();

        const meldung = document.createElement("div");
        meldung.textContent =
            "Die Spielkarten konnten nicht vollständig geladen werden.";

        const wiederholen = document.createElement("button");
        wiederholen.type = "button";
        wiederholen.textContent = "Erneut versuchen";

        wiederholen.addEventListener("click", function () {
            memoryGrafikenVorbereiten();
        }, { once: true });

        ladeanzeige.appendChild(meldung);
        ladeanzeige.appendChild(wiederholen);

    } finally {

        clearTimeout(zeitbegrenzung);

    }

} /* Ende memoryGrafikenVorbereiten */

/* -----------------------------------
   Ladevorgang starten
   ----------------------------------- */

memoryGrafikenVorbereiten();

}; /* Ende memorySpielStarten */

/* Ende Memory: Grafiken sicher laden */