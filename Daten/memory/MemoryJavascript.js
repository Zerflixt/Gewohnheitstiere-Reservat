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
   Memory: Eigenen Reservatsavatar anzeigen
   ----------------------------------- */

const memoryAvatarPlatz =
    document.getElementById("memorySpielerAvatar");

const memoryEigeneUid =
    window.firebaseAuth?.currentUser?.uid;

const memoryOriginalAvatar =
    memoryEigeneUid
        ? window.avatarNachUid?.[memoryEigeneUid]
        : null;

if (memoryAvatarPlatz && memoryOriginalAvatar) {

    const memoryAvatarKopie =
        document.createElement("canvas");

    memoryAvatarKopie.width =
        memoryOriginalAvatar.width;

    memoryAvatarKopie.height =
        memoryOriginalAvatar.height;

    const memoryAvatarKontext =
        memoryAvatarKopie.getContext("2d");

    memoryAvatarKontext.drawImage(
        memoryOriginalAvatar,
        0,
        0
    );

    memoryAvatarKopie.style.width = "100%";
    memoryAvatarKopie.style.height = "100%";
    memoryAvatarKopie.style.objectFit = "contain";

    memoryAvatarPlatz.appendChild(memoryAvatarKopie);

}

/* Ende Memory: Eigenen Reservatsavatar anzeigen */
/* -----------------------------------
   Memory: Spielzeit vorbereiten
   ----------------------------------- */

const memoryZeitAnzeige =
    document.getElementById("memoryZeitAnzeige");

let memorySpielGestartet = false;
let memoryStartzeit = 0;
let memoryZeitIntervall = null;
/* -----------------------------------
   Memory: Spielabschluss merken
   ----------------------------------- */

let memorySpielAbgeschlossen = false;

/* Ende Memory: Spielabschluss merken */
/* -----------------------------------
   Memory: Verlassen des Spiels steuern
   ----------------------------------- */

const memoryZurueckButton =
    document.getElementById("memoryZurueckButton");

if (memoryZurueckButton) {

    memoryZurueckButton.addEventListener(
        "click",
        function () {

		/* -----------------------------------
		   Memory: Verlassen ohne Abbruchwarnung
		   ----------------------------------- */

		/* Noch nicht gestartet oder bereits gewonnen */

		if (!memorySpielGestartet || memorySpielAbgeschlossen) {

			SugarCube.Engine.play("Spielfeld");
			return;

		}

/* Ende Memory: Verlassen ohne Abbruchwarnung */

/* -----------------------------------
   Memory: Laufende Runde verlassen
   ----------------------------------- */

memoryAbbruchDialogAnzeigen().then(function (beenden) {

    /* Spieler möchte weiterspielen */

    if (!beenden) {
        return;
    }

    /* Spieler möchte die Runde beenden */

    clearInterval(memoryZeitIntervall);
    memoryZeitIntervall = null;

    SugarCube.Engine.play("Spielfeld");

});

/* Ende Memory: Laufende Runde verlassen */

        }
    );

}

/* Ende Memory: Verlassen des Spiels steuern */

function memoryZeitAktualisieren() {

    if (!memorySpielGestartet || !raster.isConnected) {

        clearInterval(memoryZeitIntervall);
        memoryZeitIntervall = null;
        return;

    }

    const vergangeneSekunden =
        Math.floor(
            (Date.now() - memoryStartzeit) / 1000
        );

    const minuten =
        Math.floor(vergangeneSekunden / 60);

    const sekunden =
        vergangeneSekunden % 60;

		if (memoryZeitAnzeige) {

			memoryZeitAnzeige.textContent =
				String(minuten).padStart(2, "0") +
				":" +
				String(sekunden).padStart(2, "0");

		}

} /* Ende memoryZeitAktualisieren */

/* Ende Memory: Spielzeit vorbereiten */
/* -----------------------------------
   Memory: Fantasy-Startdialog anzeigen
   ----------------------------------- */

function memoryStartDialogAnzeigen() {

    return new Promise(function (resolve) {

        /* Dunklen Hintergrund erstellen */

        const overlay = document.createElement("div");
        overlay.id = "memoryStartOverlay";

        /* Dialogtafel erstellen */

        const dialog = document.createElement("div");
        dialog.id = "memoryStartDialog";

        /* Textbereich erstellen */

        const inhalt = document.createElement("div");
        inhalt.id = "memoryStartInhalt";

        const titel = document.createElement("h2");
        titel.id = "memoryStartTitel";
        titel.textContent = "Das Memory beginnt!";

        const beschreibung = document.createElement("p");
        beschreibung.id = "memoryStartText";
        beschreibung.textContent =
            "Finde alle 15 Kartenpaare mit möglichst " +
            "wenigen Versuchen und in möglichst kurzer Zeit. " +
            "Bist du bereit?";

        inhalt.appendChild(titel);
        inhalt.appendChild(beschreibung);

        /* Grafische Buttons erstellen */

        const buttons = document.createElement("div");
        buttons.id = "memoryStartButtons";

function buttonErstellen(datei, beschriftung, ergebnis) {

    const button = document.createElement("button");
    button.type = "button";
    button.className = "memoryDialogButton";
    button.setAttribute("aria-label", beschriftung);

    const bild = document.createElement("img");
    bild.src = "Daten/memory/" + datei;
    bild.alt = beschriftung;
    bild.draggable = false;

    button.appendChild(bild);

            button.addEventListener("click", async function () {

                overlay.remove();
                resolve(ergebnis);

            }, { once: true });

            return button;
        }

        buttons.appendChild(
            buttonErstellen(
                "Memory_Button_START_260x90.webp",
                "Start",
                true
            )
        );

        buttons.appendChild(
            buttonErstellen(
                "Memory_Button_ABBRECHEN_260x90.webp",
                "Abbrechen",
                false
            )
        );

        dialog.appendChild(inhalt);
        dialog.appendChild(buttons);
        overlay.appendChild(dialog);

        document.body.appendChild(overlay);

    });

} /* Ende memoryStartDialogAnzeigen */

/* Ende Memory: Fantasy-Startdialog anzeigen */
/* -----------------------------------
   Memory: Fantasy-Abbruchdialog anzeigen
   ----------------------------------- */

function memoryAbbruchDialogAnzeigen() {

    return new Promise(function (resolve) {

        /* Dunklen Hintergrund erstellen */

        const overlay = document.createElement("div");
        overlay.id = "memoryStartOverlay";

        /* Vorhandene Fantasy-Tafel verwenden */

        const dialog = document.createElement("div");
        dialog.id = "memoryStartDialog";

        /* Warnung anzeigen */

        const inhalt = document.createElement("div");
        inhalt.id = "memoryStartInhalt";

        const titel = document.createElement("h2");
        titel.id = "memoryStartTitel";
        titel.textContent = "Memory verlassen?";

        const beschreibung = document.createElement("p");
        beschreibung.id = "memoryStartText";
        beschreibung.textContent =
            "Wenn du das Memory jetzt verlässt, " +
            "wird deine laufende Runde abgebrochen. " +
            "Dein Ergebnis wird nicht gespeichert.";

        inhalt.appendChild(titel);
        inhalt.appendChild(beschreibung);

        /* Grafische Buttons erstellen */

        const buttons = document.createElement("div");
        buttons.id = "memoryStartButtons";

        function buttonErstellen(datei, beschriftung, ergebnis) {

            const button = document.createElement("button");
            button.type = "button";
            button.className = "memoryDialogButton";
            button.setAttribute("aria-label", beschriftung);

            const bild = document.createElement("img");
            bild.src = "Daten/memory/" + datei;
            bild.alt = beschriftung;

            button.appendChild(bild);

            button.addEventListener("click", function () {

                overlay.remove();
                resolve(ergebnis);

            }, { once: true });

            return button;

        } /* Ende buttonErstellen */

        buttons.appendChild(
            buttonErstellen(
                "Memory_Button_Weiterspielen_260x90.webp",
                "Weiterspielen",
                false
            )
        );

        buttons.appendChild(
            buttonErstellen(
                "Memory_Button_Beenden_260x90.webp",
                "Beenden",
                true
            )
        );

        dialog.appendChild(inhalt);
        dialog.appendChild(buttons);
        overlay.appendChild(dialog);

        document.body.appendChild(overlay);

    });

} /* Ende memoryAbbruchDialogAnzeigen */

/* Ende Memory: Fantasy-Abbruchdialog anzeigen */
/* -----------------------------------
   Memory: Deutsche Kalenderzeiträume
   ----------------------------------- */

function memoryZeitraeumeErmitteln() {

    /* Aktuelles Datum in Deutschland */

    const teile = new Intl.DateTimeFormat(
        "en-GB",
        {
            timeZone: "Europe/Berlin",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(new Date());

    const wert = function (typ) {
        return teile.find(
            teil => teil.type === typ
        ).value;
    };

    const jahr = Number(wert("year"));
    const monat = wert("month");
    const tag = wert("day");

    const datum =
        jahr + "-" + monat + "-" + tag;

    /* ISO-Kalenderwoche: Montag bis Sonntag */

    const wochenDatum = new Date(
        Date.UTC(jahr, Number(monat) - 1, Number(tag))
    );

    const wochentag =
        wochenDatum.getUTCDay() || 7;

    wochenDatum.setUTCDate(
        wochenDatum.getUTCDate() + 4 - wochentag
    );

    const wochenJahr =
        wochenDatum.getUTCFullYear();

    const jahresanfang = new Date(
        Date.UTC(wochenJahr, 0, 1)
    );

    const kalenderwoche = Math.ceil(
        ((wochenDatum - jahresanfang) / 86400000 + 1) / 7
    );

    return {
        heute: datum,
        woche: wochenJahr + "-W" +
            String(kalenderwoche).padStart(2, "0"),
        monat: jahr + "-" + monat,
        alltime: "alltime",
        datum: datum
    };

} /* Ende memoryZeitraeumeErmitteln */
/* -----------------------------------
   Memory: Zwei Ergebnisse vergleichen
   ----------------------------------- */

function memoryErgebnisIstBesser(
    neueVersuche,
    neueZeit,
    alterRekord
) {

    /* Noch kein Rekord vorhanden */

    if (!alterRekord) {
        return true;
    }

    /* Weniger Versuche sind besser */

    if (neueVersuche < alterRekord.versuche) {
        return true;
    }

    /* Bei Gleichstand entscheidet die Zeit */

    if (
        neueVersuche === alterRekord.versuche &&
        neueZeit < alterRekord.zeitSekunden
    ) {
        return true;
    }

    return false;

} /* Ende memoryErgebnisIstBesser */
/* -----------------------------------
   Memory: Neuen Rekord prüfen
   ----------------------------------- */

function memoryIstNeuerRekord(
    neuerRekord,
    alterRekord
) {

    /* Neuer Kalenderzeitraum oder erster Rekord */

    if (
        !alterRekord ||
        neuerRekord.zeitraum !== alterRekord.zeitraum
    ) {
        return true;
    }

    /* Innerhalb desselben Zeitraums vergleichen */

    return memoryErgebnisIstBesser(
        neuerRekord.versuche,
        neuerRekord.zeitSekunden,
        alterRekord
    );

} /* Ende memoryIstNeuerRekord */
/* -----------------------------------
   Memory: Einzelnen Bestwert speichern
   ----------------------------------- */

async function memoryBestwertSpeichern(
    uid,
    bereich,
    neuerRekord
) {

    /* Speicherort des Bestwerts */

    const rekordRef = window.firebaseRef(
        window.firebaseDatabase,
        "spieler/" + uid +
        "/extern/taten/memory-single/bestwerte/" +
        bereich
    );

    /* Rekord sicher vergleichen und speichern */

    const ergebnis = await window.firebaseRunTransaction(
        rekordRef,
        function (alterRekord) {

            if (
                memoryIstNeuerRekord(
                    neuerRekord,
                    alterRekord
                )
            ) {
                return neuerRekord;
            }

            /* Kein neuer Rekord: nichts verändern */

            return undefined;
        }
    );

    /* Zurückmelden, ob gespeichert wurde */

    return ergebnis.committed;

} /* Ende memoryBestwertSpeichern */
/* -----------------------------------
   Memory: Alle Bestwerte speichern
   ----------------------------------- */

async function memoryAlleBestwerteSpeichern(
    uid,
    versuche,
    spielzeit
) {

    /* Deutsche Kalenderzeiträume bestimmen */

    const zeitraeume = memoryZeitraeumeErmitteln();

    /* Reihenfolge: Wichtigster Rekord zuerst */

    const bereiche = [
        "alltime",
        "monat",
        "woche",
        "heute"
    ];

    const neueRekorde = [];

    /* Jeden Zeitraum einzeln prüfen */

    for (const bereich of bereiche) {

        const neuerRekord = {
            versuche: versuche,
            zeitSekunden: spielzeit,
            datum: zeitraeume.datum,
            zeitraum: zeitraeume[bereich]
        };

        const gespeichert = await memoryBestwertSpeichern(
            uid,
            bereich,
            neuerRekord
        );

        if (gespeichert) {
            neueRekorde.push(bereich);
        }
    }

    /* Liste der tatsächlich übernommenen Rekorde */

    return neueRekorde;

} /* Ende memoryAlleBestwerteSpeichern */
/* -----------------------------------
   Memory: Ergebnistext bestimmen
   ----------------------------------- */

function memoryErgebnistextBestimmen(neueRekorde) {

    /* Wichtigsten erreichten Rekord anzeigen */

    if (neueRekorde.includes("alltime")) {
        return "Neuer persönlicher Allzeitrekord!";
    }

    if (neueRekorde.includes("monat")) {
        return "Neuer persönlicher Monatsrekord!";
    }

    if (neueRekorde.includes("woche")) {
        return "Neuer persönlicher Wochenrekord!";
    }

    if (neueRekorde.includes("heute")) {
        return "Neuer persönlicher Tagesrekord!";
    }

    /* Kein neuer Rekord */

    return "Dein Ergebnis wurde gespeichert.";

} /* Ende memoryErgebnistextBestimmen */
/* -----------------------------------
   Memory: Ergebnisdialog anzeigen
   ----------------------------------- */

function memoryErgebnisDialogAnzeigen(meldung) {

    /* Dunklen Hintergrund erstellen */

    const overlay = document.createElement("div");
    overlay.id = "memoryStartOverlay";

    /* Vorhandene Fantasy-Tafel verwenden */

    const dialog = document.createElement("div");
    dialog.id = "memoryStartDialog";

    const inhalt = document.createElement("div");
    inhalt.id = "memoryStartInhalt";

    /* Überschrift */

    const titel = document.createElement("h2");
    titel.id = "memoryStartTitel";
    titel.textContent = "Dein Memory-Ergebnis";

    /* Ergebnisnachricht */

    const beschreibung = document.createElement("p");
    beschreibung.id = "memoryStartText";
    beschreibung.textContent = meldung;

    inhalt.appendChild(titel);
    inhalt.appendChild(beschreibung);

    /* BEENDEN-Button */

    const buttons = document.createElement("div");
    buttons.id = "memoryStartButtons";

const button = document.createElement("button");
button.type = "button";
button.className = "memoryDialogButton";
button.setAttribute("aria-label", "Beenden");

const bild = document.createElement("img");
bild.src = "Daten/memory/Memory_Button_Beenden_260x90.webp";
bild.alt = "Beenden";
bild.draggable = false;

button.appendChild(bild);

    button.addEventListener("click", function () {

        button.disabled = true;
        overlay.remove();

        /* Zurück ins Reservat */

        SugarCube.Engine.play("Spielfeld");

    }, { once: true });

    buttons.appendChild(button);

    /* Dialog zusammensetzen */

    dialog.appendChild(inhalt);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    document.body.appendChild(overlay);

} /* Ende memoryErgebnisDialogAnzeigen */
/* -----------------------------------
   Memory: Fantasy-Gewinnmeldung anzeigen
   ----------------------------------- */

function memoryGewinnDialogAnzeigen(versuche, spielzeit) {

    /* Dunklen Hintergrund erstellen */

    const overlay = document.createElement("div");
    overlay.id = "memoryStartOverlay";

    /* Vorhandene Fantasy-Tafel verwenden */

    const dialog = document.createElement("div");
    dialog.id = "memoryStartDialog";

    /* Glückwunsch und Ergebnis */

    const inhalt = document.createElement("div");
    inhalt.id = "memoryStartInhalt";

    const titel = document.createElement("h2");
    titel.id = "memoryStartTitel";
    titel.textContent = "Hurra! Geschafft!";

    const beschreibung = document.createElement("p");
    beschreibung.id = "memoryStartText";

    const minuten = Math.floor(spielzeit / 60);
    const sekunden = spielzeit % 60;

    const zeittext =
        String(minuten).padStart(2, "0") +
        ":" +
        String(sekunden).padStart(2, "0");

    beschreibung.textContent =
        "Du hast alle 15 Paare gefunden! " +
        "Benötigte Versuche: " + versuche +
        " | Spielzeit: " + zeittext;

    inhalt.appendChild(titel);
    inhalt.appendChild(beschreibung);

    /* HURRA-Button erstellen */

    const buttons = document.createElement("div");
    buttons.id = "memoryStartButtons";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "memoryDialogButton";
    button.setAttribute("aria-label", "Hurra");

    const bild = document.createElement("img");
    bild.src =
        "Daten/memory/Memory_Button_Hurra_260x90.webp";
    bild.alt = "Hurra";
    bild.draggable = false;

    button.appendChild(bild);

	button.addEventListener("click", async function () {

    /* Mehrfachklick verhindern */

    button.disabled = true;

    overlay.remove();

    /* -----------------------------------
       Memory: Abgeschlossenes Spiel zählen
       ----------------------------------- */

    try {

        const uid = window.firebaseAuth.currentUser.uid;

        const zaehlerRef = window.firebaseRef(
            window.firebaseDatabase,
            "spieler/" + uid +
            "/extern/taten/memory-single/spieleBeendet"
        );
/* -----------------------------------
   Memory: Abgeschlossene Spiele erhöhen
   ----------------------------------- */

await window.firebaseRunTransaction(
    zaehlerRef,
    function (bisher) {
        return (bisher || 0) + 1;
    }
);

/* Ende Memory: Abgeschlossene Spiele erhöhen */
/* -----------------------------------
   Memory: Letztes Spiel speichern
   ----------------------------------- */

const letztesSpielRef = window.firebaseRef(
    window.firebaseDatabase,
    "spieler/" + uid +
    "/extern/taten/memory-single/letztesSpiel"
);

await window.firebaseSet(
    letztesSpielRef,
    Date.now()
);

/* Ende Memory: Letztes Spiel speichern */
/* -----------------------------------
   Memory: Vier Bestwerte speichern
   ----------------------------------- */

const neueRekorde = await memoryAlleBestwerteSpeichern(
    uid,
    versuche,
    spielzeit
);

/* Ergebnistext für den zweiten Dialog bestimmen */

const meldung = memoryErgebnistextBestimmen(
    neueRekorde
);

/* Zweiten Ergebnisdialog anzeigen */

memoryErgebnisDialogAnzeigen(meldung);

/* Ende Memory: Vier Bestwerte speichern */

    } catch (fehler) {

        console.error(
            "Memory: Spielabschluss konnte nicht gespeichert werden.",
            fehler
        );

        /* Auch bei Fehler einen Abschluss ermöglichen */

        memoryErgebnisDialogAnzeigen(
            "Konnte nicht gespeichert werden."
        );

    }

    /* Ende Memory: Abgeschlossenes Spiel zählen */

}, { once: true });

    buttons.appendChild(button);

    /* Dialog zusammensetzen */

    dialog.appendChild(inhalt);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    document.body.appendChild(overlay);

} /* Ende memoryGewinnDialogAnzeigen */

/* Ende Memory: Fantasy-Gewinnmeldung anzeigen */
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
   Memory: Spielversuche zählen
   ----------------------------------- */

let memoryVersuche = 0;

/* Ende Memory: Spielversuche zählen */
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
/* -----------------------------------
   Memory: Spiel beim ersten Klick starten
   ----------------------------------- */

if (!memorySpielGestartet) {

const bestaetigt =
    await memoryStartDialogAnzeigen();

    if (!bestaetigt) {
        return;
    }

    memorySpielGestartet = true;
	/* -----------------------------------
   Memory: Spielbeginn in Firebase zählen
   ----------------------------------- */

try {

    const uid = window.firebaseAuth.currentUser.uid;

    const zaehlerRef = window.firebaseRef(
        window.firebaseDatabase,
        "spieler/" + uid +
        "/extern/taten/memory-single/spieleBegonnen"
    );

    window.firebaseRunTransaction(
        zaehlerRef,
        function (bisher) {
            return (bisher || 0) + 1;
        }
    ).catch(function (fehler) {

        console.error(
            "Memory: Spielbeginn konnte nicht gespeichert werden.",
            fehler
        );

    });

} catch (fehler) {

    console.error(
        "Memory: Spielbeginn konnte nicht gespeichert werden.",
        fehler
    );

}

/* Ende Memory: Spielbeginn in Firebase zählen */
    memoryStartzeit = Date.now();

    memoryZeitAktualisieren();

    memoryZeitIntervall = setInterval(
        memoryZeitAktualisieren,
        250
    );

}

/* Ende Memory: Spiel beim ersten Klick starten */
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
		/* -----------------------------------
		   Memory: Versuch zählen
		   ----------------------------------- */

		memoryVersuche++;

		/* Versuchszahl in der Anzeige aktualisieren */

		const versucheAnzeige =
			document.getElementById("memoryVersucheAnzeige");

		if (versucheAnzeige) {
			versucheAnzeige.textContent = memoryVersuche;
		}

		/* Ende Memory: Versuch zählen */

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
				gefundenePaare + "/15";
		}

            /* Ende Paarzähler aktualisieren */
			/* -----------------------------------
   Memory: Spielende erkennen
   ----------------------------------- */

if (gefundenePaare === 15) {
	    /* Runde erfolgreich abgeschlossen */

    memorySpielAbgeschlossen = true;

    /* Endgültige Spielzeit festhalten */

    const memoryEndzeit = Date.now();

    const memorySpielzeitSekunden =
        Math.floor(
            (memoryEndzeit - memoryStartzeit) / 1000
        );

    /* Stoppuhr anhalten */

    clearInterval(memoryZeitIntervall);
    memoryZeitIntervall = null;

    /* Letzten Zeitstand anzeigen */

    const minuten =
        Math.floor(memorySpielzeitSekunden / 60);

    const sekunden =
        memorySpielzeitSekunden % 60;

    if (memoryZeitAnzeige) {

        memoryZeitAnzeige.textContent =
            String(minuten).padStart(2, "0") +
            ":" +
            String(sekunden).padStart(2, "0");

    }

    /* Ergebnis vorerst zur Kontrolle ausgeben */

    console.log(
        "Memory geschafft!",
        "Versuche:", memoryVersuche,
        "Zeit:", memorySpielzeitSekunden, "Sekunden"
    );

}

/* Ende Memory: Spielende erkennen */
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
/* -----------------------------------
   Memory: Gewinnmeldung nach Animation
   ----------------------------------- */

if (memorySpielAbgeschlossen) {

    memoryGewinnDialogAnzeigen(
        memoryVersuche,
        Number(
            memoryZeitAnzeige.textContent.split(":")[0]
        ) * 60 +
        Number(
            memoryZeitAnzeige.textContent.split(":")[1]
        )
    );

}

/* Ende Memory: Gewinnmeldung nach Animation */
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