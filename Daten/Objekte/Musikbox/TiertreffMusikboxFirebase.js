
/* =========================================================
TIERTREFF – MUSIKBOX FIREBASE
=========================================================

Gemeinsame Musikbox-Steuerung für alle Spieler.

Geplante Aufgaben:
- Gemeinsamen Songzustand beobachten
- Songstart über Firebase-Transaktion
- Persönliche Musikstatistik aktualisieren
- Administrator-Notstopp für Zerflixt

Die Firebase-Grundfunktionen werden aus der
bestehenden story-javascript.js verwendet.

========================================================= */

(function () {
    "use strict";

    const MUSIKBOX_PFAD =
        "realtime/tiertreff/musikbox";

    /* -----------------------------------------
       MUSIKBOX – FIREBASE-ZEITSYNCHRONISATION

       Firebase liefert die geschätzte Abweichung
       zwischen Browseruhr und Serverzeit.

       Der Offset wird automatisch aktualisiert.
       Noch keine Änderung der Songsteuerung.
       ----------------------------------------- */

    let musikboxServerZeitOffset = 0;
    let musikboxServerZeitBereit = false;
	
    let musikboxZeitListenerGestartet = false;


    window.tiertreffMusikboxServerZeitStarten =
        function () {

            /* Zeitlistener nur einmal starten */

            if (musikboxZeitListenerGestartet) {
                return true;
            }

            if (
                !window.firebaseDatabase ||
                typeof window.firebaseRef !== "function" ||
                typeof window.firebaseOnValue !== "function"
            ) {
                console.warn(
                    "Musikbox: Firebase für Zeitsynchronisation nicht bereit."
                );
                return false;
            }

            musikboxZeitListenerGestartet = true;

            /* Firebase-Systempfad */

            const zeitRef = window.firebaseRef(
                window.firebaseDatabase,
                "/.info/serverTimeOffset"
            );


            window.firebaseOnValue(
                zeitRef,
                function (snapshot) {

                    const offset = snapshot.val();

                    if (typeof offset !== "number") {
                        return;
                    }

                    musikboxServerZeitOffset = offset;
                    musikboxServerZeitBereit = true;

                    /* Songlistener erst mit gültiger Firebase-Zeit starten */

                    if (musikboxListenerAbmelden === null) {
                        window.tiertreffMusikboxFirebaseListenerStarten();
                    }

                    console.log(
                        "Musikbox: Firebase-Zeit synchronisiert.",
                        "Abweichung:",
                        offset,
                        "ms"
                    );
                },
                function (fehler) {

                    console.error(
                        "Musikbox: Zeitsynchronisation fehlgeschlagen:",
                        fehler
                    );
                }
            );

            return true;
        };

    window.tiertreffMusikboxServerZeit =
        function () {

            if (!musikboxServerZeitBereit) {
                return null;
            }

            return Date.now() + musikboxServerZeitOffset;
        };

    /* Ende Musikbox – Firebase-Zeitsynchronisation */

    /* -----------------------------------------
       Firebase-Verbindung prüfen
       ----------------------------------------- */

    window.tiertreffMusikboxFirebasePruefen =
        function () {

            const bereit =
                !!window.firebaseDatabase &&
                typeof window.firebaseRef === "function" &&
                typeof window.firebaseOnValue === "function" &&
                typeof window.firebaseRunTransaction === "function" &&
                !!window.firebaseAuth?.currentUser;

            console.log(
                "Musikbox-Firebase:",
                bereit ? "BEREIT" : "NOCH NICHT BEREIT"
            );

            return bereit;
        };

    /* Ende Firebase-Verbindung prüfen */

    /* -----------------------------------------
       Gemeinsamen Musikbox-Zustand lesen

       Nur ein einmaliger Lesezugriff.
       Noch kein Listener und keine Schreibzugriffe.
       ----------------------------------------- */

    window.tiertreffMusikboxFirebaseStatusLesen =
        async function () {

            if (!window.tiertreffMusikboxFirebasePruefen()) {
                return null;
            }

            try {

                const musikboxRef = window.firebaseRef(
                    window.firebaseDatabase,
                    MUSIKBOX_PFAD
                );

                const snapshot = await window.firebaseGet(
                    musikboxRef
                );

                const zustand = snapshot.val();

                console.log(
                    "Musikbox-Firebase: Aktueller Zustand:",
                    zustand
                );

                return zustand;

            } catch (fehler) {

                console.error(
                    "Musikbox-Firebase: Lesen fehlgeschlagen:",
                    fehler
                );

                return null;
            }
        };

    /* Ende gemeinsamen Musikbox-Zustand lesen */


    /* -----------------------------------------
       Songstart in Firebase speichern

       Reguläre Startfunktion der Musikbox.
       Verhindert gleichzeitige Songstarts.

       Die lokale Wiedergabe übernimmt
       anschließend der Firebase-Listener.
       ----------------------------------------- */

    window.tiertreffMusikboxFirebaseSongStarten =
        async function (songId = "gewohnheitstiere") {


            if (!window.tiertreffMusikboxFirebasePruefen()) {
                return false;
            }

            const user = window.firebaseAuth.currentUser;

            try {

                /* Songdaten aus dem zentralen Drehbuch */

                const bereit =
                    await window.tiertreffDiscoSongkatalogBereitstellen();

                if (!bereit) {
                    return false;
                }

                const song = window.tiertreffDiscoSongInfo(songId);

                if (!song) {
                    console.error("Unbekannter Song:", songId);
                    return false;
                }

                const teile = song.dauer.split(":").map(Number);

                const dauerMs =
                    (teile[0] * 60 + teile[1]) * 1000;


                /* -----------------------------------------
                   Spielernamen aus der Anmeldung übernehmen

                   Die Reservats-Anmeldung verwendet den
                   Habitica-Namen als Teil der Login-E-Mail.
                   Kein zusätzlicher Firebase-Lesezugriff.
                   ----------------------------------------- */

                const spielerName =
                    user.email
                        ?.split("@")[0]
                        .replaceAll("_", " ");



                if (
                    typeof spielerName !== "string" ||
                    !spielerName.trim()
                ) {
                    console.error(
                        "Musikbox: Spielername fehlt."
                    );
                    return false;
                }

                /* Neuen Start vorbereiten */

                const musikboxRef = window.firebaseRef(
                    window.firebaseDatabase,
                    MUSIKBOX_PFAD
                );

                const startId = window.firebasePush(
                    musikboxRef
                ).key;

                
                const aktuelleFirebaseZeit =
                    window.tiertreffMusikboxServerZeit();

                if (aktuelleFirebaseZeit === null) {
                    console.warn(
                        "Musikbox: Firebase-Zeit noch nicht bereit."
                    );
                    return false;
                }

                /* Drei Sekunden stummer Vorlauf */

                const startzeit = aktuelleFirebaseZeit + 3000;


                const neuerZustand = {
                    songId: songId,
                    startId: startId,
                    startzeit: startzeit,
                    endetUm: startzeit + dauerMs,
                    status: "started",
                    gestartetVon: {
                        uid: user.uid,
                        name: spielerName
                    }
                };

                /* Nur starten, wenn die Musikbox frei ist */

                const ergebnis =
                    await window.firebaseRunTransaction(
                        musikboxRef,
                        function (bisher) {

                            if (
                                bisher &&
                                bisher.status === "started" &&
                                bisher.endetUm > aktuelleFirebaseZeit
                            ) {
                                return;
                            }

                            return neuerZustand;
                        },
                        { applyLocally: false }
                    );

                if (!ergebnis.committed) {
                    console.warn(
                        "Musikbox: Es läuft bereits ein Song."
                    );
                    return false;
                }

                console.log(
                    "Musikbox: Songstart gespeichert:",
                    ergebnis.snapshot.val()
                );

                return true;

            } catch (fehler) {

                console.error(
                    "Musikbox: Songstart fehlgeschlagen:",
                    fehler
                );

                return false;
            }
        };

    /* Ende Firebase-Songstart */

    /* -----------------------------------------
       MUSIKBOX – ADMINISTRATOR-NOTSTOPP

       Nur Zerflixt darf einen laufenden Song
       stoppen, und nur innerhalb des Tiertreffs.

       Die Firebase-Regeln kontrollieren diese
       Berechtigung zusätzlich serverseitig.

       Alle Songdaten bleiben erhalten.
       Nur der Status wechselt auf "stopped".
       ----------------------------------------- */

    window.tiertreffMusikboxFirebaseAdminStoppen =
        async function () {

            const ADMIN_UID =
                "wkKQBlUrAec7PXIp0yafXROMLiA2";

            /* Firebase-Verbindung prüfen */

            if (!window.tiertreffMusikboxFirebasePruefen()) {
                return false;
            }

            const user = window.firebaseAuth.currentUser;

            /* Nur Administrator */

            if (!user || user.uid !== ADMIN_UID) {
                console.warn(
                    "Musikbox: Keine Administratorberechtigung."
                );
                return false;
            }

            /* Nur innerhalb des Tiertreffs */

            if (
                window.aktuelleSpielerPosition?.karte !==
                "tiertreff_innen"
            ) {
                console.warn(
                    "Musikbox: Notstopp nur im Tiertreff möglich."
                );
                return false;
            }

            if (window.tiertreffMusikboxServerZeit() === null) {
                console.warn(
                    "Musikbox: Firebase-Zeit noch nicht bereit."
                );
                return false;
            }

            try {

                const musikboxRef = window.firebaseRef(
                    window.firebaseDatabase,
                    MUSIKBOX_PFAD
                );

                /* Statusänderung atomar durchführen */

                const ergebnis =
                    await window.firebaseRunTransaction(
                        musikboxRef,
                        function (bisher) {

                            /* Kein laufender Song vorhanden */

                            if (
                                !bisher ||
                                bisher.status !== "started" ||
                                bisher.endetUm <= window.tiertreffMusikboxServerZeit()
                            ) {
                                return;
                            }

                            /* Nur den Status verändern */

                            return {
                                ...bisher,
                                status: "stopped"
                            };
                        },
                        { applyLocally: false }
                    );

                if (!ergebnis.committed) {
                    console.log(
                        "Musikbox: Kein laufender Song zum Stoppen."
                    );
                    return false;
                }

                console.log(
                    "Musikbox: Administrator-Notstopp gespeichert."
                );

                return true;

            } catch (fehler) {

                console.error(
                    "Musikbox: Administrator-Notstopp fehlgeschlagen:",
                    fehler
                );

                return false;
            }
        };

    /* Ende Administrator-Notstopp */

    /* -----------------------------------------
       FIREBASE – MUSIKBOX-LISTENER

       Beobachtet den gemeinsamen Songzustand.
       Wird pro Browser nur einmal gestartet.

       Noch keine automatische Musikwiedergabe.
       ----------------------------------------- */

    let musikboxListenerAbmelden = null;
    let letzterSongStartId = null;
    let letzterSongStatus = null;

    /* -----------------------------------------
       Firebase-Song für Wiedergabe prüfen

       Ein Song darf nur abgespielt werden,
       wenn sein Status "started" lautet
       und seine Endzeit noch nicht erreicht ist.

       Diese Prüfung verändert keine Daten.
       ----------------------------------------- */

    function musikboxSongIstAktiv(zustand) {

        if (
            !zustand ||
            zustand.status !== "started" ||
            typeof zustand.songId !== "string" ||
            typeof zustand.startId !== "string" ||
            typeof zustand.startzeit !== "number" ||
            typeof zustand.endetUm !== "number"
        ) {
            return false;
        }


        const aktuelleFirebaseZeit =
            window.tiertreffMusikboxServerZeit();

        if (aktuelleFirebaseZeit === null) {
            return false;
        }

        return zustand.endetUm > aktuelleFirebaseZeit;

    }

    /* Ende Firebase-Song prüfen */

    /* -----------------------------------------
       Lokale Wiedergabe gegen Doppelstarts sichern

       Die Startkennung identifiziert einen
       bestimmten Firebase-Songstart.

       Auch während des asynchronen Ladens
       darf derselbe Start nicht ein zweites
       Mal verarbeitet werden.
       ----------------------------------------- */

    let lokaleWiedergabeStartId = null;

    /* Ende Doppelstart-Schutz */


    /* -----------------------------------------
       Firebase-Song lokal wiedergeben

       Wird vom Firebase-Listener und beim
       Wiedereinstieg in den Tiertreff verwendet.

       Lädt die benötigten Ressourcen und
       übernimmt die gemeinsame Startzeit.
       ----------------------------------------- */


    async function musikboxFirebaseSongWiedergeben(zustand) {

        /* Nur gültige, laufende Songs zulassen */

        if (!musikboxSongIstAktiv(zustand)) {
            return false;
        }

        /* -----------------------------------------
           Wiedergabe nur im Tiertreff

           Der Firebase-Songzustand gilt für alle
           Spieler. Hörbar ist die Musik aber nur
           innerhalb des Tiertreffs.
           ----------------------------------------- */

        if (
            window.aktuelleSpielerPosition?.karte !==
            "tiertreff_innen"
        ) {
            return false;
        }

        /* Ende Tiertreff-Prüfung */

        /* Benötigte Disco-Funktionen prüfen */

        if (
            typeof window.tiertreffDiscoVorbereiten !== "function" ||
            typeof window.tiertreffDiscoSongAbspielen !== "function"
        ) {
            console.error(
                "Musikbox-Firebase: Disco-Steuerung fehlt."
            );
            return false;
        }

        /* Bereits bearbeiteten Song nicht erneut starten */

        if (lokaleWiedergabeStartId === zustand.startId) {
            return false;
        }

        /* Startkennung vor dem asynchronen Laden merken */

        lokaleWiedergabeStartId = zustand.startId;


        /* -----------------------------------------
           Song vorbereiten und starten

           Bei Fehlern wird die Startkennung
           wieder freigegeben.

           Vor dem Start prüfen wir erneut den
           aktuellen Firebase-Zustand, damit ein
           inzwischen gestoppter Song nicht
           nachträglich abgespielt wird.
           ----------------------------------------- */

        try {

            const vorbereitet =
                await window.tiertreffDiscoVorbereiten(
                    zustand.songId
                );

            if (!vorbereitet) {
                console.error(
                    "Musikbox-Firebase: Songvorbereitung fehlgeschlagen."
                );
                return false;
            }

            /* Nach dem Laden erneut prüfen */

            if (!musikboxSongIstAktiv(zustand)) {
                return false;
            }

            /* Aktuellen Firebase-Zustand erneut lesen */

            const musikboxRef = window.firebaseRef(
                window.firebaseDatabase,
                MUSIKBOX_PFAD
            );

            const snapshot =
                await window.firebaseGet(musikboxRef);

            const aktuell = snapshot.val();

            /* Song wurde zwischenzeitlich ersetzt,
               gestoppt oder ist bereits beendet */

            if (
                !musikboxSongIstAktiv(aktuell) ||
                aktuell.startId !== zustand.startId
            ) {
                return false;
            }

            /* Spieler könnte den Tiertreff verlassen haben */

            if (
                window.aktuelleSpielerPosition?.karte !==
                "tiertreff_innen"
            ) {
                return false;
            }

            /* Gemeinsame Wiedergabe starten */

            /* -----------------------------------------
               Stummer Vorlauf bis zur Firebase-Startzeit

               Keine Musik und keine Disco-Animation.
               Nach der Wartezeit Zustand erneut prüfen.
               ----------------------------------------- */

            const wartezeit = Math.max(
                0,
                aktuell.startzeit -
                    window.tiertreffMusikboxServerZeit()
            );

            if (wartezeit > 0) {

                await new Promise(function (resolve) {
                    setTimeout(resolve, wartezeit);
                });

                /* Nach dem Warten erneut prüfen */

                const neuerSnapshot =
                    await window.firebaseGet(musikboxRef);

                const neuerZustand = neuerSnapshot.val();

                if (
                    !musikboxSongIstAktiv(neuerZustand) ||
                    neuerZustand.startId !== zustand.startId ||
                    window.aktuelleSpielerPosition?.karte !==
                        "tiertreff_innen"
                ) {
                    return false;
                }
            }


            const gestartet =
                await window.tiertreffDiscoSongAbspielen(
                    aktuell.songId,
                    aktuell.startzeit
                );

            return gestartet === true;

        } catch (fehler) {

            console.error(
                "Musikbox-Firebase: Wiedergabe fehlgeschlagen:",
                fehler
            );

            return false;

        } finally {

            /*
            Eine fehlgeschlagene oder beendete
            Vorbereitung darf die Startkennung
            nicht dauerhaft blockieren.

            Der Schutz gegen parallele Aufrufe
            bleibt während der gesamten
            asynchronen Verarbeitung aktiv.
            */

            lokaleWiedergabeStartId = null;
        }
    }


    /* Ende Firebase-Songwiedergabe */
	
    /* -----------------------------------------
       MUSIKBOX – WIEDEREINSTIEG IN DEN TIERTREFF

       Beim Betreten des Tiertreffs wird der
       aktuelle Firebase-Songzustand gelesen.

       Läuft noch ein Song, übernimmt die
       vorhandene Wiedergabefunktion dessen
       ursprüngliche Startzeit.

       Ein beendeter oder gestoppter Song
       wird nicht erneut abgespielt.
       ----------------------------------------- */

    window.tiertreffMusikboxFirebaseWiedereinstieg =
        async function () {

            /* Nur im Tiertreff */

            if (
                window.aktuelleSpielerPosition?.karte !==
                "tiertreff_innen"
            ) {
                return false;
            }

            /* Firebase-Verbindung prüfen */

            if (!window.tiertreffMusikboxFirebasePruefen()) {
                return false;
            }

            try {

                /* Aktuellen Songzustand lesen */

                const musikboxRef = window.firebaseRef(
                    window.firebaseDatabase,
                    MUSIKBOX_PFAD
                );

                const snapshot =
                    await window.firebaseGet(musikboxRef);

                const zustand = snapshot.val();

                /* Nur tatsächlich laufende Songs */

                if (!musikboxSongIstAktiv(zustand)) {
                    return false;
                }

                /* Vorhandene Wiedergabelogik verwenden */

                const gestartet =
                    await musikboxFirebaseSongWiedergeben(
                        zustand
                    );

                if (gestartet) {
                    console.log(
                        "Musikbox-Firebase: Wiedereinstieg gestartet:",
                        zustand.songId
                    );
                }

                return gestartet;

            } catch (fehler) {

                console.error(
                    "Musikbox-Firebase: Wiedereinstieg fehlgeschlagen:",
                    fehler
                );

                return false;
            }
        };

    /* Ende Musikbox – Wiedereinstieg */


    window.tiertreffMusikboxFirebaseListenerStarten =
        function () {

            /* Firebase muss bereit sein */

            if (!window.tiertreffMusikboxFirebasePruefen()) {
                return false;
            }

            /* Firebase-Zeitsynchronisation starten */


            if (!musikboxServerZeitBereit) {
                window.tiertreffMusikboxServerZeitStarten();
                return true;
            }


            /* Doppelten Listener verhindern */

            if (musikboxListenerAbmelden !== null) {
                console.log(
                    "Musikbox-Firebase: Listener läuft bereits."
                );
                return true;
            }

            const musikboxRef = window.firebaseRef(
                window.firebaseDatabase,
                MUSIKBOX_PFAD
            );

            musikboxListenerAbmelden = window.firebaseOnValue(
                musikboxRef,

                function (snapshot) {

                    const zustand = snapshot.val();

                    /* Noch kein Songzustand vorhanden */

                    if (!zustand) {
                        letzterSongStartId = null;
                        letzterSongStatus = null;

                        console.log(
                            "Musikbox-Firebase: Musikbox frei."
                        );
                        return;
                    }


                    /* -----------------------------------------
                       Songzustand auf Gültigkeit prüfen

                       Verwendet die zentrale Prüfung
                       einschließlich Status, Startzeit,
                       Endzeit und Pflichtfeldern.
                       ----------------------------------------- */

                    const songLaeuft =
                        musikboxSongIstAktiv(zustand);


                    /* Neuen Songstart erkennen */

                    if (
                        zustand.startId !== letzterSongStartId
                    ) {

                        letzterSongStartId = zustand.startId;
                        letzterSongStatus = zustand.status;

                        console.log(
                            "Musikbox-Firebase: Songzustand empfangen:",
                            {
                                songId: zustand.songId,
                                startId: zustand.startId,
                                status: zustand.status,
                                songLaeuft: songLaeuft,
                                gestartetVon: zustand.gestartetVon
                            }
                        );


                        /* -----------------------------------------
                           Neuen Firebase-Song lokal starten

                           Nur gültige, laufende Songs werden
                           an die vorhandene Disco übergeben.

                           Die Wiedergabefunktion prüft selbst,
                           ob sich der Spieler im Tiertreff
                           befindet und ob der Song inzwischen
                           gestoppt oder beendet wurde.
                           ----------------------------------------- */

                        if (songLaeuft) {


                            musikboxFirebaseSongWiedergeben(zustand)
                                .then(async function (gestartet) {

                                    if (gestartet) {
                                        console.log(
                                            "Musikbox-Firebase: Wiedergabe gestartet:",
                                            zustand.songId
                                        );
                                        return;
                                    }

                                    /* -----------------------------------------
                                       Einmaliger Wiederholungsversuch

                                       Nur derselbe, weiterhin aktive Song
                                       darf erneut gestartet werden.
                                       ----------------------------------------- */

                                    console.warn(
                                        "Musikbox-Firebase: Start fehlgeschlagen, prüfe erneut:",
                                        zustand.songId
                                    );

                                    await new Promise(function (resolve) {
                                        setTimeout(resolve, 1000);
                                    });

                                    const pruefRef = window.firebaseRef(
                                        window.firebaseDatabase,
                                        MUSIKBOX_PFAD
                                    );

                                    const pruefSnapshot =
                                        await window.firebaseGet(pruefRef);

                                    const pruefZustand =
                                        pruefSnapshot.val();

                                    if (
                                        !musikboxSongIstAktiv(pruefZustand) ||
                                        pruefZustand.startId !== zustand.startId ||
                                        window.aktuelleSpielerPosition?.karte !==
                                            "tiertreff_innen"
                                    ) {
                                        return;
                                    }

                                    const zweiterVersuch =
                                        await musikboxFirebaseSongWiedergeben(
                                            pruefZustand
                                        );

                                    console.log(
                                        "Musikbox-Firebase: Zweiter Startversuch:",
                                        zweiterVersuch
                                    );

                                })
                                .catch(function (fehler) {

                                    console.error(
                                        "Musikbox-Firebase: Automatischer Start fehlgeschlagen:",
                                        fehler
                                    );

                                });

                        }

                        return;
                    }


                    /* -----------------------------------------
                       Firebase-Statusänderung erkennen

                       Bei einem Administrator-Stopp wird
                       die lokale Wiedergabe sofort beendet.

                       Die vorhandene Disco-Stoppfunktion
                       übernimmt auch das Aufräumen von
                       Audio, Licht und Animationen.
                       ----------------------------------------- */

                    if (
                        zustand.status !== letzterSongStatus
                    ) {

                        letzterSongStatus = zustand.status;

                        console.log(
                            "Musikbox-Firebase: Status geändert:",
                            zustand.status
                        );

                        /* Administrator hat Song gestoppt */

                        if (zustand.status === "stopped") {

                            if (
                                typeof window.tiertreffDiscoSongStoppen ===
                                "function"
                            ) {

                                const gestoppt =
                                    window.tiertreffDiscoSongStoppen();

                                console.log(
                                    "Musikbox-Firebase: Lokaler Stopp:",
                                    gestoppt
                                );
                            }
                        }
                    }

                },

                function (fehler) {

                    console.error(
                        "Musikbox-Firebase: Listenerfehler:",
                        fehler
                    );

                    musikboxListenerAbmelden = null;
                }
            );

            console.log(
                "Musikbox-Firebase: Listener gestartet."
            );

            return true;
        };

    /* Ende Firebase – Musikbox-Listener */

})();
