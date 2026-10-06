/* =========================================================
BIBLIOTHEKSROBOTER – TESTMODUS

Mögliche Werte über die Konsole:
"normal"
"update"
"angriff"
null = echter Zufall
========================================================= */

window.bibliotheksroboterTestModus = null;
/* =========================================================
BIBLIOTHEKSROBOTER – AUSGABE 24 ÖFFNEN
========================================================= */

window.bibliotheksroboterAusgabe24Oeffnen =
function () {

    window.open(
        "https://zerflixt.github.io/Wild-am-Sonntag-24/?quelle=reservat",
        "_blank"
    );

}; /* Ende bibliotheksroboterAusgabe24Oeffnen */

/* =========================================================
BIBLIOTHEKSROBOTER – GESPRÄCHSSTART BESTIMMEN
========================================================= */

window.bibliotheksroboterStartBestimmen =
function () {

    /* Testmodus hat Vorrang */

    if (
        window.bibliotheksroboterTestModus === "normal" ||
        window.bibliotheksroboterTestModus === "update" ||
        window.bibliotheksroboterTestModus === "angriff"
    ) {

        return window.bibliotheksroboterTestModus;

    }


    /* Echter Zufall */

    const zufall =
        Math.random() * 100;

    if (zufall < 5) {
        return "angriff";
    }

    if (zufall < 15) {
        return "update";
    }

    return "normal";

}; /* Ende bibliotheksroboterStartBestimmen */



/* =========================================================
BIBLIOTHEKSROBOTER - DIALOG ANZEIGEN
========================================================= */

window.bibliotheksroboterDialogAnzeigen =
async function (sonderfeld) {
    /* -----------------------------------
    Gesprächsstart bestimmen
    ----------------------------------- */

    const gespraechsStart =
        window.bibliotheksroboterStartBestimmen();

    console.log(
        "Bibliotheksroboter Gesprächsstart:",
        gespraechsStart
    );

    /* Ende Gesprächsstart bestimmen */
	    /* -----------------------------------
    Robo-Gedächtnis laden
    ----------------------------------- */

    let ausgabe24Gezeigt =
        false;

    const roboGedaechtnisUser =
        window.firebaseAuth?.currentUser;

    if (roboGedaechtnisUser) {

        try {

            const roboGedaechtnisRef =
                window.firebaseRef(
                    window.firebaseDatabase,
                    "npcGedachtnis/" +
                    "bibliotheksroboter/" +
                    roboGedaechtnisUser.uid
                );

            const roboGedaechtnisSnapshot =
                await window.firebaseGet(
                    roboGedaechtnisRef
                );

            if (
                roboGedaechtnisSnapshot.exists()
            ) {

                const roboGedaechtnis =
                    roboGedaechtnisSnapshot.val();

                ausgabe24Gezeigt =
                    roboGedaechtnis
                        .ausgabe24Gezeigt === true;

            }

        } catch (fehler) {

            console.error(
                "Bibliotheksroboter: Gedächtnis konnte nicht geladen werden.",
                fehler
            );

        }

    }

    console.log(
        "Bibliotheksroboter: Ausgabe 24 bereits gezeigt:",
        ausgabe24Gezeigt
    );

    /* Ende Robo-Gedächtnis laden */
	
    /* -----------------------------------
    Eventuell vorhandenen NPC-Dialog
    entfernen
    ----------------------------------- */

    const alterDialog =
        document.getElementById(
            "reservatNpcDialogTest"
        );

    if (alterDialog) {
        alterDialog.remove();
    }

    /* Ende vorhandenen Dialog entfernen */


    /* -----------------------------------
    Spielfeld suchen
    ----------------------------------- */

    const spielfeld =
        document.getElementById(
            "spielfeld"
        );

    if (!spielfeld) {

        console.error(
            "Bibliotheksroboter-Dialog: Spielfeld nicht gefunden."
        );

        return;
    }

    /* Ende Spielfeld suchen */


    /* -----------------------------------
    Dialogfläche erzeugen
    ----------------------------------- */

    const dialog =
        document.createElement(
            "div"
        );

    dialog.id =
        "reservatNpcDialogTest";


    /* -----------------------------------
    Zoom-Ebene erzeugen
    ----------------------------------- */

    const dialogZoomEbene =
        document.createElement(
            "div"
        );

    dialogZoomEbene.id =
        "reservatNpcDialogZoomEbene";

    dialog.appendChild(
        dialogZoomEbene
    );

    /* Ende Zoom-Ebene */


    /* -----------------------------------
    Dialog-Hintergrund
    ----------------------------------- */

    const hintergrund =
        document.createElement(
            "img"
        );

    hintergrund.src =
        "Daten/NPCs/Dialog-Hintergrund_01_768.png";

    hintergrund.id =
        "reservatNpcDialogHintergrund";

    dialogZoomEbene.appendChild(
        hintergrund
    );

    /* Ende Dialog-Hintergrund */


    /* -----------------------------------
    Bibliotheksroboter
    ----------------------------------- */

    const roboter =
        document.createElement(
            "img"
        );

    roboter.id =
        "reservatNpcDialogRoboter";

    /* -----------------------------------
    Robotergrafik zum Gesprächsstart
    ----------------------------------- */

    if (gespraechsStart === "angriff") {

        roboter.src =
            "Daten/NPCs/Bibliotheksroboter/" +
            "NPC_Hilfsrobo_06_Angriff.png";

    } else if (gespraechsStart === "update") {

        roboter.src =
            "Daten/NPCs/Bibliotheksroboter/" +
            "NPC_Hilfsrobo_07_Update.png";

    } else {

        /* Lesende Grafik zufällig auswählen */

        const leseGrafik =
            Math.random() < 0.5
                ? "NPC_Hilfsrobo_02.png"
                : "NPC_Hilfsrobo_03.png";

        roboter.src =
            "Daten/NPCs/Bibliotheksroboter/" +
            leseGrafik;

    }
    /* -----------------------------------
    Alarmton im Angriffsmodus
    ----------------------------------- */

    let alarmSound = null;

    if (gespraechsStart === "angriff") {
        /* -----------------------------------
        Bewegung während Angriff sperren
        ----------------------------------- */

        window.reservatBedienungGesperrt =
            true;

        /* Ende Bewegung während Angriff sperren */
       alarmSound =
    window.reservatSoundAbspielen(
        "Daten/NPCs/Bibliotheksroboter/" +
        "roboter_alarm_anschwellen_abbruch_10s.wav",
        0.5,
        false
    );

    }

    /* Ende Alarmton im Angriffsmodus */
    /* Ende Robotergrafik zum Gesprächsstart */

    roboter.alt =
        "Bibliotheksroboter";

    dialogZoomEbene.appendChild(
        roboter
    );

    /* Ende Bibliotheksroboter */
    /* -----------------------------------
    Eigenen Spieleravatar für Dialog
    erzeugen
    ----------------------------------- */

    const firebaseUser =
        window.firebaseAuth?.currentUser;

    const eigenerAvatar =
        firebaseUser
            ? window.avatarNachUid?.[
                firebaseUser.uid
            ]
            : null;


    if (eigenerAvatar) {

        /* -----------------------------------
        Eigenes Canvas für den Dialog
        erzeugen
        ----------------------------------- */

        const spielerAvatar =
            document.createElement(
                "canvas"
            );

        spielerAvatar.id =
            "reservatNpcDialogSpieler";

        spielerAvatar.width =
            eigenerAvatar.width;

        spielerAvatar.height =
            eigenerAvatar.height;


        /* -----------------------------------
        Bereits gebauten Avatar in das
        Dialog-Canvas kopieren
        ----------------------------------- */

        const context =
            spielerAvatar.getContext(
                "2d"
            );

        context.drawImage(
            eigenerAvatar,
            0,
            0
        );


        /* -----------------------------------
        Spieleravatar in Dialog einsetzen
        ----------------------------------- */

        dialogZoomEbene.appendChild(
            spielerAvatar
        );

    } /* Ende eigener Spieleravatar */
    /* -----------------------------------
    Zugangsprüfung anzeigen
    ----------------------------------- */

    const scanText =
        document.createElement(
            "canvas"
        );

    scanText.id =
        "reservatNpcDialogRoboterText";

    scanText.width = 900;
    scanText.height = 700;

    const scanContext =
        scanText.getContext(
            "2d"
        );

    scanContext.font =
        "32px monospace";

    scanContext.fillStyle =
        "#000000";

    scanContext.textBaseline =
        "top";


    let scanZeilen;


/* -----------------------------------
Angriffsmodus
----------------------------------- */

if (gespraechsStart === "angriff") {

    scanZeilen = [
        "WARNUNG.",
        "",
        "FEHLERHAFTE BESUCHERKLASSIFIZIERUNG.",
        "",
        "OBJEKT ERKANNT ALS:",
        "BEDROHUNG.",
        "",
        "VERTEIDIGUNGSPROTOKOLL AKTIVIERT."
    ];


/* -----------------------------------
Update
----------------------------------- */

} else if (gespraechsStart === "update") {

    scanZeilen = [
        "SYSTEMUPDATE WIRD DURCHGEFÜHRT.",
        "",
        "FORTSCHRITT: 98 %",
        "FORTSCHRITT: 97 %",
        "",
        "VORAUSSICHTLICHE RESTDAUER: 3 MINUTEN.",
        "KORREKTUR: 47 MINUTEN.",
        "",
        "BITTE SPÄTER ERNEUT STÖREN."
    ];


/* -----------------------------------
Normaler Gesprächsstart
----------------------------------- */

} else {

    /* -----------------------------------
    Prüfungsbegriff zufällig auswählen
    ----------------------------------- */

    const pruefungsBegriffe = [
        "GESPRÄCHSBERECHTIGUNGSPRÜFUNG",
        "KOMMUNIKATIONSFREIGABEPRÜFUNG",
        "ANSPRECHBERECHTIGUNGSPRÜFUNG",
        "KONVERSATIONSGENEHMIGUNGSVERFAHREN",
        "UNTERBRECHUNGSBERECHTIGUNGSPRÜFUNG"
    ];

    const pruefungsBegriff =
        pruefungsBegriffe[
            Math.floor(
                Math.random() *
                pruefungsBegriffe.length
            )
        ];

    /* Ende Prüfungsbegriff */


    /* -----------------------------------
    Aktuellen Spieler bestimmen
    ----------------------------------- */

    let spieler = null;

    const firebaseUser =
        window.firebaseAuth?.currentUser;

    if (firebaseUser) {

        try {

            const userRef =
                window.firebaseRef(
                    window.firebaseDatabase,
                    "users/" +
                    firebaseUser.uid
                );

            const userSnapshot =
                await window.firebaseGet(
                    userRef
                );

            if (userSnapshot.exists()) {

                const userDaten =
                    userSnapshot.val();

                if (userDaten.habiticaId) {

                    spieler =
                        window.reservatSpielerSuchen(
                            window.reservatSchnappschuss,
                            userDaten.habiticaId
                        );

                }

            }

        } catch (fehler) {

            console.error(
                "Bibliotheksroboter: " +
                "Spielerdaten konnten nicht geladen werden.",
                fehler
            );

        }

    }

    /* Ende aktuellen Spieler bestimmen */


    /* -----------------------------------
    Normale Scanwerte vorbereiten
    ----------------------------------- */

    const spielerName =
        spieler?.profile?.name ||
        "UNBEKANNT";

    let geburtstag =
        "UNBEKANNT";

    const erstellt =
        spieler?.auth?.timestamps?.created;

    if (erstellt) {

        geburtstag =
            new Date(
                erstellt
            ).toLocaleDateString(
                "de-DE"
            );

    }


    const klassenNamen = {

        warrior:
            "KRIEGER",

        rogue:
            "SCHURKE",

        wizard:
            "MAGIER",

        healer:
            "HEILER"

    };

    const klasse =
        klassenNamen[
            spieler?.stats?.class
        ] ||
        "UNBEKANNT";

    const level =
        spieler?.stats?.lvl ??
        "UNBEKANNT";

    /* Ende normale Scanwerte */


    /* -----------------------------------
    Eierbestand berechnen
    ----------------------------------- */

    const eier =
        spieler?.items?.eggs ||
        {};

    const eierBestand =
        Object.values(
            eier
        ).reduce(
            function (summe, anzahl) {

                return (
                    summe +
                    (
                        Number(anzahl) ||
                        0
                    )
                );

            },
            0
        );

    /* Ende Eierbestand */


    /* -----------------------------------
    Zufällige unnütze Prüfzeile
    ----------------------------------- */

    const vorhandenText =
        function (wert) {

            return wert === true
                ? "VORHANDEN"
                : "NICHT VORHANDEN";

        };


    const zufallsPruefungen = [

        "VERROTTETES FLEISCH: " +
            (
                spieler?.items?.food
                    ?.RottenMeat ??
                0
            ),

        "MILCHVORRAT: " +
            (
                spieler?.items?.food
                    ?.Milk ??
                0
            ),

        "HONIGVORRAT: " +
            (
                spieler?.items?.food
                    ?.Honey ??
                0
            ),

        "EIERBESTAND: " +
            eierBestand,

        "ZOMBIE-SCHLÜPFELIXIERE: " +
            (
                spieler?.items
                    ?.hatchingPotions
                    ?.Zombie ??
                0
            ),

        "BLAUE ZUCKERWATTE-SCHLÜPFELIXIERE: " +
            (
                spieler?.items
                    ?.hatchingPotions
                    ?.CottonCandyBlue ??
                0
            ),

        "GOLDENE SCHLÜPFELIXIERE: " +
            (
                spieler?.items
                    ?.hatchingPotions
                    ?.Golden ??
                0
            ),

        "RESILIENZ-ORDEN: " +
            vorhandenText(
                window.eigeneOrden
                    ?.resilienz
            ),

        "MEGA-ORDEN: " +
            vorhandenText(
                window.eigeneOrden
                    ?.mega
            ),

        "STEIGERUNGS-ORDEN: " +
            vorhandenText(
                window.eigeneOrden
                    ?.steigerung
            ),

        "RATEFUCHS-ORDEN: " +
            vorhandenText(
                window.eigeneOrden
                    ?.ratefuchs
            )

    ];


    const zufallsPruefung =
        zufallsPruefungen[
            Math.floor(
                Math.random() *
                zufallsPruefungen.length
            )
        ];

    /* Ende zufällige unnütze Prüfzeile */


    /* -----------------------------------
    Scan zusammensetzen
    ----------------------------------- */

    scanZeilen = [
        pruefungsBegriff + " LÄUFT ...",
        "",
        "NAME: " +
            spielerName +
            " ❌",

        "HABITICA-GEBURTSTAG: " +
            geburtstag +
            " ❌",

        "KLASSE: " +
            klasse +
            " ❌",

        "LEVEL: " +
            level +
            " ❌",

        zufallsPruefung +
            " ❌",

        "",
        "MITGLIED DER GEWOHNHEITSTIERE        ✅"
    ];

    /* Ende Scan zusammensetzen */

}


    /* -----------------------------------
    Text-Canvas in Dialog einsetzen
    ----------------------------------- */

    dialogZoomEbene.appendChild(
        scanText
    );


    /* -----------------------------------
    Roboter-Schreibgeräusch vorbereiten
    ----------------------------------- */
let schreibSound = null;

    /* -----------------------------------
    Bisher geschriebenen Text zeichnen
    ----------------------------------- */

    function scanTextZeichnen(
        fertigeZeilen,
        aktuelleZeile
    ) {

        scanContext.clearRect(
            0,
            0,
            scanText.width,
            scanText.height
        );

        fertigeZeilen.forEach(
            function (zeile, index) {

                scanContext.fillText(
                    zeile,
                    10,
                    10 + index * 55
                );

            }
        );

        if (aktuelleZeile !== null) {

            scanContext.fillText(
                aktuelleZeile,
                10,
                10 + fertigeZeilen.length * 55
            );

        }

    } /* Ende scanTextZeichnen */

    /* =========================================================
    ANGRIFF BEENDET – FLUCHT ANBIETEN
    ========================================================= */

    function angriffFluchtAnzeigen() {

        /* -----------------------------------
        Flucht-Antwort anzeigen
        ----------------------------------- */

        const rausCanvas =
            document.createElement(
                "canvas"
            );

        rausCanvas.id =
            "reservatNpcDialogAntworten";

        rausCanvas.width = 700;
        rausCanvas.height = 500;

        const rausContext =
            rausCanvas.getContext(
                "2d"
            );

        rausContext.font =
            "bold 32px sans-serif";

        rausContext.textAlign =
            "left";

        rausContext.fillStyle =
            "#2b2118";

        rausContext.fillText(
            "Raus hier!",
            20,
            65
        );

        dialogZoomEbene.appendChild(
            rausCanvas
        );


        /* -----------------------------------
        Weiter-Pfeil erzeugen
        ----------------------------------- */

        const rausWeiterPfeil =
            document.createElement(
                "img"
            );

        rausWeiterPfeil.id =
            "reservatNpcDialogWeiter";

        rausWeiterPfeil.src =
            "Daten/NPCs/" +
            "dialog_weiter_pfeil_medaillon.png";

        rausWeiterPfeil.alt =
            "Weiter";

        rausWeiterPfeil.classList.add(
            "aktiv"
        );

        dialogZoomEbene.appendChild(
            rausWeiterPfeil
        );


        /* -----------------------------------
        Rauswurf aus der Bücherei
        ----------------------------------- */

        rausWeiterPfeil.addEventListener(
            "click",
            async function (ereignis) {

                ereignis.stopPropagation();


                /* Alarm stoppen */

                if (alarmSound) {

                    alarmSound.pause();
                    alarmSound.currentTime = 0;

                }


                /* Schreibsound stoppen */

window.reservatSoundStoppen(
    schreibSound
);

schreibSound = null;


                /* Dialog schließen */

                dialog.remove();


                /* Vor die Bücherei setzen */

                await window.ortswechselAusfuehren(
                    {
                        zielKarte:
                            "buecherei",

                        zielPosition:
                            [5, 3]
                    }
                );


                /* Bewegung freigeben */

                window.reservatBedienungGesperrt =
                    false;

            }
        );

    } /* Ende angriffFluchtAnzeigen */
    /* -----------------------------------
    Text buchstabenweise schreiben
    ----------------------------------- */

    async function scanTextSchreiben() {

        const fertigeZeilen = [];

 schreibSound =
    window.reservatSoundAbspielen(
        "Daten/NPCs/Bibliotheksroboter/" +
        "roboter_nadeldrucker_antwort_10s.wav",
        0.35,
        true
    );


        for (
            const kompletteZeile
            of scanZeilen
        ) {

            /* Leerzeile */

            if (kompletteZeile === "") {

                fertigeZeilen.push("");

                scanTextZeichnen(
                    fertigeZeilen,
                    null
                );

                await new Promise(
                    function (fertig) {
                        setTimeout(
                            fertig,
                            180
                        );
                    }
                );

                continue;
            }


            /* Zeile Zeichen für Zeichen */

            let sichtbarerText = "";

            for (
                const zeichen
                of kompletteZeile
            ) {

                sichtbarerText +=
                    zeichen;

                scanTextZeichnen(
                    fertigeZeilen,
                    sichtbarerText
                );

                await new Promise(
                    function (fertig) {
                        setTimeout(
                            fertig,
                            28
                        );
                    }
                );

            }


            /* Fertige Zeile übernehmen */

            fertigeZeilen.push(
                kompletteZeile
            );

            scanTextZeichnen(
                fertigeZeilen,
                null
            );
            /* -----------------------------------
            Erfolgsgeräusch bei bestandener Prüfung
            ----------------------------------- */

            if (
                gespraechsStart === "normal" &&
                kompletteZeile.includes(
                    "MITGLIED DER GEWOHNHEITSTIERE"
                )
            ) {
                /* Scan beendet:
                   Bewegung wieder freigeben */

                window.reservatBedienungGesperrt =
                    false;

                /* Ende Bewegung freigeben */
				                /* Scan beendet:
                   normale Roboteransicht */

                roboter.src =
                    "Daten/NPCs/Bibliotheksroboter/" +
                    "NPC_Hilfsrobo_04.png";

                /* Ende normale Roboteransicht */


window.reservatSoundStoppen(
    schreibSound
);

schreibSound = null;

window.reservatSoundAbspielen(
    "Daten/NPCs/Bibliotheksroboter/" +
    "eintritt_bestaetigung_fairytale_weich_2s.wav",
    0.5,
    false
);
/* -----------------------------------
Erste Gesprächsantwort nach dem Scan
----------------------------------- */

const frageCanvas =
    document.createElement(
        "canvas"
    );

frageCanvas.id =
    "reservatNpcDialogAntworten";

frageCanvas.width = 700;
frageCanvas.height = 500;

const frageContext =
    frageCanvas.getContext(
        "2d"
    );

frageContext.font =
    "bold 32px sans-serif";

frageContext.textAlign =
    "left";

frageContext.fillStyle =
    "#2b2118";

frageContext.fillText(
    "Was geht denn hier ab?",
    20,
    65
);

if (ausgabe24Gezeigt) {

    frageContext.fillText(
        "Ich würde gerne die Ausgabe 24",
        20,
        133
    );

    frageContext.fillText(
        "noch einmal lesen.",
        20,
        167
    );

} else {

    frageContext.fillText(
        "OMG!! WTF?",
        20,
        150
    );

}

frageContext.fillText(
    "Bist du der Bibliothekar?",
    20,
    235
);

dialogZoomEbene.appendChild(
    frageCanvas
);
/* -----------------------------------
Gesprächsantwort auswählen
----------------------------------- */

let gewaehlteAntwort = null;


/* -----------------------------------
Weiter-Pfeil erzeugen
----------------------------------- */

const frageWeiterPfeil =
    document.createElement(
        "img"
    );

frageWeiterPfeil.id =
    "reservatNpcDialogWeiter";

frageWeiterPfeil.src =
    "Daten/NPCs/" +
    "dialog_weiter_pfeil_medaillon.png";

frageWeiterPfeil.alt =
    "Weiter";

dialogZoomEbene.appendChild(
    frageWeiterPfeil
);


/* -----------------------------------
Antworten neu zeichnen
----------------------------------- */

function antwortenZeichnen() {

    frageContext.clearRect(
        0,
        0,
        frageCanvas.width,
        frageCanvas.height
    );

const antworten = [
    ["Was geht denn hier ab?"],
    ausgabe24Gezeigt
        ? [
            "Ich würde gerne die Ausgabe 24",
            "noch einmal lesen."
        ]
        : [
            "OMG!! WTF?"
        ],
    ["Bist du der Bibliothekar?"]
];

    const positionen = [
        65,
        150,
        235
    ];

    antworten.forEach(
        function (antwort, index) {

            /*
            Gewählte Antwort markieren
            */

if (
    gewaehlteAntwort ===
    index + 1
) {

    /* Gewählte Antwort:
       grünes Leuchten wie bei Traudel */

    frageContext.fillStyle =
        "#2b2118";

    frageContext.shadowColor =
        "#63ff63";

    frageContext.shadowBlur =
        12;

} else {

    /* Nicht gewählte Antworten */

    frageContext.fillStyle =
        "#2b2118";

    frageContext.shadowColor =
        "transparent";

    frageContext.shadowBlur =
        0;

}

 antwort.forEach(
    function (zeile, zeilenIndex) {

        const y =
            positionen[index] +
            (
                antwort.length === 2
                    ? -17
                    : 0
            ) +
            zeilenIndex * 34;

        frageContext.fillText(
            zeile,
            20,
            y
        );

    }
);
/* Leuchteffekt für nächste Antwort zurücksetzen */

frageContext.shadowColor =
    "transparent";

frageContext.shadowBlur =
    0;
        }
    );


    /* -----------------------------------
    Weiter-Pfeil neben gewählter Antwort
    positionieren
    ----------------------------------- */

    if (gewaehlteAntwort !== null) {

        frageWeiterPfeil.style.right =
            "auto";

        frageWeiterPfeil.style.bottom =
            "auto";

        frageWeiterPfeil.style.left =
            "60%";

        const antwortY =
            65 +
            (gewaehlteAntwort - 1) * 8;

        frageWeiterPfeil.style.top =
            antwortY +
            "%";

    }

    /* Ende Weiter-Pfeil positionieren */


} /* Ende antwortenZeichnen */


/* -----------------------------------
Antwort anklicken
----------------------------------- */

frageCanvas.addEventListener(
    "click",
    function (ereignis) {

        ereignis.stopPropagation();

        const rechteck =
            frageCanvas.getBoundingClientRect();

        const mausY =
            (ereignis.clientY - rechteck.top) *
            (
                frageCanvas.height /
                rechteck.height
            );


        if (
            mausY >= 25 &&
            mausY < 110
        ) {

            gewaehlteAntwort = 1;

        } else if (
            mausY >= 110 &&
            mausY < 195
        ) {

            gewaehlteAntwort = 2;

        } else if (
            mausY >= 195 &&
            mausY < 280
        ) {

            gewaehlteAntwort = 3;

        } else {

            return;

        }


        /* Auswahl anzeigen */

        antwortenZeichnen();


        /* Weiter aktivieren */

        frageWeiterPfeil.classList.add(
            "aktiv"
        );

    }
);


/* -----------------------------------
Weiter mit gewählter Antwort
----------------------------------- */

frageWeiterPfeil.addEventListener(
    "click",
    async function (ereignis) {

        ereignis.stopPropagation();

        if (!gewaehlteAntwort) {
            return;
        }


        /* -----------------------------------
        Antwort 1:
        Was geht denn hier ab?
        ----------------------------------- */

        if (gewaehlteAntwort === 1) {

            /* Alten Scantext entfernen */

            scanContext.clearRect(
                0,
                0,
                scanText.width,
                scanText.height
            );


            /* Roboterantwort anzeigen */

            scanContext.fillText(
                "ZUGRIFF VERWEIGERT.",
                10,
                10
            );


            /*
            Die drei Spielerantworten bleiben
            absichtlich vollständig erhalten.
            */

            return;

        }

        /* Ende Antwort 1 */
               /* -----------------------------------
        Antwort 2:
        Ausgabe 24 erneut lesen
        oder OMG!! WTF?
        ----------------------------------- */

        if (gewaehlteAntwort === 2) {

            /* -----------------------------------
            Ausgabe 24 ist bereits bekannt
            ----------------------------------- */

            if (ausgabe24Gezeigt) {

                /* Spielerantworten entfernen */

                frageCanvas.remove();
                frageWeiterPfeil.remove();


                /* Alten Robotertext entfernen */

scanContext.clearRect(
    0,
    0,
    scanText.width,
    scanText.height
);


/* Bewegung während Roboterantwort sperren */

window.reservatBedienungGesperrt =
    true;


/* Wiederholungs-Kommentar vorbereiten */

scanZeilen = [
    "WILD AM SONNTAG – AUSGABE 24.",
    "",
    "ERNEUTE LEKTÜRE?",
    "",
    "UNGEWÖHNLICH.",
    "",
    "ABER ZULÄSSIG."
];


/* Kommentar schreiben */

await scanTextSchreiben();


/* Ausgabe 24 präsentieren */

roboter.src =
    "Daten/NPCs/Bibliotheksroboter/" +
    "Hilfsrobo_08_Ausgabe24.png";

                roboter.classList.add(
                    "reservatNpcDialogRoboterWaS24"
                );

/* -----------------------------------
Auswahl nach Präsentation der Zeitung
----------------------------------- */

let zeitungAuswahl =
    null;

const zeitungCanvas =
    document.createElement(
        "canvas"
    );

zeitungCanvas.id =
    "reservatNpcDialogAntworten";

zeitungCanvas.width = 700;
zeitungCanvas.height = 500;

const zeitungContext =
    zeitungCanvas.getContext(
        "2d"
    );


/* -----------------------------------
Antworten zeichnen
----------------------------------- */

function zeitungAntwortenZeichnen() {

    zeitungContext.clearRect(
        0,
        0,
        zeitungCanvas.width,
        zeitungCanvas.height
    );

    zeitungContext.font =
        "bold 32px sans-serif";

    zeitungContext.textAlign =
        "left";

    const antworten = [
        "Zeitung nehmen und lesen.",
        "Lieber doch nicht."
    ];

    const positionen = [
        65,
        150
    ];

    antworten.forEach(
        function (antwort, index) {

            if (zeitungAuswahl === index) {

                zeitungContext.fillStyle =
                    "#2b2118";

                zeitungContext.shadowColor =
                    "rgba(0, 255, 80, 1)";

                zeitungContext.shadowBlur =
                    18;

            } else {

                zeitungContext.fillStyle =
                    "#8a847a";

                zeitungContext.shadowColor =
                    "transparent";

                zeitungContext.shadowBlur =
                    0;

            }

            zeitungContext.fillText(
                antwort,
                20,
                positionen[index]
            );

        }
    );

    zeitungContext.shadowBlur =
        0;

}

/* Ende Antworten zeichnen */


zeitungAntwortenZeichnen();

dialogZoomEbene.appendChild(
    zeitungCanvas
);


/* -----------------------------------
Weiter-Pfeil erzeugen
----------------------------------- */

const zeitungWeiterPfeil =
    document.createElement(
        "img"
    );

zeitungWeiterPfeil.id =
    "reservatNpcDialogWeiter";

zeitungWeiterPfeil.src =
    "Daten/NPCs/" +
    "dialog_weiter_pfeil_medaillon.png";

zeitungWeiterPfeil.alt =
    "Weiter";

dialogZoomEbene.appendChild(
    zeitungWeiterPfeil
);


/* -----------------------------------
Antwort auswählen
----------------------------------- */

zeitungCanvas.addEventListener(
    "click",
    function (ereignis) {

        const rect =
            zeitungCanvas.getBoundingClientRect();

        const y =
            (
                ereignis.clientY -
                rect.top
            ) *
            (
                zeitungCanvas.height /
                rect.height
            );


        if (
            y >= 25 &&
            y < 110
        ) {

            zeitungAuswahl = 0;

        } else if (
            y >= 110 &&
            y < 195
        ) {

            zeitungAuswahl = 1;

        } else {

            return;

        }


        zeitungAntwortenZeichnen();

        zeitungWeiterPfeil.classList.add(
            "aktiv"
        );

    }
);

/* Ende Antwort auswählen */


/* -----------------------------------
Auswahl bestätigen
----------------------------------- */

zeitungWeiterPfeil.addEventListener(
    "click",
    function (ereignis) {

        ereignis.stopPropagation();

        if (zeitungAuswahl === null) {
            return;
        }


        /* Zeitung lesen */

        if (zeitungAuswahl === 0) {

            window.bibliotheksroboterAusgabe24Oeffnen();

            return;

        }


        /* Lieber doch nicht */

        if (zeitungAuswahl === 1) {

            dialog.remove();

            window.reservatBedienungGesperrt =
                false;

            return;

        }

    }
);

/* Ende Auswahl bestätigen */
/* Ende Auswahl nach Präsentation */
                /* Bewegung freigeben */

                window.reservatBedienungGesperrt =
                    false;

                return;

            }

            /* Ende Ausgabe 24 erneut lesen */


            /* -----------------------------------
            Ausgabe 24 noch nicht bekannt:
            bisheriger OMG-WTF-Angriff
            ----------------------------------- */

            window.reservatBedienungGesperrt =
                true;


            /* Spielerantworten entfernen */

            frageCanvas.remove();
            frageWeiterPfeil.remove();


            /* Angriffsgrafik anzeigen */

            roboter.src =
                "Daten/NPCs/Bibliotheksroboter/" +
                "NPC_Hilfsrobo_06_Angriff.png";


            /* Alarm starten */

            alarmSound =
                window.reservatSoundAbspielen(
                    "Daten/NPCs/Bibliotheksroboter/" +
                    "roboter_alarm_anschwellen_abbruch_10s.wav",
                    0.5,
                    false
                );


            /* Angriffstext vorbereiten */

            scanZeilen = [
                "WARNUNG.",
                "",
                "FEHLERHAFTE BESUCHERKLASSIFIZIERUNG.",
                "",
                "OBJEKT ERKANNT ALS:",
                "BEDROHUNG.",
                "",
                "VERTEIDIGUNGSPROTOKOLL AKTIVIERT."
            ];


            /* Angriffstext vollständig schreiben */

            await scanTextSchreiben();


            /* Flucht nach Angriff anbieten */

            angriffFluchtAnzeigen();

            return;

        }

        /* Ende Antwort 2 */
        /* -----------------------------------
        Antwort 3:
        Bist du der Bibliothekar?
        ----------------------------------- */

        if (gewaehlteAntwort === 3) {
            /* Bewegung während Roboterantwort sperren */

            window.reservatBedienungGesperrt =
                true;

            /* Ende Bewegungssperre */
            /* Spielerantworten entfernen */

            frageCanvas.remove();
            frageWeiterPfeil.remove();


            /* Roboterantwort vorbereiten */

            scanZeilen = [
                "NEGATIV.",
                "",
                "BIBLIOTHEKARISCHE FACHKRAFT",
                "DERZEIT NICHT VERFÜGBAR.",
                "",
                "VERTRETUNGSMODUS AKTIV.",
                "",
                "SUCHEN SIE LEKTÜRE?"
            ];


            /* Roboterantwort schreiben */

            await scanTextSchreiben();
            /* Bewegung wieder freigeben */

            window.reservatBedienungGesperrt =
                false;

            /* Ende Bewegung freigeben */
            /* -----------------------------------
            Spielerantwort:
            Eigentlich schon.
            ----------------------------------- */

            const lektuereCanvas =
                document.createElement(
                    "canvas"
                );

            lektuereCanvas.id =
                "reservatNpcDialogAntworten";

            lektuereCanvas.width = 700;
            lektuereCanvas.height = 500;

            const lektuereContext =
                lektuereCanvas.getContext(
                    "2d"
                );

            lektuereContext.font =
                "bold 32px sans-serif";

            lektuereContext.textAlign =
                "left";

            lektuereContext.fillStyle =
                "#2b2118";

            lektuereContext.fillText(
                "Eigentlich schon.",
                20,
                65
            );

            dialogZoomEbene.appendChild(
                lektuereCanvas
            );


            /* -----------------------------------
            Weiter-Pfeil erzeugen
            ----------------------------------- */

            const lektuereWeiterPfeil =
                document.createElement(
                    "img"
                );

            lektuereWeiterPfeil.id =
                "reservatNpcDialogWeiter";

            lektuereWeiterPfeil.src =
                "Daten/NPCs/" +
                "dialog_weiter_pfeil_medaillon.png";

            lektuereWeiterPfeil.alt =
                "Weiter";

            lektuereWeiterPfeil.classList.add(
                "aktiv"
            );

            dialogZoomEbene.appendChild(
                lektuereWeiterPfeil
            );
            /* -----------------------------------
            Eigentlich schon -> Empfehlung
            ----------------------------------- */

            lektuereWeiterPfeil.addEventListener(
                "click",
                async function (ereignis) {

                    ereignis.stopPropagation();


                    /* Spielerantwort entfernen */

                    lektuereCanvas.remove();
                    lektuereWeiterPfeil.remove();


                    /* Bewegung während Antwort sperren */

                    window.reservatBedienungGesperrt =
                        true;


                    /* Empfehlung vorbereiten */

                    scanZeilen = [
                        "EMPFEHLUNG:",
                        "",
                        "WILD AM SONNTAG – AUSGABE 24.",
                        "",
                        "AKTUALITÄT: FRAGWÜRDIG.",
                        "UNTERHALTUNGSWERT: HINREICHEND."
                    ];


                    /* Empfehlung schreiben */

                    await scanTextSchreiben();
                    /* -----------------------------------
                    WaS24-Cover anzeigen
                    ----------------------------------- */

/* -----------------------------------
Roboter präsentiert Ausgabe 24
----------------------------------- */

roboter.src =
    "Daten/NPCs/Bibliotheksroboter/" +
    "Hilfsrobo_08_Ausgabe24.png";

roboter.classList.add(
    "reservatNpcDialogRoboterWaS24"
);

/* Ende Roboter präsentiert Ausgabe 24 */
/* -----------------------------------
Im Robo-Gedächtnis merken:
Ausgabe 24 wurde diesem Spieler gezeigt
----------------------------------- */

const roboFirebaseUser =
    window.firebaseAuth?.currentUser;

if (roboFirebaseUser) {

    try {

        const roboGedaechtnisRef =
            window.firebaseRef(
                window.firebaseDatabase,
                "npcGedachtnis/" +
                "bibliotheksroboter/" +
                roboFirebaseUser.uid
            );

        await window.firebaseSet(
            roboGedaechtnisRef,
            {
                ausgabe24Gezeigt: true
            }
        );

        console.log(
            "Bibliotheksroboter: Ausgabe 24 im Gedächtnis gespeichert."
        );

    } catch (fehler) {

        console.error(
            "Bibliotheksroboter: Gedächtnis konnte nicht gespeichert werden.",
            fehler
        );

    }

}

/* Ende Robo-Gedächtnis speichern */
/* -----------------------------------
Auswahl nach Präsentation der Zeitung
----------------------------------- */

let zeitungAuswahl =
    null;

const zeitungCanvas =
    document.createElement(
        "canvas"
    );

zeitungCanvas.id =
    "reservatNpcDialogAntworten";

zeitungCanvas.width = 700;
zeitungCanvas.height = 500;

const zeitungContext =
    zeitungCanvas.getContext(
        "2d"
    );


/* -----------------------------------
Antworten zeichnen
----------------------------------- */

function zeitungAntwortenZeichnen() {

    zeitungContext.clearRect(
        0,
        0,
        zeitungCanvas.width,
        zeitungCanvas.height
    );

    zeitungContext.font =
        "bold 32px sans-serif";

    zeitungContext.textAlign =
        "left";

    const antworten = [
        "Zeitung nehmen und lesen.",
        "Lieber doch nicht."
    ];

    const positionen = [
        65,
        150
    ];

    antworten.forEach(
        function (antwort, index) {

            if (zeitungAuswahl === index) {

                zeitungContext.fillStyle =
                    "#2b2118";

                zeitungContext.shadowColor =
                    "rgba(0, 255, 80, 1)";

                zeitungContext.shadowBlur =
                    18;

            } else {

                zeitungContext.fillStyle =
                    "#8a847a";

                zeitungContext.shadowColor =
                    "transparent";

                zeitungContext.shadowBlur =
                    0;

            }

            zeitungContext.fillText(
                antwort,
                20,
                positionen[index]
            );

        }
    );

    zeitungContext.shadowBlur =
        0;

}

/* Ende Antworten zeichnen */


zeitungAntwortenZeichnen();

dialogZoomEbene.appendChild(
    zeitungCanvas
);


/* -----------------------------------
Weiter-Pfeil erzeugen
----------------------------------- */

const zeitungWeiterPfeil =
    document.createElement(
        "img"
    );

zeitungWeiterPfeil.id =
    "reservatNpcDialogWeiter";

zeitungWeiterPfeil.src =
    "Daten/NPCs/" +
    "dialog_weiter_pfeil_medaillon.png";

zeitungWeiterPfeil.alt =
    "Weiter";

dialogZoomEbene.appendChild(
    zeitungWeiterPfeil
);


/* -----------------------------------
Antwort auswählen
----------------------------------- */

zeitungCanvas.addEventListener(
    "click",
    function (ereignis) {

        const rect =
            zeitungCanvas.getBoundingClientRect();

        const y =
            (
                ereignis.clientY -
                rect.top
            ) *
            (
                zeitungCanvas.height /
                rect.height
            );


        if (
            y >= 25 &&
            y < 110
        ) {

            zeitungAuswahl = 0;

        } else if (
            y >= 110 &&
            y < 195
        ) {

            zeitungAuswahl = 1;

        } else {

            return;

        }


        zeitungAntwortenZeichnen();

        zeitungWeiterPfeil.classList.add(
            "aktiv"
        );

    }
);

/* Ende Antwort auswählen */


/* -----------------------------------
Auswahl bestätigen
----------------------------------- */

zeitungWeiterPfeil.addEventListener(
    "click",
    function (ereignis) {

        ereignis.stopPropagation();

        if (zeitungAuswahl === null) {
            return;
        }


        /* Zeitung lesen */

        if (zeitungAuswahl === 0) {

            window.bibliotheksroboterAusgabe24Oeffnen();

            return;

        }


        /* Lieber doch nicht */

        if (zeitungAuswahl === 1) {

            dialog.remove();

            window.reservatBedienungGesperrt =
                false;

            return;

        }

    }
);

/* Ende Auswahl bestätigen */
/* Ende Auswahl nach Präsentation */

                    /* Bewegung wieder freigeben */

                    window.reservatBedienungGesperrt =
                        false;

                }
            );

            /* Ende Eigentlich schon -> Empfehlung */
            /* Ende Spielerantwort */
            return;

        }

        /* Ende Antwort 3 */
        console.log(
            "Antwort " +
            gewaehlteAntwort +
            " gewählt"
        );

    }
);

/* Ende Gesprächsantwort auswählen */
/* Ende erste Gesprächsantwort */
            }

            /* Ende Erfolgsgeräusch */

            /* Kleine Pause zwischen Zeilen */

            await new Promise(
                function (fertig) {
                    setTimeout(
                        fertig,
                        160
                    );
                }
            );

        }


        /* Schreibgeräusch beenden */

window.reservatSoundStoppen(
    schreibSound
);

schreibSound = null;
		        /* -----------------------------------
        Direkter Angriffsstart:
        Flucht anbieten
        ----------------------------------- */

        if (gespraechsStart === "angriff") {

            angriffFluchtAnzeigen();

        }

        /* Ende direkter Angriffsstart */
        /* -----------------------------------
        Update vollständig beendet
        Spielerantwort anzeigen
        ----------------------------------- */

        if (gespraechsStart === "update") {

            window.reservatBedienungGesperrt =
                false;


            /* Spielerantwort erzeugen */

            const updateAntwortCanvas =
                document.createElement(
                    "canvas"
                );

            updateAntwortCanvas.id =
                "reservatNpcDialogAntworten";

            updateAntwortCanvas.width =
                700;

            updateAntwortCanvas.height =
                500;


            const updateAntwortContext =
                updateAntwortCanvas.getContext(
                    "2d"
                );

            updateAntwortContext.font =
                "bold 32px sans-serif";

            updateAntwortContext.textAlign =
                "left";

            updateAntwortContext.fillStyle =
                "#2b2118";

            updateAntwortContext.fillText(
                "Okay, ich komme später wieder.",
                20,
                65
            );


            dialogZoomEbene.appendChild(
                updateAntwortCanvas
            );


            /* -----------------------------------
            Weiter-Pfeil erzeugen
            ----------------------------------- */

            const updateWeiterPfeil =
                document.createElement(
                    "img"
                );

            updateWeiterPfeil.id =
                "reservatNpcDialogWeiter";

            updateWeiterPfeil.src =
                "Daten/NPCs/" +
                "dialog_weiter_pfeil_medaillon.png";

            updateWeiterPfeil.alt =
                "Weiter";

            updateWeiterPfeil.classList.add(
                "aktiv"
            );

            dialogZoomEbene.appendChild(
                updateWeiterPfeil
            );


            /* -----------------------------------
            Antwort bestätigen
            ----------------------------------- */

            updateWeiterPfeil.addEventListener(
                "click",
                function (ereignis) {

                    ereignis.stopPropagation();

                    updateAntwortCanvas.remove();
                    updateWeiterPfeil.remove();

                    dialog.remove();

                    window.reservatBedienungGesperrt =
                        false;

                }
            );

            /* Ende Antwort bestätigen */

        }

        /* Ende Update-Spielerantwort */
    } /* Ende scanTextSchreiben */


    /* -----------------------------------
    Schreibvorgang starten
    ----------------------------------- */
    /* Scan wird beim normalen Gespräch
       erst nach "HALLO?" gestartet. */

if (gespraechsStart !== "normal") {

    /* Update während Textausgabe sperren */

    if (gespraechsStart === "update") {

        window.reservatBedienungGesperrt =
            true;

    }

    scanTextSchreiben();

}
    /* =========================================================
    NORMALER START – SPIELER UNTERBRICHT DEN LESENDEN ROBOTER
    ========================================================= */

    if (gespraechsStart === "normal") {

        const halloCanvas =
            document.createElement(
                "canvas"
            );

        halloCanvas.id =
            "reservatNpcDialogAntworten";

        halloCanvas.width = 700;
        halloCanvas.height = 500;

        const halloContext =
            halloCanvas.getContext(
                "2d"
            );

        halloContext.font =
            "bold 32px sans-serif";

        halloContext.textAlign =
            "left";

        halloContext.fillStyle =
            "#2b2118";

        halloContext.fillText(
            "Ähm... Hallo?",
            20,
            65
        );

        dialogZoomEbene.appendChild(
            halloCanvas
        );
		/* -----------------------------------
Weiter-Pfeil für HALLO?
----------------------------------- */

const halloWeiterPfeil =
    document.createElement("img");

halloWeiterPfeil.id =
    "reservatNpcDialogWeiter";

halloWeiterPfeil.src =
    "Daten/NPCs/" +
    "dialog_weiter_pfeil_medaillon.png";

halloWeiterPfeil.alt =
    "Weiter";

/* Es gibt nur eine Antwort:
   HALLO? ist automatisch ausgewählt. */

halloWeiterPfeil.classList.add(
    "aktiv"
);

dialogZoomEbene.appendChild(
    halloWeiterPfeil
);

/* Ende Weiter-Pfeil für HALLO? */
        /* -----------------------------------
        Klick auf "HALLO?" startet den Scan
        ----------------------------------- */

halloWeiterPfeil.addEventListener(
    "click",
     function (ereignis) {

        ereignis.stopPropagation();

        /* Spielerantwort und Weiter-Pfeil entfernen */

        halloCanvas.remove();
        halloWeiterPfeil.remove();
        /* Bewegung während des Scans sperren */

        window.reservatBedienungGesperrt =
            true;

        /* Ende Bewegungssperre */

        /* Roboter beginnt mit dem Scan */

        roboter.src =
            "Daten/NPCs/Bibliotheksroboter/" +
            "NPC_Hilfsrobo_05_Scan.png";

        scanTextSchreiben();

    }
);

        /* Ende Klick auf "HALLO?" */
    }

    /* Ende normaler Start */
    /* Ende Zugangsprüfung anzeigen */
    /* -----------------------------------
    Dialog schließen
    ----------------------------------- */

    const beendenX =
        document.createElement(
            "img"
        );

    beendenX.id =
        "reservatNpcDialogBeenden";

    beendenX.src =
        "Daten/NPCs/dialog_beenden_X.png";

    beendenX.alt =
        "Dialog beenden";

    beendenX.addEventListener(
        "click",
        function (ereignis) {

            ereignis.stopPropagation();

            /* Angriffsalarm gegebenenfalls stoppen */

            if (alarmSound) {

                alarmSound.pause();
                alarmSound.currentTime = 0;

            }

            /* Schreibgeräusch ebenfalls stoppen */

window.reservatSoundStoppen(
    schreibSound
);

schreibSound = null;
            /* Bewegung wieder freigeben */

            window.reservatBedienungGesperrt =
                false;

            /* Ende Bewegung freigeben */
            dialog.remove();

        }
    );

    dialogZoomEbene.appendChild(
        beendenX
    );

    /* Ende Dialog schließen */


    /* -----------------------------------
    Dialog einsetzen
    ----------------------------------- */

    spielfeld.appendChild(
        dialog
    );


    /* -----------------------------------
    Vorhandenen Dialog-Zoom aktivieren
    ----------------------------------- */

    window.npcDialogZoomInitialisieren(
        dialog,
        dialogZoomEbene
    );

    /* Ende Dialog-Zoom aktivieren */

}; /* Ende bibliotheksroboterDialogAnzeigen */

/* Ende Bibliotheksroboter - Dialog anzeigen */

/* Ende Bibliotheksroboter */
/* =========================================================
BIBLIOTHEKSROBOTER – SPIELERDATEN TESTEN
========================================================= */

window.bibliotheksroboterSpielerdatenTesten =
async function () {

    /* -----------------------------------
    Angemeldeten Firebase-Spieler holen
    ----------------------------------- */

    const firebaseUser =
        window.firebaseAuth?.currentUser;

    if (!firebaseUser) {

        console.error(
            "Bibliotheksroboter: Kein Firebase-Spieler angemeldet."
        );

        return;
    }


    /* -----------------------------------
    Habitica-ID aus Firebase holen
    ----------------------------------- */

    const userRef =
        window.firebaseRef(
            window.firebaseDatabase,
            "users/" + firebaseUser.uid
        );

    const userSnapshot =
        await window.firebaseGet(
            userRef
        );

    if (!userSnapshot.exists()) {

        console.error(
            "Bibliotheksroboter: Reservats-Spieler nicht gefunden."
        );

        return;
    }


    const userDaten =
        userSnapshot.val();

    if (!userDaten.habiticaId) {

        console.error(
            "Bibliotheksroboter: Habitica-ID fehlt."
        );

        return;
    }


    /* -----------------------------------
    Spieler im Schnappschuss suchen
    ----------------------------------- */

    const spieler =
        window.reservatSpielerSuchen(
            window.reservatSchnappschuss,
            userDaten.habiticaId
        );

    if (!spieler) {

        console.error(
            "Bibliotheksroboter: Spieler nicht im Schnappschuss gefunden."
        );

        return;
    }


    /* -----------------------------------
    Habitica-Geburtstag vorbereiten
    ----------------------------------- */

    const erstellt =
        spieler.auth?.timestamps?.created;

    let geburtstag =
        "UNBEKANNT";

    if (erstellt) {

        const datum =
            new Date(erstellt);

        geburtstag =
            datum.toLocaleDateString(
                "de-DE"
            );
    }


    /* -----------------------------------
    Scanwerte ausgeben
    ----------------------------------- */

    console.log(
        "=== BIBLIOTHEKSROBOTER SCAN ==="
    );

    console.log(
        "Name:",
        spieler.profile?.name
    );

    console.log(
        "Habitica-Geburtstag:",
        geburtstag
    );

    console.log(
        "Klasse:",
        spieler.stats?.class
    );

    console.log(
        "Level:",
        spieler.stats?.lvl
    );

    console.log(
        "Verrottetes Fleisch:",
        spieler.items?.food?.RottenMeat ?? 0
    );

    console.log(
        "=== SCAN ENDE ==="
    );

}; /* Ende bibliotheksroboterSpielerdatenTesten */
