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
        window.reservatSoundAktiv !== true
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
        window.reservatSoundAktiv !== true
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