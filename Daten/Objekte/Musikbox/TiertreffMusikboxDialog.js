/* =========================================================
   TIERTREFF – MAGISCHE MUSIKBOX
   Dialogsteuerung

   Version 0.01
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------
       Pfad zu den Dialoggrafiken
       ----------------------------------------- */

    const GRAFIKPFAD =
        "Daten/Objekte/Musikbox/Dialog/";
    /* -----------------------------------------
       Songauswahl

       Reihenfolge für die Pfeilnavigation.
       Die eigentlichen Songdaten liegen
       weiterhin in TiertreffDisco.js.
       ----------------------------------------- */

    const SONG_REIHENFOLGE = [
		"schritt_fuer_schritt",
        "gewohnheitstiere",
        "bibliothek"
    ];

    let ausgewaehlterSongIndex = 0;

    /* Ende Songauswahl */

    /* -----------------------------------------
       Dialog öffnen
       ----------------------------------------- */


    window.tiertreffMusikboxDialogOeffnen = async function () {

        /* -----------------------------------------
           Songkatalog vor Dialogaufbau bereitstellen

           Alle Songinformationen stammen aus
           dem zentralen Disco-Drehbuch.
           ----------------------------------------- */

        const katalogBereit =
            await window.tiertreffDiscoSongkatalogBereitstellen();

        if (!katalogBereit) {
            console.error(
                "Musikbox: Songkatalog konnte nicht geladen werden."
            );
            return;
        }

        /* Doppelte Dialoge verhindern */


        if (document.getElementById("musikbox-overlay")) {
            return;
        }

        /* -----------------------------------------
   Dialog über dem Spielfeld positionieren
   ----------------------------------------- */

const spielfeld = document.getElementById("spielfeld");

if (!spielfeld) {
    console.warn("Musikbox: Spielfeld nicht gefunden.");
    return;
}




/* -----------------------------------------
   Dialog-Overlay erstellen

   Die Positionierung übernimmt künftig CSS
   relativ zum Spielfeld.
   ----------------------------------------- */

const overlay = document.createElement("div");
overlay.id = "musikbox-overlay";


/* -----------------------------------------
   Dialogfenster erstellen
   ----------------------------------------- */

const dialog = document.createElement("div");
dialog.id = "musikbox-dialog";

/* Ende Dialog-Grundgerüst */

        /* Hintergrundgrafik einfügen */

        const hintergrund = document.createElement("img");

        hintergrund.id = "musikbox-hintergrund";
        hintergrund.src =
            GRAFIKPFAD + "Musikbox_Dialog_Hintergrund.png";
        hintergrund.alt = "Die magische Musikbox";

        dialog.appendChild(hintergrund);
		        /* -----------------------------------------
           Überschriften der Songauswahl

           Drei Spalten:
           Titel | BPM | Dauer
           ----------------------------------------- */

        const songKopf =
            document.createElement("div");

        songKopf.id = "musikbox-songkopf";

        ["Titel", "BPM", "Dauer"].forEach(
            function (beschriftung) {

                const spalte =
                    document.createElement("span");

                spalte.textContent = beschriftung;
                songKopf.appendChild(spalte);
            }
        );

        dialog.appendChild(songKopf);

        /* Ende Songüberschriften */
		        /* -----------------------------------------
           Songauswahl – erster Song

           Vorerst gibt es nur einen Song.
           Er ist automatisch ausgewählt.
           ----------------------------------------- */

        const songzeile =
            document.createElement("div");

        songzeile.id = "musikbox-songzeile";

        /* -----------------------------------------
           Songdaten – Titel, BPM und Dauer
           ----------------------------------------- */

        const songtitel =
            document.createElement("span");

        songtitel.id = "musikbox-songtitel";
                /* -----------------------------------------
           Ausgewählten Song aus dem Katalog lesen
           ----------------------------------------- */

        const songId =
            SONG_REIHENFOLGE[ausgewaehlterSongIndex];

        const songInfo =
            window.tiertreffDiscoSongInfo(songId);

        songtitel.textContent = songInfo.titel;

        const songBpm =
            document.createElement("span");

        songBpm.id = "musikbox-songbpm";
        songBpm.textContent =
            songInfo.bpm ?? "–";

        const songDauer =
            document.createElement("span");

        songDauer.id = "musikbox-songdauer";
        songDauer.textContent =
            songInfo.dauer ?? "–";

        songzeile.appendChild(songtitel);
        songzeile.appendChild(songBpm);
        songzeile.appendChild(songDauer);

        dialog.appendChild(songzeile);

        /* Ende Songdaten */

        /* Ende Songauswahl */
		        /* -----------------------------------------
           Songauswahl – Pfeilbuttons

           Die Positionierung erfolgt über CSS.
           Die Umschaltfunktion folgt später.
           ----------------------------------------- */

        const songZurueckButton =
            document.createElement("button");

        songZurueckButton.id = "musikbox-song-zurueck";
        songZurueckButton.type = "button";
        songZurueckButton.setAttribute(
            "aria-label",
            "Vorheriger Song"
        );

        dialog.appendChild(songZurueckButton);


        const songWeiterButton =
            document.createElement("button");

        songWeiterButton.id = "musikbox-song-weiter";
        songWeiterButton.type = "button";
        songWeiterButton.setAttribute(
            "aria-label",
            "Nächster Song"
        );

        dialog.appendChild(songWeiterButton);

        /* Ende Pfeilbuttons */
		        /* -----------------------------------------
           Songauswahl aktualisieren

           Titel, BPM und Dauer werden immer
           aus dem zentralen Songkatalog gelesen.
           ----------------------------------------- */

        function songAnzeigeAktualisieren() {

            const aktuelleSongId =
                SONG_REIHENFOLGE[ausgewaehlterSongIndex];

            const aktuelleSongInfo =
                window.tiertreffDiscoSongInfo(aktuelleSongId);

            if (!aktuelleSongInfo) {
                console.warn(
                    "Musikbox: Unbekannter Song:",
                    aktuelleSongId
                );
                return;
            }

            songtitel.textContent =
                aktuelleSongInfo.titel;

            songBpm.textContent =
                aktuelleSongInfo.bpm ?? "–";

            songDauer.textContent =
                aktuelleSongInfo.dauer ?? "–";
        }

        /* -----------------------------------------
           Zum vorherigen Song wechseln
           ----------------------------------------- */

        songZurueckButton.addEventListener(
            "click",
            function () {

                ausgewaehlterSongIndex =
                    (
                        ausgewaehlterSongIndex
                        - 1
                        + SONG_REIHENFOLGE.length
                    ) % SONG_REIHENFOLGE.length;

                songAnzeigeAktualisieren();
            }
        );

        /* -----------------------------------------
           Zum nächsten Song wechseln
           ----------------------------------------- */

        songWeiterButton.addEventListener(
            "click",
            function () {

                ausgewaehlterSongIndex =
                    (
                        ausgewaehlterSongIndex + 1
                    ) % SONG_REIHENFOLGE.length;

                songAnzeigeAktualisieren();
            }
        );

        /* Ende Songnavigation */
        /* -----------------------------------------
           Button – Song starten

           Vorerst nur die Anzeige.
           Die Abspielfunktion folgt später.
           ----------------------------------------- */

        const songStartenButton =
            document.createElement("button");

        songStartenButton.id = "musikbox-song-starten";
        songStartenButton.type = "button";
        songStartenButton.textContent = "Song starten";

        dialog.appendChild(songStartenButton);

        /* Ende Button – Song starten */
		
        /* -----------------------------------------
           SONG-STARTBUTTON MIT DISCO VERBINDEN

           Gewählten Song vollständig vorbereiten
           und anschließend abspielen.
           ----------------------------------------- */

        songStartenButton.addEventListener(
            "click",
            async function () {

                /* Doppeltes Klicken verhindern */

                if (songStartenButton.disabled) {
                    return;
                }

                songStartenButton.disabled = true;

                const songId =
                    SONG_REIHENFOLGE[ausgewaehlterSongIndex];

                try {

                    /* Song und Grafiken vorbereiten */

                    const bereit =
                        await window.tiertreffDiscoVorbereiten(
                            songId
                        );

                    if (!bereit) {
                        console.warn(
                            "Musikbox: Vorbereitung fehlgeschlagen."
                        );
                        return;
                    }


                    /* -----------------------------------------
                       Gemeinsamen Song über Firebase starten

                       Der Firebase-Listener übernimmt
                       anschließend die lokale Wiedergabe
                       bei allen Spielern im Tiertreff.
                       ----------------------------------------- */


                    const gestartet =
                        await window.tiertreffMusikboxFirebaseSongStarten(
                            songId
                        );



                    if (gestartet) {

                        /* Dialog nach erfolgreichem Start schließen */

                        window.tiertreffMusikboxDialogSchliessen();

                    } else {

                        console.warn(
                            "Musikbox: Song konnte nicht gestartet werden."
                        );
                    }

                } catch (fehler) {

                    console.error(
                        "Musikbox: Fehler beim Songstart:",
                        fehler
                    );

                } finally {

                    songStartenButton.disabled = false;
                }

            }
        );

        /* Ende Song-Startbutton */

        /* -----------------------------------------
           Schließen-Button erstellen
           ----------------------------------------- */

        const schliessenButton =
            document.createElement("button");

        schliessenButton.id = "musikbox-schliessen";
        schliessenButton.type = "button";
        schliessenButton.textContent = "Zurück";

        schliessenButton.addEventListener(
            "click",
            function () {
                window.tiertreffMusikboxDialogSchliessen();
            }
        );

        dialog.appendChild(schliessenButton);

        /* Ende Schließen-Button */
		        /* -----------------------------------------
           Tanz-Button – Vorbereitung

           Vorerst ohne Beschriftung und Funktion.
           Die Darstellung übernimmt CSS.
           ----------------------------------------- */

        const tanzenButton =
            document.createElement("button");

        tanzenButton.id = "musikbox-tanzen";
        tanzenButton.type = "button";
        tanzenButton.disabled = true;

        dialog.appendChild(tanzenButton);

        /* Ende Tanz-Button */

        overlay.appendChild(dialog);

        /* -----------------------------------------
           Dialog direkt ins Spielfeld einsetzen

           Gleicher Grundansatz wie beim NPC-Dialog.
           Dadurch gehört der Dialog zur Spielfläche
           und nicht zum gesamten Browserfenster.
           ----------------------------------------- */

        spielfeld.appendChild(overlay);

        /* Ende Dialog ins Spielfeld einsetzen */

    };


    /* -----------------------------------------
       Dialog schließen
       ----------------------------------------- */

    window.tiertreffMusikboxDialogSchliessen = function () {

        const overlay =
            document.getElementById("musikbox-overlay");

        if (overlay) {
            overlay.remove();
        }

    };

})();