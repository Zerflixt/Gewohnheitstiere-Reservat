/*========================================*/
/* RESERVAT – INFORMATIONSOBJEKTE          */
/* Wegweiser, Infotafeln und Aushänge      */
/*========================================*/

(function () {
    "use strict";

    /*------------------------------------*/
    /* Versionsinformation                */
    /*------------------------------------*/

    window.infotafelnVersion = "0.1";

    /*------------------------------------*/
    /* Initialisierung                    */
    /*------------------------------------*/

    window.infotafelnBereit = true;



    /* Ende Initialisierung */
/* =========================================================
INFORMATIONSFENSTER ANZEIGEN
========================================================= */

window.infotafelAnzeigen =
function (sonderfeld) {

    /* -----------------------------------
    Spielfeld suchen
    ----------------------------------- */

    const spielfeld =
        document.getElementById("spielfeld");

    if (!spielfeld) {
        console.error("Infotafel: Spielfeld nicht gefunden.");
        return;
    }

    /* -----------------------------------
    Bereits vorhandenes Fenster entfernen
    ----------------------------------- */

    document.getElementById(
        "reservatInfotafelFenster"
    )?.remove();

    /* -----------------------------------
    Fenster erzeugen
    ----------------------------------- */

    const fenster =
        document.createElement("div");

    fenster.id =
        "reservatInfotafelFenster";
/* -----------------------------------
Fenster für ersten Test positionieren
----------------------------------- */

/* -----------------------------------
Fenster innerhalb der Karte platzieren
----------------------------------- */

fenster.style.position = "absolute";

fenster.style.left = "50%";
fenster.style.top = "50%";

fenster.style.transform =
    "translate(-50%, -50%)";

fenster.style.zIndex = "10000";

/* -----------------------------------
Größe auf Kartenbereich begrenzen
----------------------------------- */

fenster.style.width = "90%";
fenster.style.maxWidth = "none";

fenster.style.maxHeight = "none";

fenster.style.pointerEvents = "auto";
    /* -----------------------------------
    Hintergrundgrafik erzeugen
    ----------------------------------- */

    const hintergrund =
        document.createElement("img");

    hintergrund.id =
        "reservatInfotafelHintergrund";

hintergrund.src =
    "Daten/Objekte/Infotafeln/" +
    "Changelog-Tafel/infotafel_dialog.png";

/* -----------------------------------
Hintergrund an Fensterbreite anpassen
----------------------------------- */

hintergrund.style.display = "block";
hintergrund.style.width = "100%";
hintergrund.style.height = "auto";

/* -----------------------------------
Hintergrund einsetzen
----------------------------------- */

fenster.appendChild(hintergrund);

/* -----------------------------------
Textbereich der Informationsansicht
----------------------------------- */

const textbereich =
    document.createElement("div");

textbereich.id =
    "reservatInfotafelText";

textbereich.style.position = "absolute";

textbereich.style.left = "19%";
textbereich.style.top = "22%";

textbereich.style.width = "64%";
textbereich.style.height = "58%";

textbereich.style.overflowY = "auto";
textbereich.style.overflowX = "hidden";

textbereich.style.color = "white";
textbereich.style.fontSize = "clamp(12px, 1.8vw, 22px)";
textbereich.style.lineHeight = "1.5";

textbereich.style.zIndex = "5";

/* -----------------------------------
Vorläufiger Testinhalt
----------------------------------- */


/* -----------------------------------
Changelog aus JSON laden
----------------------------------- */

textbereich.textContent =
    "Änderungsübersicht wird geladen …";

textbereich.style.whiteSpace = "pre-line";

fetch("Daten/Objekte/Infotafeln/changelog.json")
    .then(function (antwort) {

        if (!antwort.ok) {
            throw new Error(
                "HTTP-Fehler " + antwort.status
            );
        }

        return antwort.json();

    })
    .then(function (daten) {

        /* -----------------------------------
        Einträge nach Datum sortieren
        ----------------------------------- */

        const eintraege =
            [...daten.eintraege].sort(
                function (a, b) {
                    return b.datum.localeCompare(a.datum);
                }
            );

        /* -----------------------------------
        Vorläufige Textdarstellung
        ----------------------------------- */

/* -----------------------------------
Alten Text entfernen
----------------------------------- */

textbereich.replaceChildren();

/* -----------------------------------
Changelog-Einträge darstellen
----------------------------------- */

eintraege.forEach(function (eintrag) {

    /* Überschrift mit Datum */

    const kopf =
        document.createElement("div");

    kopf.style.color = "#e6bd62";
    kopf.style.fontWeight = "bold";
    kopf.style.marginBottom = "8px";

	kopf.textContent =
		eintrag.version +
		" " + eintrag.datum +
		" " + eintrag.titel;

    textbereich.appendChild(kopf);

    /* Beschreibung */

    const beschreibung =
        document.createElement("div");

    beschreibung.style.color = "#ffffff";
    beschreibung.style.whiteSpace = "pre-line";
    beschreibung.style.marginBottom = "28px";

    beschreibung.textContent =
        eintrag.text;

    textbereich.appendChild(beschreibung);

});

/* -----------------------------------
Beim Öffnen immer oben beginnen
----------------------------------- */

textbereich.scrollTop = 0;

    })
    .catch(function (fehler) {

        console.error(
            "Changelog konnte nicht geladen werden:",
            fehler
        );

        textbereich.textContent =
            "Die Änderungsübersicht konnte nicht geladen werden.";

    });

/* Ende Changelog laden */



fenster.appendChild(textbereich);

/* Ende Textbereich */
/* -----------------------------------
Schließen-Knopf erzeugen
----------------------------------- */

const schliessen =
    document.createElement("img");

schliessen.id =
    "reservatInfotafelSchliessen";

schliessen.src =
    "Daten/Objekte/Infotafeln/" +
    "Changelog-Tafel/X-Icon-infotafel.png";

schliessen.alt = "Schließen";

schliessen.style.position = "absolute";
schliessen.style.top = "11.8%";
schliessen.style.right = "12.2%";
schliessen.style.width = "8%";
schliessen.style.height = "auto";

schliessen.style.cursor = "pointer";
schliessen.style.zIndex = "10";

/* -----------------------------------
Fenster beim Anklicken schließen
----------------------------------- */

schliessen.addEventListener(
    "click",
    function () {

        fenster.remove();

    }
);

fenster.appendChild(schliessen);

/* Ende Schließen-Knopf */
/* -----------------------------------
Rückpfeil erzeugen
----------------------------------- */

const zurueck =
    document.createElement("img");

zurueck.id =
    "reservatInfotafelZurueck";

zurueck.src =
    "Daten/Objekte/Infotafeln/" +
    "Changelog-Tafel/Rückpfeil.png";

zurueck.alt = "Zurück";

zurueck.style.position = "absolute";

zurueck.style.top = "11.8%";
zurueck.style.left = "12.2%";

zurueck.style.width = "8%";
zurueck.style.height = "auto";

zurueck.style.cursor = "pointer";
zurueck.style.zIndex = "10";

/* -----------------------------------
Informationsfenster schließen
----------------------------------- */

zurueck.addEventListener(
    "click",
    function () {

        fenster.remove();

    }
);

fenster.appendChild(zurueck);

/* Ende Rückpfeil */
    /* -----------------------------------
    Fenster ins Spielfeld einsetzen
    ----------------------------------- */

    spielfeld.appendChild(fenster);

}; /* Ende infotafelAnzeigen */
})();

/* Ende Informationsobjekte */