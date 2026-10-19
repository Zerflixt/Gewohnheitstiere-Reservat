/* =========================================================
GEWOHNHEITSTIERE RESERVAT
Zentrale Soundverwaltung
========================================================= */


/* =========================================================
LAUFENDE SOUNDS
========================================================= */

window.reservatLaufendeSounds =
    new Set();


/* =========================================================
AKTIVE DAUERSOUNDS
========================================================= */

/*
Dauersounds bleiben hier registriert,
auch wenn der globale Sound ausgeschaltet wird.

Dadurch können sie beim Wiedereinschalten
weiterlaufen, solange die zugehörige Aktion
noch aktiv ist.
*/

window.reservatAktiveDauersounds =
    new Set();


/* =========================================================
SOUND ABSPIELEN
========================================================= */

window.reservatSoundAbspielen =
function (
    datei,
    lautstaerke = 1,
    schleife = false
) {

    /* -----------------------------------
    Audio erzeugen
    ----------------------------------- */

    const sound =
        new Audio(
            datei
        );

    sound.volume =
        lautstaerke;

    sound.loop =
        schleife;

    /* Ende Audio erzeugen */


    /* -----------------------------------
    Dauersound merken
    ----------------------------------- */

    if (schleife === true) {

        window.reservatAktiveDauersounds.add(
            sound
        );

    }

    /* Ende Dauersound merken */


    /* -----------------------------------
    Globalen Sound-Schalter prüfen
    ----------------------------------- */

	if (
		window.reservatSoundAktiv !== true ||
		document.hidden
	) {

        /*
        Ein einmaliger Sound wird bei
        ausgeschaltetem Sound verworfen.

        Ein Dauersound bleibt dagegen
        registriert und kann später starten.
        */

        if (schleife !== true) {

            return null;

        }

        return sound;

    }

    /* Ende Sound-Schalter prüfen */


    /* -----------------------------------
    Sound als laufend merken
    ----------------------------------- */

    window.reservatLaufendeSounds.add(
        sound
    );

    /* Ende Sound merken */


    /* -----------------------------------
    Sound regulär beendet
    ----------------------------------- */

    sound.addEventListener(
        "ended",
        function () {

            window.reservatLaufendeSounds.delete(
                sound
            );

            window.reservatAktiveDauersounds.delete(
                sound
            );

        }
    );

    /* Ende Sound regulär beendet */


    /* -----------------------------------
    Sound starten
    ----------------------------------- */

    sound.play().catch(
        function () {

            window.reservatLaufendeSounds.delete(
                sound
            );

        }
    );

    /* Ende Sound starten */


    return sound;

}; /* Ende reservatSoundAbspielen */


/* =========================================================
EINEN SOUND ENDGÜLTIG STOPPEN
========================================================= */

window.reservatSoundStoppen =
function (sound) {

    if (!sound) {

        return;

    }

    sound.pause();

    sound.currentTime =
        0;

    window.reservatLaufendeSounds.delete(
        sound
    );

    window.reservatAktiveDauersounds.delete(
        sound
    );

}; /* Ende reservatSoundStoppen */


/* =========================================================
ALLE SOUNDS VORÜBERGEHEND STUMMSCHALTEN
========================================================= */

window.reservatAlleSoundsStoppen =
function () {

    window.reservatLaufendeSounds.forEach(
        function (sound) {

            sound.pause();

        }
    );

    window.reservatLaufendeSounds.clear();

}; /* Ende reservatAlleSoundsStoppen */


/* =========================================================
AKTIVE DAUERSOUNDS WIEDER STARTEN
========================================================= */

window.reservatDauersoundsFortsetzen =
function () {

    /* -----------------------------------
    Sound muss eingeschaltet sein
    ----------------------------------- */

		if (
			window.reservatSoundAktiv !== true ||
			document.hidden
		) {

			return;

		}

    /* Ende Sound prüfen */


    /* -----------------------------------
    Aktive Dauersounds fortsetzen
    ----------------------------------- */

    window.reservatAktiveDauersounds.forEach(
        function (sound) {

            if (
                window.reservatLaufendeSounds.has(
                    sound
                )
            ) {

                return;

            }

            window.reservatLaufendeSounds.add(
                sound
            );

            sound.play().catch(
                function () {

                    window.reservatLaufendeSounds.delete(
                        sound
                    );

                }
            );

        }
    );

    /* Ende Dauersounds fortsetzen */

}; /* Ende reservatDauersoundsFortsetzen */
/* =========================================================
SOUNDS BEIM APP-WECHSEL PAUSIEREN
========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        /* -----------------------------------
        Reservat ist im Hintergrund
        ----------------------------------- */

        if (document.hidden) {

            window.reservatAlleSoundsStoppen();
            return;

        }

        /* Ende Hintergrund */


        /* -----------------------------------
        Reservat ist wieder sichtbar
        ----------------------------------- */

        window.reservatDauersoundsFortsetzen();

        /* Ende Vordergrund */

    }
);

/* Ende Sounds beim App-Wechsel pausieren */
/* =========================================================
DAUERSOUNDS NACH BENUTZERINTERAKTION STARTEN
========================================================= */

/*
Manche Browser verhindern den automatischen
Soundstart beim Laden der Seite.

Nach einem Klick versuchen wir deshalb,
noch pausierte Dauersounds zu starten.
*/

document.addEventListener(
    "click",
    function () {

	/* -----------------------------------
	Soundschalter und Sichtbarkeit prüfen
	----------------------------------- */

	if (
		window.reservatSoundAktiv !== true ||
		document.hidden
	) {

		return;

	}

	/* Ende Soundschalter und Sichtbarkeit */

        /* Pausierte Dauersounds prüfen */

        window.reservatAktiveDauersounds.forEach(
            function (sound) {

                if (!sound.paused) {

                    return;

                }

                window.reservatLaufendeSounds.add(
                    sound
                );

                sound.play().catch(
                    function () {

                        window.reservatLaufendeSounds.delete(
                            sound
                        );

                    }
                );

            }
        );

    }
);

/* Ende Dauersounds nach Benutzerinteraktion */
/* =========================================================
ENTFERNUNG ZU EINER SOUNDQUELLE BERECHNEN
========================================================= */

window.reservatSoundEntfernung =
function (
    spielerX,
    spielerY,
    quellfelder
) {

    /* -----------------------------------
    Kürzeste Entfernung suchen
    ----------------------------------- */

    let kleinsteEntfernung =
        Infinity;

    for (const feld of quellfelder) {

        const unterschiedX =
            spielerX - feld[0];

        const unterschiedY =
            spielerY - feld[1];

        const entfernung =
            Math.sqrt(
                unterschiedX * unterschiedX +
                unterschiedY * unterschiedY
            );

        if (
            entfernung < kleinsteEntfernung
        ) {

            kleinsteEntfernung =
                entfernung;

        }

    }

    /* Ende kürzeste Entfernung suchen */

    return kleinsteEntfernung;

}; /* Ende reservatSoundEntfernung */


/* =========================================================
LAUTSTÄRKE AUS ENTFERNUNG BERECHNEN
========================================================= */

window.reservatSoundLautstaerke =
function (
    entfernung,
    reichweite,
    maxLautstaerke = 1
) {

    /* -----------------------------------
    Lineare Lautstärkeabnahme
    ----------------------------------- */

    if (
        reichweite <= 0
    ) {

        return 0;

    }

    const faktor =
        Math.max(
            0,
            1 - entfernung / reichweite
        );

    return Math.min(
        1,
        Math.max(
            0,
            faktor * maxLautstaerke
        )
    );

    /* Ende lineare Lautstärkeabnahme */

}; /* Ende reservatSoundLautstaerke */
/* =========================================================
SOUND-LAUTSTÄRKE SANFT ANPASSEN
========================================================= */

window.reservatSoundSanftAnpassen =
function (
    sound,
    zielLautstaerke,
    dauer = 150
) {

    /* -----------------------------------
    Eingaben prüfen
    ----------------------------------- */

    if (!sound) {

        return;

    }

    zielLautstaerke =
        Math.max(
            0,
            Math.min(1, zielLautstaerke)
        );

    /* Ende Eingaben prüfen */


    /* -----------------------------------
    Vorherige Überblendung abbrechen
    ----------------------------------- */

    if (sound.reservatFadeFrame) {

        cancelAnimationFrame(
            sound.reservatFadeFrame
        );

        sound.reservatFadeFrame = null;

    }

    /* Ende vorherige Überblendung */


    /* -----------------------------------
    Ausgangswerte merken
    ----------------------------------- */

    const startLautstaerke =
        sound.volume;

    const startZeit =
        performance.now();

    /* Ende Ausgangswerte merken */


    /* -----------------------------------
    Lautstärke schrittweise verändern
    ----------------------------------- */

    function aktualisieren(zeit) {

        const fortschritt =
            Math.max(
                0,
                Math.min(
                    1,
                    (zeit - startZeit) / dauer
                )
            );

        sound.volume =
            startLautstaerke +
            (
                zielLautstaerke -
                startLautstaerke
            ) * fortschritt;

        if (fortschritt < 1) {

            sound.reservatFadeFrame =
                requestAnimationFrame(
                    aktualisieren
                );

        } else {

            sound.volume =
                zielLautstaerke;

            sound.reservatFadeFrame =
                null;

        }

    }

    /* Ende Lautstärke verändern */


    /* -----------------------------------
    Überblendung starten
    ----------------------------------- */

    sound.reservatFadeFrame =
        requestAnimationFrame(
            aktualisieren
        );

    /* Ende Überblendung starten */

}; /* Ende reservatSoundSanftAnpassen */
/* =========================================================
POSITIONSABHÄNGIGE UMGEBUNGSGERÄUSCHE
========================================================= */

/*
Jede Geräuschquelle bekommt höchstens
ein Audioobjekt.

Die Karte bestimmt die Geräuschquellen,
die Spielerposition bestimmt die Lautstärke.
*/

window.reservatUmgebungSounds =
    new Map();


/* =========================================================
UMGEBUNGSGERÄUSCHE AKTUALISIEREN
========================================================= */

window.reservatUmgebungSoundsAktualisieren =
function (kartenId, spielerX, spielerY) {

    /* -----------------------------------
    Geräuschquellen der Karte ermitteln
    ----------------------------------- */

    const karte =
        window.reservatKarten?.[kartenId];

    const soundquellen =
        Array.isArray(karte?.soundquellen)
            ? karte.soundquellen
            : [];

    const benoetigteSounds =
        new Set();

    /* Ende Geräuschquellen ermitteln */


    /* -----------------------------------
    Geräuschquellen durchgehen
    ----------------------------------- */

    for (const quelle of soundquellen) {

        if (
            !quelle.id ||
            !quelle.datei ||
            !Array.isArray(quelle.quellfelder) ||
            quelle.quellfelder.length === 0
        ) {

            continue;

        }
        /* -----------------------------------
        Tageszeit der Geräuschquelle prüfen
        ----------------------------------- */

        if (
            quelle.tageszeit &&
            quelle.tageszeit !==
                window.reservatTageszeitBestimmen()
        ) {

            continue;

        }

        /* Ende Tageszeitprüfung */
        const kennung =
            kartenId + ":" + quelle.id;

        benoetigteSounds.add(
            kennung
        );

        /* Entfernung berechnen */

        const entfernung =
            window.reservatSoundEntfernung(
                spielerX,
                spielerY,
                quelle.quellfelder
            );

        /* Ziellautstärke berechnen */

        const zielLautstaerke =
            window.reservatSoundLautstaerke(
                entfernung,
                quelle.reichweite,
                quelle.maxLautstaerke
            );

        /* Sound bei Bedarf erzeugen */

        let sound =
            window.reservatUmgebungSounds.get(
                kennung
            );

        if (!sound) {

            sound =
                window.reservatSoundAbspielen(
                    quelle.datei,
                    0,
                    true
                );

            if (!sound) {

                continue;

            }

            window.reservatUmgebungSounds.set(
                kennung,
                sound
            );

        }

        /* -----------------------------------
        Lautstärke sanft anpassen

        Bei global ausgeschaltetem Sound
        keine Überblendung starten.
        ----------------------------------- */

        if (
            window.reservatSoundAktiv === true
        ) {

            window.reservatSoundSanftAnpassen(
                sound,
                zielLautstaerke
            );

        } else {

            if (sound.reservatFadeFrame) {

                cancelAnimationFrame(
                    sound.reservatFadeFrame
                );

                sound.reservatFadeFrame = null;

            }

            sound.volume = zielLautstaerke;

        }

        /* Ende Lautstärke anpassen */
    }

    /* Ende Geräuschquellen durchgehen */


    /* -----------------------------------
    Sounds anderer Karten entfernen
    ----------------------------------- */

    for (
        const [kennung, sound]
        of window.reservatUmgebungSounds
    ) {

        if (
            benoetigteSounds.has(kennung)
        ) {

            continue;

        }

        /* Laufende Überblendung abbrechen */

        if (sound.reservatFadeFrame) {

            cancelAnimationFrame(
                sound.reservatFadeFrame
            );

            sound.reservatFadeFrame =
                null;

        }

        /* Sound endgültig stoppen */

        window.reservatSoundStoppen(
            sound
        );

        window.reservatUmgebungSounds.delete(
            kennung
        );

    }

    /* Ende Sounds anderer Karten entfernen */

}; /* Ende reservatUmgebungSoundsAktualisieren */
/* =========================================================
HINTERGRUNDMUSIK - VERWALTUNG
========================================================= */

/*
Hintergrundmusik wird unabhängig von
positionsabhängigen Umgebungsgeräuschen verwaltet.

Pro Karte läuft höchstens ein Musikstück.
*/

window.reservatAktuelleMusik = null;
window.reservatAktuelleMusikKennung = null;


/* =========================================================
HINTERGRUNDMUSIK AKTUALISIEREN
========================================================= */

window.reservatMusikAktualisieren =
function (kartenId) {

    /* -----------------------------------
    Musikdefinition der Karte ermitteln
    ----------------------------------- */

    const musik =
        window.reservatKarten?.[kartenId]?.musik;

    const kennung =
        musik?.datei
            ? kartenId + ":" + musik.datei
            : null;

    /* Ende Musikdefinition ermitteln */


    /* -----------------------------------
    Bereits richtige Musik aktiv?
    ----------------------------------- */

    if (
        kennung !== null &&
        kennung === window.reservatAktuelleMusikKennung
    ) {

        return;

    }

    /* Ende Prüfung */


    /* -----------------------------------
    Bisherige Musik stoppen
    ----------------------------------- */

    if (window.reservatAktuelleMusik) {

        window.reservatSoundStoppen(
            window.reservatAktuelleMusik
        );

        window.reservatAktuelleMusik = null;

    }

    window.reservatAktuelleMusikKennung = null;

    /* Ende bisherige Musik */


    /* -----------------------------------
    Keine Musik auf dieser Karte?
    ----------------------------------- */

    if (!kennung) {

        return;

    }

    /* Ende Prüfung */


    /* -----------------------------------
    Neue Musik starten
    ----------------------------------- */

    const lautstaerke =
        Math.max(
            0,
            Math.min(1, musik.lautstaerke ?? 1)
        );

    const sound =
        window.reservatSoundAbspielen(
            musik.datei,
            lautstaerke,
            musik.schleife === true
        );

    if (!sound) {

        return;

    }

    window.reservatAktuelleMusik = sound;
    window.reservatAktuelleMusikKennung = kennung;

    /* Ende neue Musik starten */

}; /* Ende reservatMusikAktualisieren */