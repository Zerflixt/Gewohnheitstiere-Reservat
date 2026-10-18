/* =========================================================
RESERVAT - ZENTRALE TAGESZEITSTEUERUNG
========================================================= */

window.reservatTageszeitBestimmen =
function () {

    /* -----------------------------------
    Deutsche Stunde ermitteln
    ----------------------------------- */

    const stunde = Number(
        new Intl.DateTimeFormat("de-DE", {
            timeZone: "Europe/Berlin",
            hour: "2-digit",
            hourCycle: "h23"
        }).format(new Date())
    );

    /* -----------------------------------
    Tag oder Nacht zurückgeben
    ----------------------------------- */

    if (stunde >= 7 && stunde < 19) {
        return "tag";
    }

    return "nacht";

}; /* Ende reservatTageszeitBestimmen */
/* =========================================================
RESERVAT - TAGESZEITWECHSEL ÜBERWACHEN
========================================================= */

window.reservatLetzteTageszeit =
    window.reservatTageszeitBestimmen();


window.reservatTageszeitPruefen =
function () {

    /* -----------------------------------
    Aktuelle Tageszeit ermitteln
    ----------------------------------- */

    const neueTageszeit =
        window.reservatTageszeitBestimmen();


    /* -----------------------------------
    Nur bei tatsächlichem Wechsel reagieren
    ----------------------------------- */

    if (
        neueTageszeit ===
        window.reservatLetzteTageszeit
    ) {
        return;
    }


    window.reservatLetzteTageszeit =
        neueTageszeit;


    /* -----------------------------------
    Kartengrafiken aktualisieren
    ----------------------------------- */

    if (
        typeof window.kartenGrafikAktualisieren ===
        "function"
    ) {
        window.kartenGrafikAktualisieren();
    }
    /* -----------------------------------
    Umgebungsgeräusche aktualisieren
    ----------------------------------- */

    const position =
        window.aktuelleSpielerPosition;

    if (
        position &&
        typeof window.reservatUmgebungSoundsAktualisieren ===
            "function"
    ) {

        window.reservatUmgebungSoundsAktualisieren(
            position.karte,
            position.x,
            position.y
        );

    }

    /* Ende Umgebungsgeräusche aktualisieren */
}; /* Ende reservatTageszeitPruefen */


/* -----------------------------------
Überwachung einmal pro 5 Minuten
----------------------------------- */

window.reservatTageszeitIntervall =
    setInterval(
        window.reservatTageszeitPruefen,
        300000
    );

/* Ende Tageszeitwechsel überwachen */
/* Ende zentrale Tageszeitsteuerung */