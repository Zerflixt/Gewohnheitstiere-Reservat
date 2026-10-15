
/* =========================================================
INVENTARVERWALTUNG
========================================================= */

/* =========================================================
INVENTAR - GEGENSTANDSBESITZ PRÜFEN

Prüft, ob der angemeldete Spieler
einen bestimmten Gegenstand besitzt.

Beispiel:
inventarGegenstandBesitzt("zeitungen", "25")

Rückgabe:
true  = Gegenstand vorhanden
false = Gegenstand nicht vorhanden
null  = Prüfung fehlgeschlagen
========================================================= */

window.inventarGegenstandBesitzt =
async function (kategorie, gegenstandId) {

    /* -----------------------------------
    Angemeldeten Spieler ermitteln
    ----------------------------------- */

    const user =
        window.firebaseAuth?.currentUser;

    if (!user) {

        console.error(
            "Inventarprüfung: Kein Spieler angemeldet."
        );

        return null;

    }

    /* Ende Spieler ermitteln */


    /* -----------------------------------
    Inventarpfad bestimmen
    ----------------------------------- */

    const inventarRef =
        window.firebaseRef(
            window.firebaseDatabase,
            "inventar/" +
            user.uid + "/" +
            kategorie + "/" +
            gegenstandId
        );

    /* Ende Inventarpfad bestimmen */


    /* -----------------------------------
    Gegenstand in Firebase prüfen
    ----------------------------------- */

    try {

        const snapshot =
            await window.firebaseGet(
                inventarRef
            );

        return snapshot.exists();

    } catch (fehler) {

        console.error(
            "Inventarprüfung fehlgeschlagen:",
            fehler
        );

        return null;

    }

    /* Ende Gegenstand prüfen */

}; /* Ende inventarGegenstandBesitzt */

/* Ende Inventar - Gegenstandsbesitz prüfen */
/* =========================================================
INVENTAR - ZEITUNG 25 HINZUFÜGEN

Legt Ausgabe 25 dauerhaft im Inventar
des angemeldeten Spielers ab.

Rückgabe:
true  = Zeitung erfolgreich hinzugefügt
false = Zeitung bereits vorhanden oder Fehler
========================================================= */

window.inventarZeitung25Hinzufuegen =
async function () {

    /* -----------------------------------
    Angemeldeten Spieler ermitteln
    ----------------------------------- */

    const user =
        window.firebaseAuth?.currentUser;

    if (!user) {

        console.error(
            "Zeitungsübergabe: Kein Spieler angemeldet."
        );

        return false;

    }

    /* Ende Spieler ermitteln */


    /* -----------------------------------
    Vorhandenen Besitz prüfen
    ----------------------------------- */

    const besitztZeitung =
        await window.inventarGegenstandBesitzt(
            "zeitungen",
            "25"
        );

    if (besitztZeitung !== false) {

        if (besitztZeitung === true) {

            console.info(
                "Ausgabe 25 ist bereits im Inventar."
            );

        } else {

            console.error(
                "Zeitungsbesitz konnte nicht geprüft werden."
            );

        }

        return false;

    }

    /* Ende vorhandenen Besitz prüfen */


    /* -----------------------------------
    Inventarpfad bestimmen
    ----------------------------------- */

    const zeitungRef =
        window.firebaseRef(
            window.firebaseDatabase,
            "inventar/" +
            user.uid +
            "/zeitungen/25"
        );

    /* Ende Inventarpfad bestimmen */


    /* -----------------------------------
    Zeitung speichern
    ----------------------------------- */

    try {

        await window.firebaseSet(
            zeitungRef,
            {
                erhaltenAm: Date.now(),
                quelle: "traudel"
            }
        );

        console.info(
            "Ausgabe 25 erfolgreich ins Inventar aufgenommen."
        );

        return true;

    } catch (fehler) {

        console.error(
            "Ausgabe 25 konnte nicht gespeichert werden:",
            fehler
        );

        return false;

    }

    /* Ende Zeitung speichern */

}; /* Ende inventarZeitung25Hinzufuegen */

/* Ende Inventar - Zeitung 25 hinzufügen */
/* =========================================================
INVENTAR - ZEITUNG 25 SPENDEN

Prüft, ob Ausgabe 25 gespendet werden darf.

Rückgabe:
true  = Spende möglich
false = Spende nicht möglich
null  = Prüfung fehlgeschlagen
========================================================= */

window.inventarZeitung25SpendeMoeglich =
async function () {

    /* -----------------------------------
    Zeitungsbesitz prüfen
    ----------------------------------- */

    const besitztZeitung =
        await window.inventarGegenstandBesitzt(
            "zeitungen",
            "25"
        );

    if (besitztZeitung !== true) {
        return besitztZeitung === false ? false : null;
    }

    /* Ende Zeitungsbesitz prüfen */


    /* -----------------------------------
    Frühere Spende prüfen
    ----------------------------------- */

    const user =
        window.firebaseAuth?.currentUser;

    if (!user) {
        return null;
    }

    const spendenRef =
        window.firebaseRef(
            window.firebaseDatabase,
            "zeitungsspenden/25/" + user.uid
        );

    try {

        const snapshot =
            await window.firebaseGet(spendenRef);

        return !snapshot.exists();

    } catch (fehler) {

        console.error(
            "Zeitungsspende konnte nicht geprüft werden:",
            fehler
        );

        return null;
    }

    /* Ende frühere Spende prüfen */

}; /* Ende inventarZeitung25SpendeMoeglich */

/* Ende Inventar - Zeitung 25 spenden */
/* =========================================================
INVENTAR - ZEITUNG 25 SPENDE REGISTRIEREN
========================================================= */

window.inventarZeitung25SpendeRegistrieren =
async function () {

    const user = window.firebaseAuth?.currentUser;

    if (!user) {
        return false;
    }

    const spendenRef = window.firebaseRef(
        window.firebaseDatabase,
        "zeitungsspenden/25/" + user.uid
    );

    try {

        await window.firebaseSet(
            spendenRef,
            {
                gespendetAm: Date.now()
            }
        );

        return true;

    } catch (fehler) {

        console.error(
            "Zeitungsspende konnte nicht registriert werden:",
            fehler
        );

        return false;
    }

}; /* Ende inventarZeitung25SpendeRegistrieren */

/* Ende Inventar - Zeitung 25 Spende registrieren */
/* =========================================================
INVENTAR - ZEITUNG 25 ENTFERNEN

Entfernt Ausgabe 25 aus dem Inventar.

Rückgabe:
true  = erfolgreich entfernt
false = Fehler
========================================================= */

window.inventarZeitung25Entfernen =
async function () {

    /* -----------------------------------
    Angemeldeten Spieler ermitteln
    ----------------------------------- */

    const user =
        window.firebaseAuth?.currentUser;

    if (!user) {
        return false;
    }

    /* Ende Spieler ermitteln */


    /* -----------------------------------
    Zeitung aus Firebase entfernen
    ----------------------------------- */

    const zeitungRef =
        window.firebaseRef(
            window.firebaseDatabase,
            "inventar/" +
            user.uid +
            "/zeitungen/25"
        );

    try {

        await window.firebaseSet(
            zeitungRef,
            null
        );

        return true;

    } catch (fehler) {

        console.error(
            "Ausgabe 25 konnte nicht entfernt werden:",
            fehler
        );

        return false;
    }

    /* Ende Zeitung entfernen */

}; /* Ende inventarZeitung25Entfernen */

/* Ende Inventar - Zeitung 25 entfernen */
/* =========================================================
INVENTAR - ZEITUNG 25 SPENDEN

Führt die vollständige Zeitungsspende aus.

Rückgabe:
true  = Spende erfolgreich
false = Spende nicht möglich oder fehlgeschlagen
========================================================= */

window.inventarZeitung25Spenden =
async function () {

    /* -----------------------------------
    Spendenberechtigung prüfen
    ----------------------------------- */

    const moeglich =
        await window.inventarZeitung25SpendeMoeglich();

    if (moeglich !== true) {
        return false;
    }

    /* Ende Spendenberechtigung prüfen */


    /* -----------------------------------
    Spende registrieren
    ----------------------------------- */

    const registriert =
        await window.inventarZeitung25SpendeRegistrieren();

    if (!registriert) {
        return false;
    }

    /* Ende Spende registrieren */


    /* -----------------------------------
    Zeitung entfernen
    ----------------------------------- */

    const entfernt =
        await window.inventarZeitung25Entfernen();

    if (!entfernt) {

        console.error(
            "Spende registriert, aber Zeitung konnte nicht entfernt werden."
        );

        return false;
    }

    /* Ende Zeitung entfernen */

    return true;

}; /* Ende inventarZeitung25Spenden */

/* Ende Inventar - Zeitung 25 spenden */
/* =========================================================
ENDE INVENTARVERWALTUNG
========================================================= */
