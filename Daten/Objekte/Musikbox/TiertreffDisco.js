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

    function musiknoteErzeugen() {

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

        note.textContent =
            symbole[Math.floor(Math.random() * symbole.length)];

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

        const gemeinsamerStartzeitpunkt =
            typeof firebaseStartzeit === "number"
                ? firebaseStartzeit
                : Date.now();

        const startpositionSekunden = Math.max(
            0,
            (Date.now() - gemeinsamerStartzeitpunkt) / 1000
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

})();