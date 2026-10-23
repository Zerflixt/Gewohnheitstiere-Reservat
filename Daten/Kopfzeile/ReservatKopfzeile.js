/* =========================================================
FIREBASE-VERBINDUNGSANZEIGE AKTUALISIEREN
========================================================= */

window.firebaseVerbindungsanzeigeAktualisieren =
function () {

    const anzeige =
        document.getElementById(
            "firebaseVerbindungsstatus"
        );

    if (!anzeige) {
        return;
    } /* Ende Anzeige-Prüfung */


    const icon =
        document.getElementById(
            "firebaseVerbindungsIcon"
        );

    if (!icon) {
        return;
    } /* Ende Icon-Prüfung */


    /* -----------------------------------
    ROT - keine Firebase-Verbindung
    ----------------------------------- */

    if (
        window.firebaseIstVerbunden !== true
    ) {

        icon.src =
            "Daten/Kopfzeile/Firebase_NOT_CONNECTED_rot.png";

        anzeige.title =
            "Firebase nicht verbunden";

        return;

    } /* Ende Rot */


    /* -----------------------------------
    BLAU - Entwickler während Wartung
    ----------------------------------- */

    if (
        window.reservatWartungAktiv === true &&
        window.istReservatEntwickler() === true
    ) {

        icon.src =
            "Daten/Kopfzeile/Firebase_WARTUNG_ENTWICKLER_blau.png";

        anzeige.title =
            "Firebase verbunden - Wartungszugang";

        return;

    } /* Ende Blau */


    /* -----------------------------------
    GRÜN - normal verbunden
    ----------------------------------- */

    icon.src =
        "Daten/Kopfzeile/Firebase_CONNECTED_gruen.png";

    anzeige.title =
        "Firebase verbunden";

}; /* Ende firebaseVerbindungsanzeigeAktualisieren */

/* =========================================================
SOUND-SYMBOL AKTUALISIEREN
========================================================= */

window.reservatSoundSymbolAktualisieren =
function () {

    const icon =
        document.getElementById(
            "soundIcon"
        );

    const button =
        document.getElementById(
            "soundButton"
        );

    if (!icon || !button) {
        return;
    }

    /* -----------------------------------
    Passendes Symbol auswählen
    ----------------------------------- */

    if (window.reservatSoundAktiv === true) {

        icon.src =
            "Daten/Icons/sound_on.png";

        button.title =
            "Sound ausschalten";

    } else {

        icon.src =
            "Daten/Icons/sound_off.png";

        button.title =
            "Sound einschalten";
    }

}; /* Ende reservatSoundSymbolAktualisieren */
/* =========================================================
VOLLBILD UMSCHALTEN
========================================================= */

window.vollbildUmschalten =
async function () {

    try {

        /* -----------------------------------
        Noch nicht im Vollbild
        ----------------------------------- */

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

            return;
        }


        /* -----------------------------------
        Vollbild wieder verlassen
        ----------------------------------- */

        await document.exitFullscreen();


    } catch (fehler) {

        console.error(
            "Vollbild konnte nicht umgeschaltet werden:",
            fehler
        );
    }
};


/* =========================================================
VOLLBILD-SYMBOL AKTUALISIEREN
========================================================= */

window.vollbildSymbolAktualisieren =
function () {

    const bild =
        document.querySelector(
            "#vollbildButton img"
        );

    if (!bild) {
        return;
    }


    /* -----------------------------------
    Passendes Symbol auswählen
    ----------------------------------- */

    if (document.fullscreenElement) {

        bild.src =
            "Daten/Icons/vollbild_verlassen_gold_64.png";

    } else {

        bild.src =
            "Daten/Icons/vollbild_einschalten_gold_64.png";
    }
};


/* -----------------------------------
Auf Änderungen des Vollbildmodus reagieren
----------------------------------- */

document.addEventListener(
    "fullscreenchange",
    function () {

        window.vollbildSymbolAktualisieren();
    }
);

/* Ende Vollbild umschalten */
/* =========================================================
GEMEINSAME KOPFZEILE AKTUALISIEREN
========================================================= */

window.reservatKopfzeileAktualisieren =
function () {

    /* Firebase-Verbindungsanzeige */
    window.firebaseVerbindungsanzeigeAktualisieren();

    /* Sound-Anzeige */
    window.reservatSoundSymbolAktualisieren();

    /* Vollbild-Anzeige */
    window.vollbildSymbolAktualisieren();

}; /* Ende reservatKopfzeileAktualisieren */