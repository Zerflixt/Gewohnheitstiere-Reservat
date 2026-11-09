
/* =========================================================
   ZEITUNGSKISTE – DIALOG
   Version 1: Nur Darstellung und Schließen
   Noch keine Firebase- oder Inventarfunktion
   ========================================================= */

/* =========================================================
ZEITUNGSKISTE – AKTUELLE AUSGABE

Bei einer neuen Veröffentlichung muss
hier nur die Ausgabennummer geändert werden.

Die Firebase-Freigabe wird separat geprüft.
========================================================= */

window.zeitungskisteAktuelleAusgabe = 26;

/* Ende aktuelle Ausgabe */

/* =========================================================
ZEITUNGSKISTE – NÄCHSTES ERSCHEINUNGSDATUM

Ausgabe 26: Sonntag, 08.11.2026
Jede weitere Ausgabe: 28 Tage später
========================================================= */

window.zeitungskisteNaechstesDatum =
function () {

    const ausgabe =
        window.zeitungskisteAktuelleAusgabe;

    const startDatum =
        new Date(Date.UTC(2026, 10, 8));

    const tage =
        (ausgabe - 25) * 28;

    startDatum.setUTCDate(
        startDatum.getUTCDate() + tage
    );

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }
    ).format(startDatum);

};

/* Ende nächstes Erscheinungsdatum */

window.zeitungskisteDialogAnzeigen = function () {

    /* Doppeltes Öffnen verhindern */

    if (document.getElementById("zeitungskisteDialog")) {
        return;
    }

    /* Dialogebene erstellen */

    const dialog = document.createElement("div");
    dialog.id = "zeitungskisteDialog";

    /* -----------------------------------
    Große Zeitungskiste als Hintergrund
    ----------------------------------- */

    const kistenBild =
        document.createElement("img");

    kistenBild.id = "zeitungskisteGross";

    kistenBild.src =
        "Daten/Objekte/Kisten/Zeitungskiste/" +
        "Zeitungskasten_768.png";

    kistenBild.alt = "";

    /* Rein dekorativ, keine Mausaktionen */

    kistenBild.style.pointerEvents = "none";

    dialog.appendChild(kistenBild);

    /* Ende große Zeitungskiste */

    /* Dialogtafel erstellen */

    const tafel = document.createElement("div");
    tafel.id = "zeitungskisteTafel";

    /* Testtext */

    const text = document.createElement("div");
    text.id = "zeitungskisteText";
    text.textContent =
        "Die neueste Wild am Sonntag ist da! " +
        "Möchtest du Ausgabe " +
        window.zeitungskisteAktuelleAusgabe +
        " haben?";

    tafel.appendChild(text);

    /* Abbrechen-Button */

    const abbrechen = document.createElement("button");
    abbrechen.id = "zeitungskisteAbbrechen";
    abbrechen.className = "zeitungskisteButton";
    abbrechen.type = "button";

    const abbrechenBild = document.createElement("img");
    abbrechenBild.src =
        "Daten/Objekte/Kisten/Zeitungskiste/" +
        "Button_ABBRECHEN_260x90.webp";
    abbrechenBild.alt = "Abbrechen";

    abbrechen.appendChild(abbrechenBild);

    abbrechen.addEventListener("click", function () {
        dialog.remove();
    });

    tafel.appendChild(abbrechen);

    /* Ja-Button – zunächst nur Test */

    const ja = document.createElement("button");
    ja.id = "zeitungskisteJa";
    ja.className = "zeitungskisteButton";
    ja.type = "button";

    /* Bis zur erfolgreichen Inventarprüfung sperren */

    ja.disabled = true;

    /* Ende anfängliche Buttonsperre */

    const jaBild = document.createElement("img");
    jaBild.src =
        "Daten/Objekte/Kisten/Zeitungskiste/" +
        "Button_Ja_Gerne.png";
    jaBild.alt = "Ja, gerne!";

    ja.appendChild(jaBild);


    /* -----------------------------------
    Aktuelle Zeitung entgegennehmen
    ----------------------------------- */

    ja.addEventListener("click", async function () {

        /* Doppelklick verhindern */

        ja.disabled = true;

        /* Vergabefunktion prüfen */

        if (
            typeof window.inventarZeitungHinzufuegen !==
            "function"
        ) {

            text.textContent =
                "Die Zeitungsvergabe ist momentan nicht verfügbar.";

            return;
        }

        /* Zeitung über Inventarverwaltung speichern */

        const erfolgreich =
            await window.inventarZeitungHinzufuegen(
                window.zeitungskisteAktuelleAusgabe,
                "zeitungskiste"
            );

        /* Dialog könnte inzwischen geschlossen sein */

        if (!dialog.isConnected) {
            return;
        }



        if (erfolgreich === true) {

            /* Zeitungssymbol sofort aktualisieren */

            if (
                typeof window.zeitung26SymbolAktualisieren ===
                "function"
            ) {

                await window.zeitung26SymbolAktualisieren();

            }

            /* Erfolg in der Ereigniszeile anzeigen */


            const ereignisText =
                document.getElementById(
                    "schnappschussTest"
                );

            if (ereignisText) {

                ereignisText.textContent =
                    "Ausgabe " +
                    window.zeitungskisteAktuelleAusgabe +
                    " gehört jetzt dir!";

            }

            /* Dialog nach erfolgreicher Übergabe schließen */

            dialog.remove();

        } else {


            text.textContent =
                "Die Zeitung konnte nicht übergeben werden. " +
                "Bitte versuche es später erneut.";

        }

        /* Ja-Button bleibt gesperrt */

    });

    /* Ende Zeitungsübergabe */


    tafel.appendChild(ja);

    /* Dialog zusammensetzen */

    dialog.appendChild(tafel);

 
    /* -----------------------------------
    Dialog direkt ins Spielfeld einsetzen

    Gleicher Bezugspunkt wie beim
    bestehenden Valoria-Dialog.
    ----------------------------------- */

    const spielfeld =
        document.getElementById(
            "spielfeld"
        );

    if (!spielfeld) {

        console.error(
            "Zeitungskiste: Spielfeld nicht gefunden."
        );

        return;
    }

    spielfeld.appendChild(
        dialog
    );

    /* Ende Dialog ins Spielfeld einsetzen */

    /* -----------------------------------
    Besitz der aktuellen Ausgabe prüfen

    true  = Zeitung bereits vorhanden
    false = Zeitung fehlt
    null  = Firebase-Prüfung fehlgeschlagen
    ----------------------------------- */

    if (
        typeof window.inventarGegenstandBesitzt !==
        "function"
    ) {

        text.textContent =
            "Das Inventar ist momentan nicht verfügbar.";

        console.error(
            "Zeitungskiste: Inventarprüfung fehlt."
        );

        return;
    }

    window.inventarGegenstandBesitzt(
        "zeitungen",
        String(window.zeitungskisteAktuelleAusgabe)
    ).then(function (besitzt) {

        /* Dialog könnte inzwischen geschlossen sein */

        if (!dialog.isConnected) {
            return;
        }


        if (besitzt === true) {

            text.textContent =
                "Du besitzt Ausgabe " +
                window.zeitungskisteAktuelleAusgabe +
                " bereits! Die nächste Wild am Sonntag " +
                "erscheint am " +
                window.zeitungskisteNaechstesDatum() +
                ".";

            /* Ja-Button bleibt gesperrt */


        } else if (besitzt === false) {

            /* Zeitung fehlt: Button freigeben */

            ja.disabled = false;

        } else {

            text.textContent =
                "Dein Inventar konnte nicht geprüft werden. " +
                "Bitte versuche es später erneut.";

        }

    }).catch(function (fehler) {

        console.error(
            "Zeitungskiste: Fehler bei der Besitzprüfung.",
            fehler
        );

        if (dialog.isConnected) {

            text.textContent =
                "Dein Inventar konnte nicht geprüft werden. " +
                "Bitte versuche es später erneut.";

        }

    });

    /* Ende Besitzprüfung */


}; /* Ende zeitungskisteDialogAnzeigen */

/* Ende Zeitungskiste – Dialog */
