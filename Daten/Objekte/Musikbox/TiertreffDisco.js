/* =========================================================
   TIERTREFF – DISCO-STEUERUNG

   Version 0.01

   Zustände:
   IDLE    = Keine Disco aktiv
   LOADING = Dateien werden geladen
   READY   = Alle benötigten Dateien sind geladen
   PLAYING = Musik läuft

   Später:
   READY kann an Firebase gemeldet werden.
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------
       Einzelne Musiknote erzeugen

       Die Note erscheint im Notenbereich
       der Musikbox und bewegt sich über CSS.

       Noch keine automatische Wiederholung.
       ----------------------------------------- */

    function musiknoteErzeugen(symbolVorgabe = null) {

        const bereich = document.querySelector(
            ".song-noten-bereich"
        );

        if (!bereich) {
            return false;
        }

        const farben = [
            "#ff66cc",
            "#00e5ff",
            "#ffe44d",
            "#66ff99",
            "#bb88ff"
        ];

        const symbole = ["♪", "♫", "♬"];

        const zufall = function (min, max) {
            return min + Math.random() * (max - min);
        };

        const note = document.createElement("span");

        note.className = "song-note";

        /* ROCKMUSIKBOX – Symbol wählbar

           Ohne Vorgabe bleiben die bisherigen
           zufälligen Musiknoten unverändert.

           Für den Rocksong kann ein Pfotensymbol
           übergeben werden.
        */

        note.textContent =
            symbolVorgabe ||
            symbole[Math.floor(Math.random() * symbole.length)];

        /* Textdarstellung bevorzugen,
           damit die CSS-Farbe verwendet wird. */

        if (symbolVorgabe) {
            note.style.fontVariantEmoji = "text";
            note.style.fontFamily =
                '"Segoe UI Symbol", Arial, sans-serif';
        }

        /* Ende Symbolauswahl */

        note.style.setProperty(
            "--noten-farbe",
            farben[Math.floor(Math.random() * farben.length)]
        );

        note.style.setProperty(
            "--noten-groesse",
            zufall(16, 30).toFixed(1) + "px"
        );

        note.style.setProperty(
            "--noten-flug-x",
            zufall(-55, 55).toFixed(1) + "px"
        );

        note.style.setProperty(
            "--noten-flug-y",
            zufall(-110, -65).toFixed(1) + "px"
        );

        note.style.setProperty(
            "--noten-drehung",
            zufall(-35, 35).toFixed(1) + "deg"
        );


        /* -----------------------------------------
           Musikabhängige Flugdauer

           Ruhige Musik: langsam schwebende Noten
           Schnelle Musik: kürzere Flugzeit

           Kleine Zufallsabweichungen sorgen
           für natürliche Unterschiede.
           ----------------------------------------- */

        const songPosition =
            aktiverSongStartzeitpunkt === null
                ? 0
                : (Date.now() - aktiverSongStartzeitpunkt) / 1000;

        const musikwerte = musiknotenMusikwerteBestimmen(
            aktiverSongId,
            songPosition
        );

        /* Ruhig: ca. 3,8 Sekunden
           Schnell: ca. 1,2 Sekunden */

        const grunddauer =
            3.8 - musikwerte.tempo * 2.6;

        const flugdauer =
            grunddauer * zufall(0.85, 1.15);

        note.style.setProperty(
            "--noten-dauer",
            flugdauer.toFixed(2) + "s"
        );


        /* Nach dem Flug automatisch entfernen */

        note.addEventListener(
            "animationend",
            function () {
                note.remove();
            },
            { once: true }
        );

        bereich.appendChild(note);

        return true;
    }

    /* Ende einzelne Musiknote erzeugen */

    /* -----------------------------------------
       Vorläufiger Test der Musiknoten

       Erzeugt auf Wunsch eine einzelne Note.
       Wird nach Abschluss der Entwicklung
       wieder entfernt.
       ----------------------------------------- */

    window.tiertreffDiscoTestnote = function () {
        return musiknoteErzeugen();
    };

    /* Ende Testfunktion Musiknoten */

    /* -----------------------------------------
       Automatische Musiknoten

       Ein einziger Timer erzeugt während
       der Wiedergabe neue Musiknoten.

       Vorläufig alle 600 Millisekunden.
       Später abhängig von der Musikintensität.
       ----------------------------------------- */

    let musiknotenTimer = null;


    function musiknotenStarten() {

        /* Doppelten Timer verhindern */

        if (musiknotenTimer !== null) {
            return;
        }

        /* Alle 200 ms die aktuelle Musikintensität prüfen */

        musiknotenTimer = setInterval(
            function () {

                if (aktiverSongId === null) {
                    musiknotenStoppen();
                    return;
                }
                /* -----------------------------------------
                   ROCKMUSIKBOX

                   Beim Rocksong übernimmt die
                   Rockshow-Animationsschleife den
                   rhythmischen Notenausstoß.

                   Alle anderen Songs behalten
                   ihre bisherige Zufallssteuerung.
                   ----------------------------------------- */

                if (aktiverSongId === "schritt_fuer_schritt") {
                    return;
                }

                /* Ende Rockmusikbox-Sonderfall */
                /* Aktuelle Songposition ermitteln */

                const position =
                    aktiverSongStartzeitpunkt === null
                        ? 0
                        : (Date.now() - aktiverSongStartzeitpunkt) / 1000;

                const musikwerte =
                    musiknotenMusikwerteBestimmen(
                        aktiverSongId,
                        position
                    );

                /* -----------------------------------------
                   Wahrscheinlichkeit für eine neue Note

                   Stille: keine Noten
                   Leise: selten
                   Laut: häufiger

                   Der Zufall verhindert einen
                   gleichmäßigen Notenrhythmus.
                   ----------------------------------------- */

                const wahrscheinlichkeit =
                    musikwerte.intensitaet * 0.55;

                if (Math.random() < wahrscheinlichkeit) {
                    musiknoteErzeugen();
                }

            },
            200
        );
    }


    function musiknotenStoppen() {

        if (musiknotenTimer !== null) {
            clearInterval(musiknotenTimer);
            musiknotenTimer = null;
        }

    }

    /* Ende automatische Musiknoten */


    /* -----------------------------------------
       DISCO-LICHTER: TANZFLÄCHE VORBEREITEN

       Vier Lichtflecken innerhalb der
       Tanzfläche des Tiertreffs.

       Vorläufig nur für einen Sichttest.
       ----------------------------------------- */

    function discoLichtbereichErzeugen() {

        const position = window.aktuelleSpielerPosition;

        if (
            !position ||
            position.karte !== "tiertreff_innen"
        ) {
            return false;
        }

        const zoomEbene = document.getElementById(
            "reservatZoomEbene"
        );

        if (!zoomEbene) {
            return false;
        }

        /* Vorhandenen Bereich wiederverwenden */

        if (zoomEbene.querySelector(".song-licht-bereich")) {
            return true;
        }

        const bereich = document.createElement("div");

        bereich.className = "song-licht-bereich";

        /* Tanzfläche im 10x10-Kartenraster:
           vorläufig x = 2 bis 8,
           y = 5 bis 9 */

        const feld = zoomEbene.clientWidth / 10;

        bereich.style.left = (2 * feld) + "px";
        bereich.style.top = (5 * feld) + "px";
        bereich.style.width = (6 * feld) + "px";
        bereich.style.height = (4 * feld) + "px";

        /* Vier farbige Lichtflecken */

        for (let i = 0; i < 4; i++) {

            const licht = document.createElement("div");

            licht.className = "song-lichtfleck";

            bereich.appendChild(licht);
        }

        zoomEbene.appendChild(bereich);

        return true;
    }

    /* Vorläufiger Sichttest über die Konsole */

    window.tiertreffDiscoTestlichter = function () {
        return discoLichtbereichErzeugen();
    };

    /* Ende Disco-Lichtbereich */
	
    /* -----------------------------------------
       DISCO-LICHTER: AKTUELLE POSITIONEN

       Ermittelt die tatsächlichen Positionen
       der bewegten Lichtflecken.

       Grundlage für die spätere
       Avatarbeleuchtung.
       ----------------------------------------- */

    function discoLichtpositionenBestimmen() {

        const lichter = document.querySelectorAll(
            "#reservatZoomEbene .song-lichtfleck"
        );

        const ergebnis = [];

        lichter.forEach(function (licht) {

            const rechteck =
                licht.getBoundingClientRect();

            ergebnis.push({

                x: rechteck.left +
                    rechteck.width / 2,

                y: rechteck.top +
                    rechteck.height / 2,

                radiusX: rechteck.width / 2,

                radiusY: rechteck.height / 2

            });

        });

        return ergebnis;
    }

    /* Testfunktion für die Browserkonsole */

    window.tiertreffDiscoLichtpositionen =
        discoLichtpositionenBestimmen;

    /* Ende Disco-Lichtpositionen */


    /* -----------------------------------------
       DISCO-LICHT: STÄRKE AN EINER POSITION

       x und y sind Bildschirmkoordinaten.
       Rückgabe: Lichtstärke zwischen 0 und 1.

       Mehrere Lichtflecken überlagern sich.
       ----------------------------------------- */

    function discoLichtstaerkeBestimmen(x, y) {

        const lichter = discoLichtpositionenBestimmen();

        let gesamtlicht = 0;

        lichter.forEach(function (licht) {

            if (
                licht.radiusX <= 0 ||
                licht.radiusY <= 0
            ) {
                return;
            }

            /* Abstand innerhalb der Ellipse */

            const dx =
                (x - licht.x) / licht.radiusX;

            const dy =
                (y - licht.y) / licht.radiusY;

            const abstand = Math.hypot(dx, dy);

            if (abstand >= 1) {
                return;
            }

            /* Zentrum hell, Rand zunehmend dunkel */

            const beitrag =
                Math.pow(1 - abstand, 1.5);

            gesamtlicht += beitrag;

        });

        return Math.min(1, gesamtlicht);
    }

    /* Testzugriff für die Browserkonsole */

    window.tiertreffDiscoLichtstaerke =
        discoLichtstaerkeBestimmen;

    /* Ende Disco-Lichtstärke */

    /* -----------------------------------------
       DISCO: AVATAR-AUFHELLUNG TESTEN

       Einmaliger Test für einen Avatar.
       Noch keine automatische Aktualisierung.
       ----------------------------------------- */

    window.tiertreffDiscoAvatarLichtTest = function (
        spielerName
    ) {

        if (
            window.aktuelleSpielerPosition?.karte !==
            "tiertreff_innen"
        ) {
            return "Nicht im Tiertreff.";
        }

        const avatare = document.querySelectorAll(
            "#spielfeld canvas[data-spieler-uid]"
        );

        const avatar = Array.from(avatare).find(
            function (canvas) {
                return canvas.dataset.spielerName ===
                    spielerName;
            }
        );

        if (!avatar) {
            return "Avatar nicht gefunden.";
        }

        /* Aktuelle Bildschirmposition */

        const rechteck =
            avatar.getBoundingClientRect();

        const x =
            rechteck.left + rechteck.width / 2;

        const y =
            rechteck.top + rechteck.height / 2;

        /* Disco-Licht an dieser Position */

        const licht =
            discoLichtstaerkeBestimmen(x, y);

        /* Vorhandene Helligkeit ermitteln */

        const bisherigerFilter =
            avatar.style.filter;

        const treffer = bisherigerFilter.match(
            /brightness\(([\d.]+)\)/
        );

        const grundhelligkeit = treffer
            ? Number(treffer[1])
            : 1;

        /* Zusätzliche Aufhellung bis maximal 100 % */

        const neueHelligkeit = Math.min(
            1,
            grundhelligkeit +
                (1 - grundhelligkeit) * licht
        );

        /* Weicher Übergang */

        avatar.style.transition =
            "filter 150ms ease";

        avatar.style.filter =
            bisherigerFilter.replace(
                /brightness\([\d.]+\)/,
                "brightness(" + neueHelligkeit + ")"
            );

        return {
            spieler: spielerName,
            lichtstaerke: licht,
            vorher: grundhelligkeit,
            nachher: neueHelligkeit
        };
    };

    /* Ende Avatar-Aufhellungstest */

    /* -----------------------------------------
       DISCO: AUTOMATISCHE AVATARBELEUCHTUNG

       Vorläufiger Testbetrieb:
       - Aktualisierung alle 100 ms
       - Nur im Tiertreff
       - Keine Firebase-Abfragen
       - Manuell ein- und ausschaltbar
       ----------------------------------------- */

    let discoAvatarLichtTimer = null;

    /* -----------------------------------------
       DISCO-BELEUCHTUNG: SCHNITTSTELLE

       Die normale Spieleraktualisierung kann
       hier die aktuelle Disco-Aufhellung
       abfragen.

       Ohne aktiven Disco-Lichttimer bleibt
       die ursprüngliche Helligkeit erhalten.
       ----------------------------------------- */

    window.tiertreffDiscoHelligkeitErgaenzen =
        function (avatar, grundhelligkeit) {

            /* Disco-Beleuchtung nicht aktiv */

            if (
                discoAvatarLichtTimer === null ||
                window.aktuelleSpielerPosition?.karte !==
                    "tiertreff_innen"
            ) {
                return grundhelligkeit;
            }

            if (!avatar) {
                return grundhelligkeit;
            }

            /* Aktuelle Avatarposition */

            const rechteck =
                avatar.getBoundingClientRect();

            const x =
                rechteck.left + rechteck.width / 2;

            const y =
                rechteck.top + rechteck.height / 2;

            /* Lichtstärke an dieser Position */

            const licht =
                discoLichtstaerkeBestimmen(x, y);

            /* Grundhelligkeit plus Disco-Licht */

            return Math.min(
                1,
                grundhelligkeit +
                    (1 - grundhelligkeit) * licht
            );
        };

    /* Ende Disco-Beleuchtungsschnittstelle */

    function discoAvatarLichtAktualisieren() {

        if (
            window.aktuelleSpielerPosition?.karte !==
            "tiertreff_innen"
        ) {
            return;
        }

        const avatare = document.querySelectorAll(
            "#spielfeld canvas[data-spieler-uid]"
        );

        avatare.forEach(function (avatar) {

            const rechteck =
                avatar.getBoundingClientRect();

            const x =
                rechteck.left + rechteck.width / 2;

            const y =
                rechteck.top + rechteck.height / 2;

            /* Normale Beleuchtung anhand der
               gespeicherten Spielfeldposition */

            const uid = avatar.dataset.spielerUid;

            const spielerPosition =
                window.multiplayerPositionen?.[uid];

            if (
                !spielerPosition ||
                spielerPosition.karte !== "tiertreff_innen"
            ) {
                return;
            }

            const grundhelligkeit =
                window.reservatBeleuchtung
                    ?.lichtquellenHelligkeitBestimmen(
                        spielerPosition.karte,
                        spielerPosition.x,
                        spielerPosition.y
                    ) ?? 1;

            /* Aktuelle Disco-Lichtstärke */

            const licht =
                discoLichtstaerkeBestimmen(x, y);

            const helligkeit = Math.min(
                1,
                grundhelligkeit +
                    (1 - grundhelligkeit) * licht
            );

            /* Bestehende Graustufen erhalten */

            const alterFilter =
                avatar.style.filter;

            const neuerFilter =
                alterFilter.includes("grayscale")
                    ? "grayscale(1) brightness(" +
                        (0.75 * helligkeit) + ")"
                    : "brightness(" + helligkeit + ")";

            avatar.style.transition =
                "filter 150ms ease";

            avatar.style.filter = neuerFilter;

        });
    }

    /* Test starten */

    window.tiertreffDiscoAvatarLichtStarten =
        function () {

            if (discoAvatarLichtTimer !== null) {
                return true;
            }

            discoAvatarLichtTimer = setInterval(
                discoAvatarLichtAktualisieren,
                100
            );

            return true;
        };

    /* Test beenden */

    window.tiertreffDiscoAvatarLichtStoppen =
        function () {

            if (discoAvatarLichtTimer !== null) {

                clearInterval(discoAvatarLichtTimer);

                discoAvatarLichtTimer = null;
            }

            return true;
        };

    /* Ende automatische Avatarbeleuchtung */

    /* -----------------------------------------
       Interner Zustand
       ----------------------------------------- */

    let discoStatus = "IDLE";
	    /* -----------------------------------------
       Zuletzt vollständig vorbereiteter Song

       Verhindert, dass READY versehentlich
       einem anderen Song zugeordnet wird.
       ----------------------------------------- */

    let bereiterSongId = null;
	    /* -----------------------------------------
       Aktueller Song

       Bleibt auch während einer Pause gesetzt.
       Erst das reguläre Songende gibt ihn frei.

       Später Grundlage für die Warteschlange.
       ----------------------------------------- */

    let aktiverSongId = null;
	    /* -----------------------------------------
       Gemeinsamer Songstart

       Zeitpunkt in Millisekunden seit 1970.

       Zunächst lokal gesetzt.
       Später stammt dieser Wert aus Firebase.
       ----------------------------------------- */

    let aktiverSongStartzeitpunkt = null;
	    /* -----------------------------------------
       Gleichzeitige Wiedereinstiege verhindern

       Mehrere Browserereignisse können nahezu
       gleichzeitig eintreffen.
       ----------------------------------------- */

    let discoWiedereinstiegLaeuft = false;
    /* -----------------------------------------
       Songkatalog

       Jeder Song besitzt eine eindeutige ID,
       einen Dateipfad und ein Effektprofil.

       Weitere Songs können hier später
       ergänzt werden.
       ----------------------------------------- */

    const discoSongs = {

        gewohnheitstiere: {
            id: "gewohnheitstiere",
            titel: "Gewohnheitstiere",
            datei: "Daten/Sounds/Musik/Gewohnheitstiere_Opus_96k.ogg",
            bpm: 86,
            dauer: "2:27",

            effekte: {
                kartenmodus: "dunkel",
                animation: "disco"
            }
        },

        bibliothek: {
            id: "bibliothek",
            titel: "Bibliotheksmusik",
            datei: "Daten/Sounds/Musik/Bibliothek_Hintergrundmusik_001.ogg",
            bpm: null,
            dauer: null,

            effekte: {
                kartenmodus: "normal",
                animation: "noten"
            }
        }

    };

    /* -----------------------------------------
       Songdaten abrufen

       Unbekannte Song-IDs liefern null.
       ----------------------------------------- */


    /* Songinformationen ausschließlich aus dem Drehbuch */

    window.tiertreffDiscoSongInfo = function (songId) {
        return discoSongInfoAusDrehbuch(songId);
    };

    /* Drehbuch für die Songauswahl bereitstellen */

    window.tiertreffDiscoSongkatalogBereitstellen =
        async function () {

            const geladen =
                await window.tiertreffDiscoDrehbuchLaden();

            if (!geladen) {
                return false;
            }

            return Object.keys(discoDrehbuch.songs).every(
                function (songId) {
                    return discoSongKonfigurationPruefen(songId);
                }
            );
        };


    /* Ende Songkatalog */
	    /* -----------------------------------------
       Disco-Drehbuch laden

       Enthält die zeitabhängigen Effekte
       für jeden Song.

       Noch keine Ausführung der Effekte.
       ----------------------------------------- */

    let discoDrehbuch = null;

    window.tiertreffDiscoDrehbuchLaden =
        async function () {

            if (discoDrehbuch !== null) {
                return true;
            }

            try {

                const antwort = await fetch(
                    "Daten/Objekte/Musikbox/TiertreffDiscoDrehbuch.json",
                    { cache: "no-store" }
                );

                if (!antwort.ok) {
                    throw new Error(
                        "Disco-Drehbuch konnte nicht geladen werden."
                    );
                }

                const daten = await antwort.json();

                if (
                    daten.version !== 1 ||
                    !daten.songs
                ) {
                    throw new Error(
                        "Ungültiges Disco-Drehbuch."
                    );
                }

                discoDrehbuch = daten;

                console.log(
                    "Tiertreff-Disco: Drehbuch geladen."
                );

                return true;

            } catch (fehler) {

                console.error(
                    "Tiertreff-Disco: Drehbuch-Ladefehler:",
                    fehler
                );

                return false;
            }
        };

    /* Ende Disco-Drehbuch laden */
	
    /* -----------------------------------------
       ZENTRALE SONGINFORMATIONEN

       Alle Songdaten stammen aus dem Drehbuch.
       Diese Schnittstelle wird künftig vom
       Musikbox-Dialog und der Disco-Steuerung
       gemeinsam verwendet.
       ----------------------------------------- */

    function discoSongInfoAusDrehbuch(songId) {

        if (!discoDrehbuch?.songs) {
            return null;
        }

        return discoDrehbuch.songs[songId] || null;
    }

    /* Prüfen, ob ein Song vollständig konfiguriert ist */

    function discoSongKonfigurationPruefen(songId) {

        const song = discoSongInfoAusDrehbuch(songId);

        if (!song) {
            console.error(
                "Tiertreff-Disco: Song fehlt im Drehbuch:",
                songId
            );
            return false;
        }

        if (
            typeof song.titel !== "string" ||
            !song.titel.trim() ||
            typeof song.datei !== "string" ||
            !song.datei.trim() ||
            !Array.isArray(song.effekte) ||
            !/^\d+:[0-5]\d$/.test(song.dauer)
        ) {
            console.error(
                "Tiertreff-Disco: Ungültige Songkonfiguration:",
                songId
            );
            return false;
        }

        if (
            song.bpm !== null &&
            (
                typeof song.bpm !== "number" ||
                !Number.isFinite(song.bpm) ||
                song.bpm <= 0
            )
        ) {
            console.error(
                "Tiertreff-Disco: Ungültiger BPM-Wert:",
                songId
            );
            return false;
        }

        return true;
    }

    /* Ende zentrale Songinformationen */

    /* -----------------------------------------
       SONG-INTENSITÄTEN LADEN

       Enthält die vorab berechnete
       Musikintensität und den Tempofaktor
       für unsere Notenanimation.

       Die Daten werden nur einmal geladen.
       ----------------------------------------- */

    let songIntensitaeten = null;

    async function songIntensitaetenLaden() {

        /* Bereits erfolgreich geladen */

        if (songIntensitaeten !== null) {
            return true;
        }

        try {

            const antwort = await fetch(
                "Daten/Objekte/Musikbox/SongIntensitaeten.json",
                { cache: "no-store" }
            );

            if (!antwort.ok) {
                throw new Error(
                    "Song-Intensitäten konnten nicht geladen werden."
                );
            }

            const daten = await antwort.json();

            /* Grundstruktur überprüfen */

            if (
                daten.version !== 1 ||
                !Number.isFinite(daten.intervallSekunden) ||
                daten.intervallSekunden <= 0 ||
                !daten.songs
            ) {
                throw new Error(
                    "Ungültige Song-Intensitätsdaten."
                );
            }

            songIntensitaeten = daten;

            console.log(
                "Tiertreff-Disco: Song-Intensitäten geladen."
            );

            return true;

        } catch (fehler) {

            console.error(
                "Tiertreff-Disco: Intensitätsdaten-Ladefehler:",
                fehler
            );

            return false;
        }
    }

    /* Ende Song-Intensitäten laden */
	
    /* -----------------------------------------
       AKTUELLE MUSIKINTENSITÄT BESTIMMEN

       Ermittelt anhand der Songposition:
       - Intensität zwischen 0 und 1
       - Tempofaktor zwischen 0 und 1

       Die Werte stammen aus der vorab
       analysierten SongIntensitaeten.json.
       ----------------------------------------- */

    function musiknotenMusikwerteBestimmen(
        songId,
        positionSekunden
    ) {

        /* Sichere Standardwerte */

        const standard = {
            intensitaet: 0.5,
            tempo: 0.5
        };

        if (
            !songIntensitaeten ||
            !songIntensitaeten.songs ||
            !songIntensitaeten.songs[songId]
        ) {
            return standard;
        }

        const song = songIntensitaeten.songs[songId];

        if (
            !Array.isArray(song.intensitaet) ||
            song.intensitaet.length === 0
        ) {
            return standard;
        }

        /* Passenden Zwei-Sekunden-Abschnitt finden */

        const intervall =
            songIntensitaeten.intervallSekunden;

        const index = Math.max(
            0,
            Math.min(
                song.intensitaet.length - 1,
                Math.floor(positionSekunden / intervall)
            )
        );

        /* Werte auf den Bereich 0 bis 1 begrenzen */

        const begrenzen = function (wert) {
            return Math.max(0, Math.min(1, wert));
        };

        return {
            intensitaet: begrenzen(
                song.intensitaet[index]
            ),
            tempo: begrenzen(
                song.tempoFaktor
            )
        };
    }

    /* Ende aktuelle Musikintensität bestimmen */


    /* -----------------------------------------
       Raumlicht aus dem Drehbuch ermitteln

       Berücksichtigt die Songposition.
       Führt noch keine Grafikeffekte aus.
       ----------------------------------------- */

    window.tiertreffDiscoRaumlichtBestimmen =
        function (songId, positionSekunden) {

            /* Standard: Licht eingeschaltet */

            let lichtzustand = "normal";

            if (
                !discoDrehbuch ||
                !discoDrehbuch.songs[songId]
            ) {
                return lichtzustand;
            }

            const effekte =
                discoDrehbuch.songs[songId].effekte || [];

            for (const effekt of effekte) {

                if (
                    effekt.typ === "raumlicht" &&
                    effekt.zeit <= positionSekunden
                ) {
                    lichtzustand = effekt.zustand;
                }

            }

            return lichtzustand;
        };

    /* Ende Raumlicht aus Drehbuch */
    /* -----------------------------------------
       Status setzen
       ----------------------------------------- */

    function statusSetzen(neuerStatus) {

        discoStatus = neuerStatus;

        console.log(
            "Tiertreff-Disco: " + discoStatus
        );
    }

    /* -----------------------------------------
       Status abfragen

       Später auch für Firebase verwendbar.
       ----------------------------------------- */

    window.tiertreffDiscoStatus = function () {
        return discoStatus;
    };
    /* -----------------------------------------
       Musikdatei vollständig laden

       Die Funktion lädt die gesamte OGG-Datei
       und bereitet sie für die Wiedergabe vor.

       Sie startet noch keine Musik.
       ----------------------------------------- */

    /* -----------------------------------------
       Audio-Cache für mehrere Songs

       Jeder Song wird anhand seiner ID
       getrennt gespeichert.

       Auch laufende Ladevorgänge werden
       pro Song verwaltet.
       ----------------------------------------- */

    const geladeneSongs = new Map();
    const laufendeSongLadevorgaenge = new Map();

    /* -----------------------------------------
       Aktuell ausgewählter Song

       Standardmäßig Gewohnheitstiere.
       ----------------------------------------- */

    let ausgewaehlterSongId = "gewohnheitstiere";



    async function songLaden(songId = ausgewaehlterSongId) {

        /* Song-ID überprüfen */

        if (!discoSongKonfigurationPruefen(songId)) {

            console.error(
                "Tiertreff-Disco: Unbekannter Song:",
                songId
            );

            return false;
        }

        /* Song bereits vollständig geladen? */

        if (geladeneSongs.has(songId)) {

            console.log(
                "Tiertreff-Disco: Song bereits geladen:",
                songId
            );

            return true;
        }

        /* Läuft für diesen Song bereits ein Download? */

        if (laufendeSongLadevorgaenge.has(songId)) {

            console.log(
                "Tiertreff-Disco: Song wird bereits geladen:",
                songId
            );

            return laufendeSongLadevorgaenge.get(songId);
        }

        /* Neuen Ladevorgang starten */

        const ladeversprechen = songTatsaechlichLaden(songId);

        laufendeSongLadevorgaenge.set(
            songId,
            ladeversprechen
        );

        try {
            return await ladeversprechen;
        } finally {
            laufendeSongLadevorgaenge.delete(songId);
        }
    }

    async function songTatsaechlichLaden(songId) {


        /* -----------------------------------------
           Audiodateipfad aus dem Drehbuch lesen

           Keine zweite Songkonfiguration.
           ----------------------------------------- */

        const song = discoSongInfoAusDrehbuch(songId);

        if (!song || !discoSongKonfigurationPruefen(songId)) {
            return false;
        }

        const songPfad = song.datei;


        try {

            /* Gesamte Datei herunterladen */

            const antwort = await fetch(songPfad);

            if (!antwort.ok) {
                throw new Error(
                    "Musikdatei konnte nicht geladen werden."
                );
            }

            const datei = await antwort.blob();

            if (datei.size === 0) {
                throw new Error(
                    "Musikdatei ist leer."
                );
            }

            /* Audiodatei für Wiedergabe vorbereiten */

            const objektUrl = URL.createObjectURL(datei);

            const audio = new Audio();
            audio.preload = "auto";
            audio.src = objektUrl;

            await new Promise(function (resolve, reject) {

                audio.addEventListener(
                    "canplay",
                    resolve,
                    { once: true }
                );

                audio.addEventListener(
                    "error",
                    function () {
                        reject(new Error(
                            "Musikdatei konnte nicht vorbereitet werden."
                        ));
                    },
                    { once: true }
                );

                audio.load();
            });


            /* Song getrennt nach seiner ID speichern */

            geladeneSongs.set(songId, audio);

            console.log(
                "Tiertreff-Disco: Song vollständig geladen:",
                songId,
                datei.size,
                "Bytes"
            );

            return true;

        } catch (fehler) {

            console.error(
                "Tiertreff-Disco: Ladefehler",
                fehler
            );

            statusSetzen("IDLE");

            return false;
        }
    }

    /* -----------------------------------------
       Ladefunktion für spätere Verwendung
       bereitstellen
       ----------------------------------------- */

    window.tiertreffDiscoSongLaden = songLaden;
	    /* -----------------------------------------
       Dunkle Tiertreff-Grafiken vorladen

       Beide Grafiken müssen vollständig
       geladen und dekodiert sein.

       Noch keine Umschaltung der Karte.
       ----------------------------------------- */

		const discoGrafikPfade = [
			"Daten/Maps/Tiertreff_Innen/Karte_Kneipe_Dunkel_Ebene1.png",
			"Daten/Maps/Tiertreff_Innen/Karte_Kneipe_Dunkel_Ebene3.png",
			"Daten/Objekte/Musikbox/musikbox_neon_dunkel.png"
		];


    /* -----------------------------------------
       Grafik-Cache

       Jede Grafik wird einzeln gespeichert.
       Auch laufende Ladevorgänge werden
       wiederverwendet.
       ----------------------------------------- */

    const geladeneDiscoGrafiken = new Map();
    const laufendeGrafikLadevorgaenge = new Map();

    async function einzelneDiscoGrafikLaden(pfad) {

        /* Grafik bereits vollständig geladen? */

        if (geladeneDiscoGrafiken.has(pfad)) {
            return geladeneDiscoGrafiken.get(pfad);
        }

        /* Grafik wird bereits geladen? */

        if (laufendeGrafikLadevorgaenge.has(pfad)) {
            return laufendeGrafikLadevorgaenge.get(pfad);
        }

        /* Neue Grafik laden */

        const ladeversprechen = (async function () {

            const bild = new Image();

            bild.src = pfad;

            await bild.decode();

            geladeneDiscoGrafiken.set(pfad, bild);

            return bild;

        })();

        laufendeGrafikLadevorgaenge.set(
            pfad,
            ladeversprechen
        );

        try {
            return await ladeversprechen;
        } finally {
            laufendeGrafikLadevorgaenge.delete(pfad);
        }
    }

    /* -----------------------------------------
       Alle benötigten Grafiken vorbereiten
       ----------------------------------------- */

    async function discoGrafikenLaden() {

        try {

            await Promise.all(
                discoGrafikPfade.map(einzelneDiscoGrafikLaden)
            );

            console.log(
                "Tiertreff-Disco: Grafiken bereit:",
                geladeneDiscoGrafiken.size,
                "von",
                discoGrafikPfade.length
            );

            return true;

        } catch (fehler) {

            console.error(
                "Tiertreff-Disco: Grafik-Ladefehler",
                fehler
            );

            return false;
        }
    }

    /* -----------------------------------------
       Grafik-Ladefunktion bereitstellen

       Später Bestandteil der gemeinsamen
       READY-Prüfung.
       ----------------------------------------- */

    window.tiertreffDiscoGrafikenLaden =
        discoGrafikenLaden;

    /* Ende Disco-Grafiken vorladen */
	    /* -----------------------------------------
       Gesamte Disco vorbereiten

       Song und Grafiken werden geladen.
       READY erst nach erfolgreichem
       Abschluss beider Ladevorgänge.

       Noch kein automatischer Musikstart.
       ----------------------------------------- */

    async function discoVorbereiten(songId = ausgewaehlterSongId) {


        /* Drehbuch laden und Songkonfiguration prüfen */

        const katalogBereit =
            await window.tiertreffDiscoSongkatalogBereitstellen();

        if (
            !katalogBereit ||
            !discoSongKonfigurationPruefen(songId)
        ) {
            console.error(
                "Tiertreff-Disco: Song nicht vorbereitet:",
                songId
            );
            return false;
        }

        const song = discoSongInfoAusDrehbuch(songId);

        const dunkleKarte =
            song.effekte.some(function (effekt) {
                return (
                    effekt.typ === "raumlicht" &&
                    effekt.zustand === "dunkel"
                );
            });


        /* Gewünschten Song merken */

        ausgewaehlterSongId = songId;

        /* Bereits für diesen Song vorbereitet? */

        if (
            discoStatus === "READY" &&
            bereiterSongId === songId &&
            geladeneSongs.has(songId) &&
            songIntensitaeten !== null &&
            Array.isArray(
                songIntensitaeten.songs?.[songId]?.intensitaet
            ) &&
            (
                !dunkleKarte ||
                discoGrafikPfade.every(function (pfad) {
                    return geladeneDiscoGrafiken.has(pfad);
                })
            )
        ) {

            console.log(
                "Tiertreff-Disco: Bereits READY für",
                songId
            );

            return true;
        }

        /* Dateien müssen noch geprüft werden */

        /*
        Während ein Song läuft, darf das Vorladen
        eines anderen Songs den Wiedergabestatus
        nicht verändern.
        */

        if (aktiverSongId === null) {
            statusSetzen("LOADING");
        }



        /* -----------------------------------------
           Song, Drehbuch und Intensitätsdaten
           gemeinsam vorbereiten
           ----------------------------------------- */

        const ladevorgaenge = [
            songLaden(songId),
            window.tiertreffDiscoDrehbuchLaden(),
            songIntensitaetenLaden()
        ];

        /* Dunkle Kartenebenen nur bei Bedarf laden */

        if (dunkleKarte) {
            ladevorgaenge.push(
                discoGrafikenLaden()
            );
        }

        /* Alle benötigten Ressourcen vorbereiten */

        const ergebnisse = await Promise.all(
            ladevorgaenge
        );
        const allesGeladen =
            ergebnisse.every(function (erfolg) {
                return erfolg === true;
            });

        if (!allesGeladen) {

            /*
            Ein Ladefehler darf einen bereits
            laufenden Song nicht beeinflussen.
            */

            if (aktiverSongId === null) {
                statusSetzen("IDLE");
            }

            console.error(
                "Tiertreff-Disco: Vorbereitung fehlgeschlagen."
            );

            return false;
        }

        /* Erfolgreich vorbereiteten Song merken */

        bereiterSongId = songId;

        /*
        READY nur setzen, wenn kein anderer
        Song gerade abgespielt wird.

        Der vorbereitete Song bleibt trotzdem
        im Cache und kann später starten.
        */

        if (aktiverSongId === null) {
            statusSetzen("READY");
        }

        return true;
    }

    /* -----------------------------------------
       Vorbereitung öffentlich bereitstellen

       Später kann der READY-Zustand
       an Firebase gemeldet werden.
       ----------------------------------------- */

    window.tiertreffDiscoVorbereiten =
        discoVorbereiten;

    /* Ende gemeinsame Disco-Vorbereitung */
	    /* -----------------------------------------
       Vorbereiteten Song abspielen

       Verwendet ausschließlich bereits
       geladene Audio-Objekte und die
       zentrale Soundverwaltung.

       Noch keine Warteschlange.
       ----------------------------------------- */

    
		async function discoSongAbspielen(songId, firebaseStartzeit = null) {

        /* -----------------------------------------
           Gleichzeitige Wiedergabe verhindern

           Auch während eines noch laufenden
           Startversuchs keinen zweiten Song
           zulassen.
           ----------------------------------------- */

        if (
            aktiverSongId !== null ||
            discoStatus === "PLAYING" ||
            discoStatus === "STARTING"
        ) {

            console.warn(
                "Tiertreff-Disco: Es läuft bereits ein Song."
            );

            return false;
        }

        statusSetzen("STARTING");

        /* Ende Wiedergabesperre */
        /* Song muss vollständig geladen sein */

        const audio = geladeneSongs.get(songId);

        if (!audio) {

            console.warn(
                "Tiertreff-Disco: Song nicht geladen:",
                songId
            );

            statusSetzen("IDLE");

            return false;
        }

        /* -----------------------------------------
           Startposition festlegen

           Bei lokalem Songstart beginnt die
           Wiedergabe bei Sekunde 0.

           Bei einem gemeinsamen Firebase-Start
           wird die bereits vergangene Spielzeit
           berücksichtigt.
           ----------------------------------------- */


        
        /* Firebase-Startzeit oder bisherigen lokalen Start verwenden */


        /* Gemeinsame Firebase-Zeit für die Songposition */

        const aktuelleFirebaseZeit =
            typeof window.tiertreffMusikboxServerZeit === "function"
                ? window.tiertreffMusikboxServerZeit()
                : null;

        const gemeinsameJetztZeit =
            aktuelleFirebaseZeit !== null
                ? aktuelleFirebaseZeit
                : Date.now();

        const gemeinsamerStartzeitpunkt =
            typeof firebaseStartzeit === "number"
                ? firebaseStartzeit
                : gemeinsameJetztZeit;

        const startpositionSekunden = Math.max(
            0,
            (gemeinsameJetztZeit - gemeinsamerStartzeitpunkt) / 1000
        );


        audio.currentTime = startpositionSekunden;


        /* Ende Startposition */
        /* Vorhandene Soundverwaltung verwenden */

        const erfolg =
            await window.reservatGeladenenSoundAbspielen(
                audio,
                1
            );

        if (!erfolg) {

            statusSetzen("READY");

            return false;
        }

        /* -----------------------------------------
           Reguläres Songende behandeln

           Später kann hier die Warteschlange
           den nächsten Song übernehmen.
           ----------------------------------------- */


        /* -----------------------------------------
           Aktuellen Song und Startzeit merken

           Verwendet den Firebase-Startzeitpunkt,
           sofern dieser übergeben wurde.
           Andernfalls gilt die lokale Browserzeit.
           ----------------------------------------- */



        aktiverSongId = songId;
        aktiverSongStartzeitpunkt = gemeinsamerStartzeitpunkt;


        /* Ende Songstart */
        /* -----------------------------------------
           Raumlicht beim Songstart aktualisieren

           Die Kartenanzeige liest den Lichtzustand
           aus dem Disco-Drehbuch.
           ----------------------------------------- */

        if (
            typeof window.kartenGrafikAktualisieren ===
            "function"
        ) {
            window.kartenGrafikAktualisieren();
        }

        /* Stationäre Objekte neu beleuchten */

        if (
            typeof window.npcGrafikenAktualisieren === "function"
        ) {
            window.npcGrafikenAktualisieren();
        }

        /* Ende Raumlicht beim Songstart */

        /* -----------------------------------------
           Musiknoten beim Songstart aktivieren
           ----------------------------------------- */

        musiknotenStarten();

        /* Ende Musiknotenstart */

        /* -----------------------------------------
           ROCKSHOW – AUTOMATISCHER START

           Nur für "Schritt für Schritt".

           Gilt sowohl für einen neuen Songstart
           als auch für den Wiedereinstieg
           in einen bereits laufenden Song.

           Die Rockshow verwendet anschließend
           automatisch die aktuelle Songzeit.
           ----------------------------------------- */

        if (
            songId === "schritt_fuer_schritt" &&
            typeof window.tiertreffRockshowLichterTest ===
                "function"
        ) {
            window.tiertreffRockshowLichterTest();
        }

        /* Ende automatischer Rockshow-Start */

        /* -----------------------------------------
           Disco-Lichter beim Songstart aktivieren

           Lichtflecken auf der Tanzfläche anlegen,
           über den Avataren anzeigen und die
           automatische Aufhellung starten.
           ----------------------------------------- */

        
        if (
            discoDrehbuch?.songs?.[songId]?.effekte?.some(
                function (effekt) {
                    return (
                        effekt.typ === "discolichter" &&
                        effekt.aktion === "start" &&
                        effekt.zeit === 0
                    );
                }
            ) &&
            discoLichtbereichErzeugen()
        ) {


            const lichtbereich = document.querySelector(
                "#reservatZoomEbene .song-licht-bereich"
            );

            if (lichtbereich) {
                lichtbereich.style.zIndex = "9999";
            }

            window.tiertreffDiscoAvatarLichtStarten();
        }

        /* Ende Disco-Lichter beim Songstart */


        /* -----------------------------------------
           Gemeinsame Songende-Funktion

           Wird beim natürlichen Songende oder
           durch einen Administrator-Stopp aufgerufen.
           ----------------------------------------- */

        function discoSongBeenden() {


                /* -----------------------------------------
                   Beendeten Song freigeben

                   Song-ID und Startzeitpunkt
                   gemeinsam zurücksetzen.
                   ----------------------------------------- */

                aktiverSongId = null;
                aktiverSongStartzeitpunkt = null;


                /* Musiknoten beim Songende stoppen */

                musiknotenStoppen();

                /* -----------------------------------------
                   ROCKSHOW – AUTOMATISCHER STOPP

                   Entfernt beim Songende oder lokalen
                   Stopp alle Rockshow-Effekte:
                   Lichtkegel, Satelliten, Nebel
                   und Bodenbeleuchtung.
                   ----------------------------------------- */

                if (
                    typeof window.tiertreffRockshowLichterEntfernen ===
                        "function"
                ) {
                    window.tiertreffRockshowLichterEntfernen();
                }

                /* Ende automatischer Rockshow-Stopp */

                /* -----------------------------------------
                   Disco-Beleuchtung beim Songende beenden

                   - Avatar-Lichttimer stoppen
                   - Lichtflecken entfernen
                   - Normale Avatarhelligkeit herstellen
                   ----------------------------------------- */

                window.tiertreffDiscoAvatarLichtStoppen();

                const lichtbereich = document.querySelector(
                    "#reservatZoomEbene .song-licht-bereich"
                );

                if (lichtbereich) {
                    lichtbereich.remove();
                }

                /* Normale Avatarbeleuchtung wiederherstellen */

                document.querySelectorAll(
                    "#spielfeld canvas[data-spieler-uid]"
                ).forEach(function (avatar) {

                    const uid = avatar.dataset.spielerUid;

                    const position =
                        window.multiplayerPositionen?.[uid];

                    if (!position) {
                        return;
                    }

                    const helligkeit =
                        window.reservatBeleuchtung
                            ?.lichtquellenHelligkeitBestimmen(
                                position.karte,
                                position.x,
                                position.y
                            ) ?? 1;

                    const istStatue =
                        avatar.style.filter.includes("grayscale");

                    avatar.style.filter = istStatue
                        ? "grayscale(1) brightness(" +
                            (0.75 * helligkeit) + ")"
                        : "brightness(" + helligkeit + ")";

                });

                /* Ende Disco-Beleuchtung beim Songende */

                statusSetzen("IDLE");

				                /* -----------------------------------------
                   Raumlicht nach Songende aktualisieren

                   Ohne aktiven Song verwendet die
                   Kartenanzeige wieder die normalen
                   hellen Kartenebenen.
                   ----------------------------------------- */

        if (
            typeof window.kartenGrafikAktualisieren ===
            "function"
        ) {
            window.kartenGrafikAktualisieren();
        }

        /* Stationäre Objekte neu beleuchten */

        if (
            typeof window.npcGrafikenAktualisieren === "function"
        ) {
            window.npcGrafikenAktualisieren();
        }

        /* Ende Raumlicht beim Songende */

                console.log(
                    "Tiertreff-Disco: Song beendet:",
                    songId
                );


        }

        /* Natürliches Songende überwachen */

        audio.addEventListener(
            "ended",
            discoSongBeenden,
            { once: true }
        );


        /* -----------------------------------------
           Lokaler Songstopp

           Wird beim Administrator-Notstopp,
           beim Verlassen des Tiertreffs und
           beim Aufräumen nach Songende verwendet.

           Beendet Musik und Disco-Effekte
           ausschließlich im eigenen Browser.
           Der Firebase-Songzustand bleibt
           dabei unverändert.
           ----------------------------------------- */


        window.tiertreffDiscoSongStoppen = function () {

            /* Nur den tatsächlich aktiven Song stoppen */

            if (aktiverSongId !== songId) {
                return false;
            }

            /* Automatischen End-Listener entfernen */

            audio.removeEventListener(
                "ended",
                discoSongBeenden
            );

            /* Audio sofort anhalten */

            audio.pause();

            if (window.reservatLaufendeSounds) {
                window.reservatLaufendeSounds.delete(audio);
            }

            /* Gemeinsame Aufräumfunktion ausführen */

            discoSongBeenden();

            return true;
        };

        /* Ende manueller Songstopp */


        statusSetzen("PLAYING");

        return true;
    }

    /* Funktion für spätere Verwendung bereitstellen */

    window.tiertreffDiscoSongAbspielen =
        discoSongAbspielen;

    /* Ende Songwiedergabe */
	    /* -----------------------------------------
       Aktuellen Songzustand abfragen

       Liefert Song-ID, Startzeitpunkt und
       berechnete Abspielposition.

       Später verwenden wir dafür die
       gemeinsame Firebase-Zeitbasis.
       ----------------------------------------- */

    window.tiertreffDiscoAktuellerSong = function () {

        if (
            aktiverSongId === null ||
            aktiverSongStartzeitpunkt === null
        ) {
            return null;
        }

        const vergangeneSekunden = Math.max(
            0,
            (Date.now() - aktiverSongStartzeitpunkt) / 1000
        );

        return {
            songId: aktiverSongId,
            startzeitpunkt: aktiverSongStartzeitpunkt,
            positionSekunden: vergangeneSekunden
        };
    };

    /* Ende Songzustand */
	    /* -----------------------------------------
       Wiedereinstiegsposition berechnen

       Grundlage ist der feste Startzeitpunkt,
       nicht die lokale Position des Audioplayers.

       Rückgabe:
       null = kein aktiver Song
       Zahl = aktuelle Position in Sekunden

       Später verwenden wir eine mit Firebase
       abgeglichene Zeitbasis.
       ----------------------------------------- */

    window.tiertreffDiscoPositionBerechnen =
        function () {

            if (
                aktiverSongId === null ||
                aktiverSongStartzeitpunkt === null
            ) {
                return null;
            }

            const vergangeneSekunden =
                (Date.now() - aktiverSongStartzeitpunkt)
                / 1000;

                        /* -----------------------------------------
               Songdauer prüfen

               Die Dauer steht im Songkatalog
               im Format Minuten:Sekunden.
               ----------------------------------------- */

            const songInfo =
                discoSongInfoAusDrehbuch(aktiverSongId);

            if (!songInfo || !songInfo.dauer) {
                return null;
            }

            const dauerTeile =
                songInfo.dauer.split(":").map(Number);

            const dauerSekunden =
                dauerTeile[0] * 60 + dauerTeile[1];

            if (vergangeneSekunden >= dauerSekunden) {
                return null;
            }

            return Math.max(0, vergangeneSekunden);
        };

    /* Ende Wiedereinstiegsposition */
	    /* -----------------------------------------
       Audioposition synchronisieren

       Setzt den bereits geladenen Audioplayer
       auf die aktuelle Position des Songs.

       Startet selbst keine Wiedergabe.
       ----------------------------------------- */

    window.tiertreffDiscoPositionSynchronisieren =
        function () {

            const position =
                window.tiertreffDiscoPositionBerechnen();

            /* Kein aktiver oder bereits beendeter Song */

            if (position === null) {
                return false;
            }

            /* Bereits geladenen Song verwenden */

            const audio = geladeneSongs.get(aktiverSongId);

            if (!audio) {
                return false;
            }

            /* Aktuelle Songposition übernehmen */

            try {

                audio.currentTime = position;



                return true;

            } catch (fehler) {

                console.warn(
                    "Tiertreff-Disco: Position konnte nicht gesetzt werden.",
                    fehler
                );

                return false;
            }
        };

    /* Ende Audioposition synchronisieren */
	    /* -----------------------------------------
       Musikbox nach Tabwechsel fortsetzen

       Der Song läuft zeitlich weiter.
       Beim Zurückkehren wird deshalb zuerst
       seine aktuelle Position berechnet.

       Die zentrale Soundverwaltung bleibt
       unverändert.
       ----------------------------------------- */

        document.addEventListener(
        "visibilitychange",
        function () {

            /* Nur beim Zurückkehren reagieren */

            if (document.hidden) {
                return;
            }

            /* Gemeinsame Wiedereinstiegsfunktion */

            window.tiertreffDiscoNachSoundEin()
                .catch(function (fehler) {

                    console.warn(
                        "Tiertreff-Disco: Wiedereinstieg fehlgeschlagen.",
                        fehler
                    );

                });

        }
    );

    /* Ende Wiedereinstieg nach Tabwechsel */
	    /* -----------------------------------------
       Musikbox nach Sound-EIN fortsetzen

       Der Song läuft zeitlich weiter,
       auch wenn der lokale Sound aus war.
       ----------------------------------------- */

    window.tiertreffDiscoNachSoundEin =
        async function () {

            /* Bereits ein Wiedereinstieg aktiv? */

            if (discoWiedereinstiegLaeuft) {
                return false;
            }

            discoWiedereinstiegLaeuft = true;

            try {

                /* Sound und Sichtbarkeit prüfen */

                if (
                    window.reservatSoundAktiv !== true ||
                    document.hidden
                ) {
                    return false;
                }

                /* Kein aktiver Song */

                if (aktiverSongId === null) {
                    return false;
                }
				                /* -----------------------------------------
                   Musik nur im Tiertreff abspielen

                   Gilt für alle Wiedereinstiegsereignisse.
                   ----------------------------------------- */

                if (
                    window.aktuelleSpielerPosition?.karte !==
                    "tiertreff_innen"
                ) {
                    return false;
                }

                /* Ende Tiertreff-Prüfung */

                /* -----------------------------------------
                   Laufenden Song nicht unterbrechen

                   Wenn die Musik bereits spielt,
                   ist kein Wiedereinstieg nötig.
                   ----------------------------------------- */

                const laufendesAudio =
                    geladeneSongs.get(aktiverSongId);

                if (
                    laufendesAudio &&
                    !laufendesAudio.paused &&
                    !laufendesAudio.ended
                ) {
                    return true;
                }

                /* Ende Schutz vor unnötiger Synchronisierung */

                /* Aktuelle Position synchronisieren */

                const synchronisiert =
                    window.tiertreffDiscoPositionSynchronisieren();

                if (!synchronisiert) {

                    /* Song ist möglicherweise abgelaufen */

                    if (
                        aktiverSongId !== null &&
                        aktiverSongStartzeitpunkt !== null &&
                        window.tiertreffDiscoPositionBerechnen() === null
                    ) {


                        /* -----------------------------------------
                           Songende während Tab-Unterbrechung

                           Die vollständige vorhandene
                           Stoppfunktion verwenden.

                           Dadurch werden Audio, Musiknoten,
                           Disco-Lichter, Avatarbeleuchtung
                           und Raumlicht gemeinsam aufgeräumt.
                           ----------------------------------------- */

                        if (
                            typeof window.tiertreffDiscoSongStoppen ===
                            "function"
                        ) {

                            window.tiertreffDiscoSongStoppen();
                        }

                        console.log(
                            "Tiertreff-Disco: Song während Unterbrechung beendet."
                        );

                    }

                    return false;
                }

                /* Geladenes Audio verwenden */

                const audio = geladeneSongs.get(aktiverSongId);

                if (!audio) {
                    return false;
                }

                /* Bereits laufende Wiedergabe */

                if (!audio.paused) {
                    return true;
                }

                /* Wiedergabe fortsetzen */

                return await window.reservatGeladenenSoundAbspielen(
                    audio,
                    1
                );

            } finally {

                /* Sperre immer wieder freigeben */

                discoWiedereinstiegLaeuft = false;

            }
        };

    /* Ende Wiedereinstieg nach Sound-EIN */
	    /* -----------------------------------------
       Wiedereinstieg nach Seitenwiederherstellung

       Wird die Seite aus dem Browser-Verlauf
       wiederhergestellt, synchronisieren wir
       die Musikbox mit der aktuellen Songzeit.

       Kein Timer und keine neue Soundlogik.
       ----------------------------------------- */

    window.addEventListener(
        "pageshow",
        function () {

            if (
                typeof window.tiertreffDiscoNachSoundEin !==
                "function"
            ) {
                return;
            }

            window.tiertreffDiscoNachSoundEin()
                .catch(function (fehler) {

                    console.warn(
                        "Tiertreff-Disco: Wiederherstellung fehlgeschlagen.",
                        fehler
                    );

                });

        }
    );

    /* Ende Wiedereinstieg nach pageshow */
	    /* -----------------------------------------
       Wiedereinstieg bei Fensterfokus

       Beispielsweise nach dem Wechsel
       zu einer anderen Anwendung.

       Verwendet die gemeinsame,
       abgesicherte Wiedereinstiegsfunktion.
       ----------------------------------------- */

    window.addEventListener(
        "focus",
        function () {

            window.tiertreffDiscoNachSoundEin()
                .catch(function (fehler) {

                    console.warn(
                        "Tiertreff-Disco: Fokus-Wiedereinstieg fehlgeschlagen.",
                        fehler
                    );

                });

        }
    );

    /* Ende Wiedereinstieg nach Fokus */
	    /* -----------------------------------------
       Musikbox lokal pausieren

       Beim Verlassen des Tiertreffs wird
       nur die Wiedergabe unterbrochen.

       Der Song läuft zeitlich weiter.
       ----------------------------------------- */

    window.tiertreffDiscoLokalPausieren =
        function () {

            if (aktiverSongId === null) {
                return;
            }

            const audio =
                geladeneSongs.get(aktiverSongId);

            if (!audio) {
                return;
            }

            audio.pause();

            if (window.reservatLaufendeSounds) {
                window.reservatLaufendeSounds.delete(audio);
            }
        };

    /* Ende Musikbox lokal pausieren */
    /* -----------------------------------------
       Vorbereitung abgeschlossen
       ----------------------------------------- */

    statusSetzen("IDLE");

    /* =========================================================
       ROCKSHOW – SCHRITT FÜR SCHRITT
       =========================================================

       Spezialeffekte ausschließlich für den Song
       "Schritt für Schritt".

       Geplante Funktionen:
       - Rhythmusgesteuerte Lichtgruppen im gesamten Raum
       - Umlaufende Discolichter um die Avatare
       - Extreme Avatar-Leuchteffekte
       - Rhythmische Musikboxsprünge
       - Große Musiknotenschwärme
       - Nebel und besondere Rock-Höhepunkte

       Die vorhandenen Disco-Effekte der anderen Songs
       bleiben unverändert.

       ========================================================= */

    /* -----------------------------------------
       ROCKSHOW: Lichtgruppen vorbereiten

       Fünf Gruppen mit jeweils vier Lichtern.
       Alle Lichter liegen über der gesamten Karte.

       Zunächst nur ein Sichttest.
       Noch keine automatische Aktivierung.
       ----------------------------------------- */

    
    /* =========================================================
       ROCKSHOW – RHYTHMISCHE LICHTCHOREOGRAFIE

       Ausschließlich für "Schritt für Schritt".
       Fünf Gruppen mit jeweils vier Lichtflecken.

       Die Positionen werden aus der Songzeit
       berechnet. Kein zusätzlicher Firebase-Timer.

       Version: erster Lichtshow-Gesamttest
       ========================================================= */

   
    /* =========================================================
       ROCKSHOW 2.0 – SCHRITT FÜR SCHRITT

       Vier Hauptscheinwerfer mit Satelliten.
       Lichtstrahlen aus den vier Raumecken.
       Songabhängige Bewegungen und Nebel.

       Nur manueller Test – andere Songs bleiben
       unverändert.
       ========================================================= */

    
    /* =========================================================
       ROCKSHOW 2.0 – SCHRITT FÜR SCHRITT

       Vier Hauptscheinwerfer mit Satelliten.
       Lichtstrahlen aus den vier Raumecken.
       Songabhängige Bewegungen und Nebel.

       Nur manueller Test – andere Songs bleiben
       unverändert.
       ========================================================= */

    let rockshowAnimation = null;
    let rockshowBereich = null;

    /* =========================================================
       ROCKMUSIKBOX 1.0 – SCHRITT FÜR SCHRITT

       Rhythmische Noten und Pfoten
       Rhythmische Musikboxbewegung

       Ausschließlich für schritt_fuer_schritt.

       Die Rockshow ruft diese Funktionen auf.
       Kein zusätzlicher Timer.
       ========================================================= */

    const ROCKBOX_BPM = 190;

    /* Hier können wir später den Beat exakt
       auf die Musik verschieben. */

    const ROCKBOX_BEATVERSATZ = 0;

    const ROCKBOX_BEATDAUER = 60 / ROCKBOX_BPM;

    /* Gesangsstellen mit Wolfspfoten */

    const ROCKBOX_PFOTENZEITEN = [
        [30, 40],
        [88, 98]
    ];

    let rockboxLetzterBeat = null;
    let rockboxLetzteGrafik = null;

    /* -----------------------------------------
       Pfotenzeit erkennen
       ----------------------------------------- */

    function rockboxIstPfotenzeit(t) {

        return ROCKBOX_PFOTENZEITEN.some(
            function (fenster) {
                return t >= fenster[0] &&
                       t < fenster[1];
            }
        );
    }

    /* -----------------------------------------
       Musikboxgrafik finden

       Die Grafik kann beim Kartenaufbau
       neu erzeugt werden.
       ----------------------------------------- */

    function rockboxGrafikFinden() {

        return document.querySelector(
            '#reservatZoomEbene img.song-musikbox-aktiv[alt="musikbox"]'
        );
    }

    /* -----------------------------------------
       Bewegung zurücksetzen

       Entfernt nur unsere Inline-Animation.
       Die normale CSS-Animation bleibt erhalten.
       ----------------------------------------- */

    function rockboxBewegungZuruecksetzen() {

        if (rockboxLetzteGrafik) {

            rockboxLetzteGrafik.style.removeProperty(
                "animation"
            );

            rockboxLetzteGrafik.style.removeProperty(
                "transform"
            );

            rockboxLetzteGrafik.style.removeProperty(
                "transform-origin"
            );
        }

        rockboxLetzteGrafik = null;
    }

    /* -----------------------------------------
       Gesamten Rockbox-Zustand zurücksetzen
       ----------------------------------------- */

    function rockboxZuruecksetzen() {

        rockboxLetzterBeat = null;
        rockboxBewegungZuruecksetzen();
    }

    /* =========================================================
       ROCKSHOW – HÜPFENDE AVATARE

       Alle sichtbaren Tiere hüpfen synchron
       zur Rockmusikbox.

       Keine Firebase-Änderungen.
       Keine Veränderung der Spielerposition.
       Kein zusätzlicher Timer.
       ========================================================= */

    function rockAvatareZuruecksetzen() {

        const avatare =
            window.avatarNachUid || {};

        for (const canvas of Object.values(avatare)) {

            if (!canvas) continue;

            canvas.style.removeProperty("transform");
            canvas.style.removeProperty("transform-origin");
        }
    }


    function rockAvatareAktualisieren(t, szene) {

        const avatare =
            window.avatarNachUid || {};

        /* Sprunghöhe je nach Songphase */

        let hoehe = 5;

        if (szene === "intro") hoehe = 2;
        if (szene === "aufbau") hoehe = 6;
        if (szene === "solo") hoehe = 15;
        if (szene === "verspielt") hoehe = 7;

        if (
            szene === "weiss1" ||
            szene === "weiss2"
        ) {
            hoehe = 8;
        }

        if (szene === "outro") hoehe = 3;

        /* -----------------------------------------
           Individuelle, dauerhafte Abweichungen

           Werden einmal pro Avatar vergeben.
           ----------------------------------------- */

        for (const canvas of Object.values(avatare)) {

            if (
                !canvas ||
                !canvas.isConnected ||
                canvas.parentElement?.id !==
                    "reservatZoomEbene"
            ) {
                continue;
            }

            if (!canvas.rockTanzWerte) {

                canvas.rockTanzWerte = {
                    zeit: (Math.random() - 0.5) * 0.10,
                    hoehe: 0.85 + Math.random() * 0.30,
                    neigung: 0.7 + Math.random() * 0.60,
                    richtung: Math.random() < 0.5 ? -1 : 1
                };
            }

            const werte = canvas.rockTanzWerte;

            /* Individuelle Beatposition */

            const beatPosition =
                (t + werte.zeit - ROCKBOX_BEATVERSATZ) /
                ROCKBOX_BEATDAUER;

            const phase =
                ((beatPosition % 1) + 1) % 1;

            const sprung =
                Math.pow(
                    Math.sin(Math.PI * phase),
                    2
                );

            /* Individuelle Sprunghöhe */

            const y =
                -sprung * hoehe * werte.hoehe;

            /* Individuelle Kippbewegung */

            const neigung =
                Math.sin(beatPosition * Math.PI) *
                (szene === "solo" ? 5 : 2) *
                werte.neigung *
                werte.richtung;

            canvas.style.transformOrigin =
                "center bottom";

            canvas.style.transform =
                "translateY(" +
                y.toFixed(2) +
                "px) rotate(" +
                neigung.toFixed(2) +
                "deg)";
        }
    }


    /* Ende hüpfende Avatare */

    /* -----------------------------------------
       Notenmenge bestimmen
       ----------------------------------------- */

    function rockboxNotenmenge(szene) {

        switch (szene) {

            case "intro":
                return 1;

            case "aufbau":
            case "gesang":
                return 2;

            case "solo":
                return 6;

            case "verspielt":
                return 3;

            case "weiss1":
            case "weiss2":
                return 4;

            case "outro":
                return 1;

            default:
                return 2;
        }
    }

    /* -----------------------------------------
       Noten auf einem Beat ausstoßen
       ----------------------------------------- */

    function rockboxBeatAusloesen(t, szene) {

        const anzahl =
            rockboxNotenmenge(szene);

        const pfoten =
            rockboxIstPfotenzeit(t);

        for (let i = 0; i < anzahl; i++) {

            musiknoteErzeugen(
                pfoten ? "🐾︎" : null
            );
        }
    }

    /* -----------------------------------------
       Musikboxbewegung berechnen

       Eine Wellenbewegung pro Beat.

       Die Bewegung ist vollständig von
       der Songzeit abhängig. Dadurch bleibt
       sie auch beim Wiedereinstieg synchron.
       ----------------------------------------- */

    function rockboxBewegung(t, szene) {

        const grafik = rockboxGrafikFinden();

        if (!grafik) {
            rockboxBewegungZuruecksetzen();
            return;
        }

        if (rockboxLetzteGrafik !== grafik) {

            rockboxBewegungZuruecksetzen();

            rockboxLetzteGrafik = grafik;
        }

        /* Die normale Wackelanimation nur
           für diese Rockshow übersteuern. */

        grafik.style.animation = "none";

        grafik.style.transformOrigin =
            "center bottom";

        const beatPosition =
            (t - ROCKBOX_BEATVERSATZ) /
            ROCKBOX_BEATDAUER;

        const phase =
            ((beatPosition % 1) + 1) % 1;

        /* Sprungbogen:
           Beginn und Ende auf dem Boden. */

        const sprung =
            Math.pow(
                Math.sin(Math.PI * phase),
                2
            );

        /* Seitliche Kippbewegung */

        const kippung =
            Math.sin(beatPosition * Math.PI);

        let sprungHoehe = 3;
        let winkel = 2;
        let vergroesserung = 0.025;

        if (szene === "intro") {
            sprungHoehe = 1.5;
            winkel = 1.2;
        }

        if (szene === "aufbau") {
            sprungHoehe = 5;
            winkel = 3;
        }

        if (szene === "solo") {
            sprungHoehe = 13;
            winkel = 9;
            vergroesserung = 0.08;
        }

        if (szene === "verspielt") {
            sprungHoehe = 4;
            winkel = 4;
        }

        if (
            szene === "weiss1" ||
            szene === "weiss2"
        ) {
            sprungHoehe = 10;
            winkel = 6;
            vergroesserung = 0.12;
        }

        if (szene === "outro") {
            sprungHoehe = 2;
            winkel = 1;
        }

        /* Bewegung in Prozent der eigenen
           Bildhöhe, damit sie beim Zoom
           passend mitskaliert. */

        const y =
            -sprung * sprungHoehe;

        const drehen =
            kippung * winkel;

        const skalierung =
            1 + sprung * vergroesserung;

        grafik.style.transform =
            "translateY(" + y.toFixed(2) + "%) " +
            "rotate(" + drehen.toFixed(2) + "deg) " +
            "scale(" + skalierung.toFixed(3) + ")";
    }

    /* -----------------------------------------
       Zentrale Rockbox-Aktualisierung

       Wird aus der vorhandenen Rockshow-
       Animationsschleife aufgerufen.
       ----------------------------------------- */

    function rockboxAktualisieren(t, szene) {

        if (
            aktiverSongId !== "schritt_fuer_schritt" ||
            window.aktuelleSpielerPosition?.karte !==
                "tiertreff_innen"
        ) {
            rockboxZuruecksetzen();
            return;
        }

        const beat =
            Math.floor(
                (t - ROCKBOX_BEATVERSATZ) /
                ROCKBOX_BEATDAUER
            );

        /* Beim ersten Aufruf nicht alle
           bereits vergangenen Beats nachholen. */

        if (rockboxLetzterBeat === null) {
            rockboxLetzterBeat = beat - 1;
        }

        /* Pro Beat höchstens eine Notensalve.

           Bei Verzögerungen werden vergangene
           Beats übersprungen, statt dutzende
           Noten nachträglich auszustoßen. */

        if (beat > rockboxLetzterBeat) {

            rockboxLetzterBeat = beat;

            rockboxBeatAusloesen(t, szene);
        }

        /* Rücksprung oder neuer Songstart */

        if (beat < rockboxLetzterBeat) {
            rockboxLetzterBeat = beat;
        }

        rockboxBewegung(t, szene);
		        /* Avatare synchron zur Musikbox bewegen */

        rockAvatareAktualisieren(t, szene);
    }

    /* Ende Rockmusikbox 1.0 */

    const ROCK_BPM = 190;
    const ROCK_BEAT = 60 / ROCK_BPM;

    const ROCK_FARBEN = [
        [255, 55, 110],
        [40, 215, 255],
        [185, 75, 255],
        [255, 195, 40]
    ];

    const ROCK_ECKEN = [
        [1, 1],
        [99, 1],
        [1, 99],
        [99, 99]
    ];

    const rockClamp = (x, a, b) =>
        Math.max(a, Math.min(b, x));

    const rockMix = (a, b, f) =>
        a + (b - a) * rockClamp(f, 0, 1);

    const rockSmooth = x => {
        x = rockClamp(x, 0, 1);
        return x * x * (3 - 2 * x);
    };

    /* -----------------------------------------
       Musikalische Abschnitte

       Die Solo-Endzeiten sind vorläufig.
       ----------------------------------------- */

    function rockshowSzene(t) {

        if (t < 10) return "intro";
        if (t < 30) return "gesang";
        if (t < 46.8) return "aufbau";
        if (t < 69) return "solo";
        if (t < 85) return "gesang";
        if (t < 90.5) return "weiss1";
        if (t < 103.5) return "verspielt";
        if (t < 111) return "weiss2";
        if (t < 125) return "solo";
        return "outro";
    }

    /* -----------------------------------------
       SVG-Hilfsfunktionen
       ----------------------------------------- */

    const ROCK_SVG_NS =
        "http://www.w3.org/2000/svg";

    function rockSvgElement(name, parent, attrs = {}) {

        const el = document.createElementNS(
            ROCK_SVG_NS, name
        );

        Object.entries(attrs).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });

        parent.appendChild(el);
        return el;
    }

    /* -----------------------------------------
       Hauptlichtposition

       Intro: Tanzflächenkanten
       Gesang: Tanzfläche
       Solo: gesamter Raum
       ----------------------------------------- */

    function rockshowZentrum(g, t, szene) {

        const links = g % 2 === 0;
        const oben = g < 2;

        const basisX = links ? 32 : 72;
        const basisY = oben ? 67 : 83;

        const langsam = {
            x: basisX + 3 * Math.sin(t * 0.65 + g),
            y: basisY + 8 * Math.sin(t * 0.85 + g)
        };

        const tanz = {
            x: 52 + 20 * Math.cos(t * 0.37 + g * 1.57),
            y: 73 + 14 * Math.sin(t * 0.43 + g * 1.57)
        };

        const wild = {
            x: 50 + 43 * Math.sin(t * 1.45 + g * 1.7),
            y: 50 + 42 * Math.cos(t * 1.18 + g * 2.1)
        };

        if (szene === "intro") return langsam;

        if (szene === "solo") return wild;

        if (szene === "outro") {
            return langsam;
        }

        /* Übergänge weich ineinanderführen */

        let f = rockSmooth((t - 10) / 3);

        let x = rockMix(langsam.x, tanz.x, f);
        let y = rockMix(langsam.y, tanz.y, f);

        /* Ausbruch ins erste Solo */

		if (t >= 46.8 && t < 69) {
			f = rockSmooth((t - 46.8) / 1.3);
            x = rockMix(tanz.x, wild.x, f);
            y = rockMix(tanz.y, wild.y, f);
        }

        /* Rückkehr nach erstem Solo */

        if (t >= 69 && t < 72) {
            f = rockSmooth((t - 69) / 3);
            x = rockMix(wild.x, tanz.x, f);
            y = rockMix(wild.y, tanz.y, f);
        }

        /* Rückkehr nach zweitem Solo */

        if (t >= 125 && t < 128) {
            f = rockSmooth((t - 125) / 3);
            x = rockMix(wild.x, langsam.x, f);
            y = rockMix(wild.y, langsam.y, f);
        }

        return { x, y };
    }

    /* -----------------------------------------
       Weißer Lichtausbruch

       Zusammenziehen, aufblasen, zerspringen.
       ----------------------------------------- */

    function rockshowWeiss(t) {

        let start = -1;
        let dauer = 0;

        if (t >= 85 && t < 90.5) {
            start = 85;
            dauer = 5.5;
        }

        if (t >= 103.5 && t < 111) {
            start = 103.5;
            dauer = 7.5;
        }

        if (start < 0) {
            return { sammlung: 0, weiss: 0, radius: 0 };
        }

        const p = (t - start) / dauer;

        const sammlung =
            p < 0.36
                ? rockSmooth(p / 0.36)
                : p < 0.80
                    ? 1
                    : 1 - rockSmooth((p - 0.80) / 0.20);

        const weiss =
            rockSmooth((p - 0.20) / 0.20) *
            (1 - rockSmooth((p - 0.82) / 0.18));

        const radius =
            5 + 34 * rockSmooth((p - 0.32) / 0.48);

        return { sammlung, weiss, radius };
    }

    /* -----------------------------------------
       Rockshow entfernen
       ----------------------------------------- */

    function rockshowStoppen() {
        /* Rockmusikbox ebenfalls zurücksetzen */

        rockboxZuruecksetzen();
		        /* Alle Avatare wieder normal darstellen */

        rockAvatareZuruecksetzen();
        if (rockshowAnimation !== null) {
            cancelAnimationFrame(rockshowAnimation);
            rockshowAnimation = null;
        }

        rockshowBereich?.remove();
        rockshowBereich = null;
    }

    /* -----------------------------------------
       Lichtanlage erzeugen
       ----------------------------------------- */

    function rockshowLichterErzeugen() {

        const zoomEbene =
            document.getElementById("reservatZoomEbene");

        if (
            !zoomEbene ||
            window.aktuelleSpielerPosition?.karte !==
                "tiertreff_innen"
        ) {
            return false;
        }

        rockshowStoppen();

        const bereich = document.createElement("div");

        bereich.className = "rockshow-lichter";

        Object.assign(bereich.style, {
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: "9998"
        });

        zoomEbene.appendChild(bereich);
        rockshowBereich = bereich;

        /* =====================================================
           ROCKSHOW 2.1 – ECHTE BODENAUFHELLUNG

           Die beiden hellen Kartenebenen werden
           zusätzlich über die dunkle Karte gelegt.

           Eine gemeinsame, bewegliche Maske macht
           sie nur unter den Scheinwerfern sichtbar.
           ===================================================== */

        const rockKarte =
            window.reservatKarten?.tiertreff_innen;

        const rockHelleEbenen = [];

        if (rockKarte?.ebene1 && rockKarte?.ebene3) {

            const lichtKartenBereich =
                document.createElement("div");

            lichtKartenBereich.className =
                "rockshow-bodenlicht";

            Object.assign(lichtKartenBereich.style, {
                position: "absolute",
                inset: "0",
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: "0"
            });

            [rockKarte.ebene1, rockKarte.ebene3]
                .forEach(function (bild, index) {

                    const ebene =
                        document.createElement("div");

                    Object.assign(ebene.style, {
                        position: "absolute",
                        inset: "0",
                        backgroundImage:
                            'url("' + bild + '")',
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        opacity: "0.95"
                    });

                    lichtKartenBereich.appendChild(ebene);
                    rockHelleEbenen.push(ebene);
                });

            bereich.appendChild(lichtKartenBereich);
        }

        /* Ende Rockshow-Bodenaufhellung */

        const svg = rockSvgElement("svg", bereich, {
            viewBox: "0 0 100 100",
            preserveAspectRatio: "none",
            width: "100%",
            height: "100%"
        });

        svg.style.position = "absolute";
        svg.style.inset = "0";
        svg.style.overflow = "hidden";

        const defs = rockSvgElement("defs", svg);

        /* =====================================================
           ROCKSHOW 2.1 – WEICHE LICHTKEGEL
           ===================================================== */

        const strahlFilter = rockSvgElement(
            "filter", defs, {
                id: "rockshow-strahlweich",
                x: "-35%",
                y: "-35%",
                width: "170%",
                height: "170%"
            }
        );

        rockSvgElement(
            "feGaussianBlur", strahlFilter, {
                stdDeviation: "1.15"
            }
        );

        const nebelFilter = rockSvgElement(
            "filter", defs, {
                id: "rockshow-nebelweich",
                x: "-50%",
                y: "-50%",
                width: "200%",
                height: "200%"
            }
        );

        rockSvgElement(
            "feGaussianBlur", nebelFilter, {
                stdDeviation: "5"
            }
        );

        /* Ende weiche Lichtkegel */

        /* Weiche Farbverläufe */

        ROCK_FARBEN.forEach((farbe, i) => {

            const gradient = rockSvgElement(
                "radialGradient", defs,
                { id: "rocklicht-" + i }
            );

            [
                ["0%", 0.95],
                ["25%", 0.75],
                ["65%", 0.25],
                ["100%", 0]
            ].forEach(([offset, opacity]) => {

                rockSvgElement("stop", gradient, {
                    offset,
                    "stop-color":
                        "rgb(" + farbe.join(",") + ")",
                    "stop-opacity": opacity
                });
            });
        });

        const weissGradient = rockSvgElement(
            "radialGradient", defs,
            { id: "rocklicht-weiss" }
        );

        [
            ["0%", 1],
            ["45%", 0.95],
            ["75%", 0.5],
            ["100%", 0]
        ].forEach(([offset, opacity]) => {

            rockSvgElement("stop", weissGradient, {
                offset,
                "stop-color": "#ffffff",
                "stop-opacity": opacity
            });
        });


        /* =====================================================
           ROCKSHOW 2.1 – LEBENDIGER DISCONEBEL

           Neun unterschiedlich große Schwaden.
           Aufbau ab Sekunde 0.
           Volle Intensität ab Sekunde 30.
           ===================================================== */

        const nebel = [];

        for (let i = 0; i < 9; i++) {

            const links = i % 2 === 0;

            const startX = links ? -15 : 115;
            const startY = 12 + (i * 17) % 85;

            const el = rockSvgElement(
                "ellipse", svg, {
                    cx: startX,
                    cy: startY,
                    rx: 18 + (i * 7) % 20,
                    ry: 9 + (i * 5) % 13,
                    fill: i % 3 === 0
                        ? "#c6c9df"
                        : "#8795bb",
                    opacity: 0,
                    filter: "url(#rockshow-nebelweich)"
                }
            );

            nebel.push({
                element: el,
                startX,
                startY,
                links,
                phase: i * 1.73,
                tempo: 0.07 + (i % 4) * 0.035,
                staerke: 0.65 + (i % 3) * 0.17
            });
        }

        /* Ende lebendiger Disconebel */



        /* -----------------------------------------
           Vier Formationen

           Je Hauptlicht drei Satelliten
           und sechs winzige Funken.
           ----------------------------------------- */

        const gruppen = [];

        for (let g = 0; g < 4; g++) {

            const farbe = ROCK_FARBEN[g];
            const rgb = "rgb(" + farbe.join(",") + ")";

            const lichter = [];

            for (let n = 0; n < 10; n++) {

                /* Sichtbarer Lichtkegel */


                /* Weicher äußerer Lichtkegel */

                const strahl = rockSvgElement(
                    "path", svg, {
                        fill: rgb,
                        opacity: 0,
                        filter: "url(#rockshow-strahlweich)"
                    }
                );


                /* Auftreffpunkt auf Boden */

                const fleck = rockSvgElement(
                    "ellipse", svg, {
                        fill: "url(#rocklicht-" + g + ")",
                        opacity: 0
                    }
                );

                fleck.style.mixBlendMode =
                    "color-dodge";

                lichter.push({ strahl, fleck });
            }

            gruppen.push(lichter);
        }

        /* Weißer Lichtausbruch liegt darüber */

        const weiss = rockSvgElement(
            "circle", svg, {
                cx: 50,
                cy: 55,
                r: 0,
                fill: "url(#rocklicht-weiss)",
                opacity: 0
            }
        );

        weiss.style.mixBlendMode = "screen";

        /* -----------------------------------------
           Animationsschleife
           ----------------------------------------- */

        const testStart = performance.now();
        let letzterFrame = 0;


        function animieren(zeit) {

            /* -----------------------------------------
               ROCKSHOW – SICHERHEIT BEI KARTENWECHSEL

               Sobald der Spieler den Tiertreff
               verlässt, wird die gesamte Rockshow
               einschließlich aller Licht- und
               Nebelebenen entfernt.
               ----------------------------------------- */

            if (
                !bereich.isConnected ||
                window.aktuelleSpielerPosition?.karte !==
                    "tiertreff_innen"
            ) {
                rockshowStoppen();
                return;
            }

            /* Ende Kartenwechsel-Prüfung */

            if (zeit - letzterFrame < 33) {

                rockshowAnimation =
                    requestAnimationFrame(animieren);
                return;
            }

            letzterFrame = zeit;

            const song =
                window.tiertreffDiscoAktuellerSong?.();

            if (
                song &&
                song.songId !== "schritt_fuer_schritt"
            ) {
                rockshowStoppen();
                return;
            }

            const t = song
                ? song.positionSekunden
                : (zeit - testStart) / 1000;

            if (t >= 134) {
                rockshowStoppen();
                return;
            }

            const szene = rockshowSzene(t);
            const weissPhase = rockshowWeiss(t);
            /* -----------------------------------------
               ROCKMUSIKBOX 1.0

               Noten, Pfoten und Musikboxbewegung
               synchron zur bestehenden Rockshow.
               ----------------------------------------- */

            rockboxAktualisieren(t, szene);

            /* Ende Rockmusikbox-Aktualisierung */
            /* Beatimpuls */

            const phase =
                (t % ROCK_BEAT) / ROCK_BEAT;

            const puls =
                Math.pow(1 - phase, 2.5);

            const solo = szene === "solo";
            const verspielt = szene === "verspielt";

            const kraft =
                solo ? 1 :
                szene === "intro" ? 0.45 :
                szene === "outro" ? 0.35 :
                0.75;


            /* =================================================
               ROCKSHOW 2.1 – NEBELBEWEGUNG

               Bereits im Intro sichtbar.
               Ab Sekunde 30 volle Intensität.
               Unterschiedliche Driftbewegungen,
               Verdichtungen und Geschwindigkeiten.
               ================================================= */

            const nebelStaerke =
                rockSmooth(t / 30) *
                (1 - rockSmooth((t - 125) / 9));

            nebel.forEach(function (wolke, i) {

                const el = wolke.element;

                const drift =
                    Math.sin(
                        t * wolke.tempo +
                        wolke.phase
                    );

                const quer =
                    Math.sin(
                        t * wolke.tempo * 0.63 +
                        wolke.phase * 1.7
                    );

                const aufbau =
                    rockSmooth(t / 30);

                const x =
                    wolke.startX +
                    (wolke.links ? 1 : -1) *
                    aufbau * (22 + i * 3) +
                    drift * 13;

                const y =
                    wolke.startY +
                    quer * 11;

                const dichte =
                    0.17 +
                    0.09 * Math.sin(
                        t * 0.22 + wolke.phase
                    );

                el.setAttribute("cx", x);
                el.setAttribute("cy", y);

                el.setAttribute(
                    "opacity",
                    Math.max(
                        0,
                        nebelStaerke *
                        wolke.staerke *
                        dichte
                    ).toFixed(3)
                );

                el.setAttribute(
                    "rx",
                    18 + (i * 7) % 20 +
                    4 * Math.sin(t * 0.12 + i)
                );
            });

            /* Ende Nebelbewegung */


            /* Vier Hauptformationen */

            /* -----------------------------------------
               Lichtmasken für die helle Karte sammeln
               ----------------------------------------- */

            const rockMasken = [];

            /* Ende Maskenvorbereitung */


            for (let g = 0; g < 4; g++) {

                const zentrum =
                    rockshowZentrum(g, t, szene);

                const [ex, ey] = ROCK_ECKEN[g];

                for (let n = 0; n < 10; n++) {

                    const { strahl, fleck } =
                        gruppen[g][n];

                    const hauptlicht = n === 0;
                    const funke = n >= 4;

                    const sichtbar =
                        hauptlicht ||
                        (t >= 10 && !funke) ||
                        (verspielt && funke);

                    if (!sichtbar) {
                        strahl.setAttribute("opacity", 0);
                        fleck.setAttribute("opacity", 0);
                        continue;
                    }

                    let x = zentrum.x;
                    let y = zentrum.y;

                    let radius = hauptlicht
                        ? 8
                        : funke ? 1.1 : 3.7;

                    if (!hauptlicht) {

                        const richtung =
                            n % 2 ? 1 : -1;

                        const tempo =
                            verspielt ? 1.8 :
                            solo ? 5.5 : 2.6;

                        const winkel =
                            t * tempo * richtung +
                            n * 2.094 +
                            g * 0.7;

                        const beatAbstand =
                            1 + puls * 0.35;

                        const abstand =
                            (funke ? 12 : 7) *
                            beatAbstand *
                            (solo ? 1.6 : 1);

                        x += Math.cos(winkel) * abstand;
                        y += Math.sin(winkel) * abstand;
                    }

                    /* Alle Lichter verschmelzen */

                    x = rockMix(
                        x, 50,
                        weissPhase.sammlung
                    );

                    y = rockMix(
                        y, 55,
                        weissPhase.sammlung
                    );

                    const beatGroesse =
                        1 + puls * kraft * 0.35;

                    radius *= beatGroesse;

                    const helligkeit =
                        (hauptlicht ? 0.85 :
                         funke ? 0.75 : 0.65) *
                        (0.65 + puls * 0.35) *
                        (1 - weissPhase.weiss * 0.75);

                    /* Lichtfleck */

                    fleck.setAttribute("cx", x);
                    fleck.setAttribute("cy", y);
                    fleck.setAttribute("rx", radius);
                    fleck.setAttribute("ry", radius * 0.85);

                    fleck.setAttribute(
                        "opacity",
                        helligkeit.toFixed(3)
                    );

                    /* ---------------------------------
                       Lichtpunkt beleuchtet die Karte

                       Weiche Maske mit hellem Zentrum
                       und transparentem Außenrand.
                       --------------------------------- */

                    const maskenRadius =
                        radius * (hauptlicht ? 1.25 : 1.1);

                    const maskenKraft =
                        rockClamp(
                            helligkeit *
                            (hauptlicht ? 1 : 0.75),
                            0,
                            1
                        );

                    rockMasken.push(
                        "radial-gradient(" +
                        "ellipse " +
                        maskenRadius.toFixed(2) + "% " +
                        (maskenRadius * 0.85).toFixed(2) +
                        "% at " +
                        x.toFixed(2) + "% " +
                        y.toFixed(2) + "%, " +
                        "rgba(0,0,0," +
                        maskenKraft.toFixed(3) +
                        ") 0%, " +
                        "rgba(0,0,0," +
                        (maskenKraft * 0.65).toFixed(3) +
                        ") 40%, " +
                        "transparent 100%)"
                    );

                    /* Ende Lichtmaske */

                    /* Transparenter Lichtstrahl

                       Funken benötigen keinen Strahl.
                       Die anderen Strahlen enden
                       am Auftreffpunkt.
                    */

                    if (funke) {
                        strahl.setAttribute("opacity", 0);
                        continue;
                    }

                    const dx = x - ex;
                    const dy = y - ey;

                    const laenge =
                        Math.hypot(dx, dy) || 1;

                    /* Kegelende orientiert sich
                       am Radius des Lichtflecks. */

                    const breite =
                        radius * (hauptlicht ? 1.05 : 0.95);

                    const nx = -dy / laenge * breite;
                    const ny = dx / laenge * breite;

                    const pfad =
                        "M " + ex + " " + ey +
                        " L " + (x + nx) + " " + (y + ny) +
                        " Q " + x + " " + (y + breite) +
                        " " + (x - nx) + " " + (y - ny) +
                        " Z";

                    strahl.setAttribute("d", pfad);

                    strahl.setAttribute(
                        "opacity",
                        (
                            (hauptlicht ? 0.12 : 0.07) *
                            (0.7 + puls * 0.3) *
                            (1 + nebelStaerke * 0.8)
                        ).toFixed(3)
                    );
                }
            }

            /* =================================================
               ROCKSHOW 2.1 – BODENBELEUCHTUNG ANWENDEN

               Die helle Karte wird nur an den
               beweglichen Lichtpunkten sichtbar.
               ================================================= */

            if (rockHelleEbenen.length) {

                const maskenBild =
                    rockMasken.join(", ");

                rockHelleEbenen.forEach(function (ebene) {

                    ebene.style.maskImage = maskenBild;

                    ebene.style.webkitMaskImage =
                        maskenBild;

                    ebene.style.maskRepeat =
                        "no-repeat";

                    ebene.style.webkitMaskRepeat =
                        "no-repeat";
                });
            }

            /* Ende Bodenbeleuchtung */


            /* Gleißender weißer Höhepunkt */

            weiss.setAttribute(
                "r",
                weissPhase.radius
            );

            weiss.setAttribute(
                "opacity",
                weissPhase.weiss.toFixed(3)
            );

            rockshowAnimation =
                requestAnimationFrame(animieren);
        }

        rockshowAnimation =
            requestAnimationFrame(animieren);

        return true;
    }

    /* -----------------------------------------
       Manuelle Testfunktionen
       ----------------------------------------- */

    window.tiertreffRockshowLichterTest =
        rockshowLichterErzeugen;

    window.tiertreffRockshowLichterEntfernen =
        rockshowStoppen;

    /* Ende Rockshow-Lichtgruppen */





    /* =========================================================
       ENDE ROCKSHOW – SCHRITT FÜR SCHRITT
       ========================================================= */

})();