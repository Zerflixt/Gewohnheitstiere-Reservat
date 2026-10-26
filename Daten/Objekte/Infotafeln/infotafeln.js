/*========================================*/
/* RESERVAT – INFORMATIONSOBJEKTE          */
/* Wegweiser, Infotafeln und Aushänge      */
/*========================================*/

(function () {
    "use strict";

    /*------------------------------------*/
    /* Versionsinformation                */
    /*------------------------------------*/

    window.infotafelnVersion = "0.1";

    /*------------------------------------*/
    /* Initialisierung                    */
    /*------------------------------------*/

    window.infotafelnBereit = true;



    /* Ende Initialisierung */
/* =========================================================
INFORMATIONSFENSTER ANZEIGEN
========================================================= */

window.infotafelAnzeigen =
function (sonderfeld) {
    /* -----------------------------------
       Memory-Ruhmestafel erkennen
       ----------------------------------- */

    if (sonderfeld.infoId === "memory_rangliste") {

        window.memoryRuhmestafelAnzeigen(sonderfeld);
        return;

    }

    /* Ende Memory-Ruhmestafel erkennen */
    /* -----------------------------------
    Spielfeld suchen
    ----------------------------------- */

    const spielfeld =
        document.getElementById("spielfeld");

    if (!spielfeld) {
        console.error("Infotafel: Spielfeld nicht gefunden.");
        return;
    }

    /* -----------------------------------
    Bereits vorhandenes Fenster entfernen
    ----------------------------------- */

    document.getElementById(
        "reservatInfotafelFenster"
    )?.remove();

    /* -----------------------------------
    Fenster erzeugen
    ----------------------------------- */

    const fenster =
        document.createElement("div");

    fenster.id =
        "reservatInfotafelFenster";
/* -----------------------------------
Fenster für ersten Test positionieren
----------------------------------- */

/* -----------------------------------
Fenster innerhalb der Karte platzieren
----------------------------------- */

fenster.style.position = "absolute";

fenster.style.left = "50%";
fenster.style.top = "50%";

fenster.style.transform =
    "translate(-50%, -50%)";

fenster.style.zIndex = "10000";

/* -----------------------------------
Größe auf Kartenbereich begrenzen
----------------------------------- */

fenster.style.width = "90%";
fenster.style.containerType = "inline-size";
fenster.style.maxWidth = "none";

fenster.style.maxHeight = "none";

fenster.style.pointerEvents = "auto";
    /* -----------------------------------
    Hintergrundgrafik erzeugen
    ----------------------------------- */

    const hintergrund =
        document.createElement("img");

    hintergrund.id =
        "reservatInfotafelHintergrund";

hintergrund.src =
    "Daten/Objekte/Infotafeln/" +
    "Changelog-Tafel/infotafel_dialog.png";

/* -----------------------------------
Hintergrund an Fensterbreite anpassen
----------------------------------- */

hintergrund.style.display = "block";
hintergrund.style.width = "100%";
hintergrund.style.height = "auto";

/* -----------------------------------
Hintergrund einsetzen
----------------------------------- */

fenster.appendChild(hintergrund);

/* -----------------------------------
Textbereich der Informationsansicht
----------------------------------- */

const textbereich =
    document.createElement("div");

textbereich.id =
    "reservatInfotafelText";

textbereich.style.position = "absolute";

textbereich.style.left = "19%";
textbereich.style.top = "22%";

textbereich.style.width = "64%";
textbereich.style.height = "58%";

textbereich.style.overflowY = "auto";
textbereich.style.overflowX = "hidden";

textbereich.style.color = "white";
textbereich.style.fontSize = "2.8cqw";
textbereich.style.lineHeight = "1.5";

textbereich.style.zIndex = "5";

/* -----------------------------------
Vorläufiger Testinhalt
----------------------------------- */


/* -----------------------------------
Changelog aus JSON laden
----------------------------------- */

textbereich.textContent =
    "Änderungsübersicht wird geladen …";

textbereich.style.whiteSpace = "pre-line";

fetch("Daten/Objekte/Infotafeln/changelog.json")
    .then(function (antwort) {

        if (!antwort.ok) {
            throw new Error(
                "HTTP-Fehler " + antwort.status
            );
        }

        return antwort.json();

    })
    .then(function (daten) {

        /* -----------------------------------
        Einträge nach Datum sortieren
        ----------------------------------- */

        const eintraege =
            [...daten.eintraege].sort(
                function (a, b) {
                    return b.datum.localeCompare(a.datum);
                }
            );

        /* -----------------------------------
        Vorläufige Textdarstellung
        ----------------------------------- */

/* -----------------------------------
Alten Text entfernen
----------------------------------- */

textbereich.replaceChildren();

/* -----------------------------------
Changelog-Einträge darstellen
----------------------------------- */

eintraege.forEach(function (eintrag) {

    /* Überschrift mit Datum */

    const kopf =
        document.createElement("div");

    kopf.style.color = "#e6bd62";
    kopf.style.fontWeight = "bold";
    kopf.style.marginBottom = "8px";

	kopf.textContent =
		eintrag.version +
		" " + eintrag.datum +
		" " + eintrag.titel;

    textbereich.appendChild(kopf);

    /* Beschreibung */

    const beschreibung =
        document.createElement("div");

    beschreibung.style.color = "#ffffff";
    beschreibung.style.whiteSpace = "pre-line";
    beschreibung.style.marginBottom = "28px";

    beschreibung.textContent =
        eintrag.text;

    textbereich.appendChild(beschreibung);

});

/* -----------------------------------
Beim Öffnen immer oben beginnen
----------------------------------- */

textbereich.scrollTop = 0;

    })
    .catch(function (fehler) {

        console.error(
            "Changelog konnte nicht geladen werden:",
            fehler
        );

        textbereich.textContent =
            "Die Änderungsübersicht konnte nicht geladen werden.";

    });

/* Ende Changelog laden */



fenster.appendChild(textbereich);

/* Ende Textbereich */
/* -----------------------------------
Schließen-Knopf erzeugen
----------------------------------- */

const schliessen =
    document.createElement("img");

schliessen.id =
    "reservatInfotafelSchliessen";

schliessen.src =
    "Daten/Objekte/Infotafeln/" +
    "Changelog-Tafel/X-Icon-infotafel.png";

schliessen.alt = "Schließen";

schliessen.style.position = "absolute";
schliessen.style.top = "11.8%";
schliessen.style.right = "12.2%";
schliessen.style.width = "8%";
schliessen.style.height = "auto";

schliessen.style.cursor = "pointer";
schliessen.style.zIndex = "10";

/* -----------------------------------
Fenster beim Anklicken schließen
----------------------------------- */

schliessen.addEventListener(
    "click",
    function () {

        fenster.remove();

    }
);

fenster.appendChild(schliessen);

/* Ende Schließen-Knopf */
/* -----------------------------------
Rückpfeil erzeugen
----------------------------------- */

const zurueck =
    document.createElement("img");

zurueck.id =
    "reservatInfotafelZurueck";

zurueck.src =
    "Daten/Objekte/Infotafeln/" +
    "Changelog-Tafel/Rückpfeil.png";

zurueck.alt = "Zurück";

zurueck.style.position = "absolute";

zurueck.style.top = "11.8%";
zurueck.style.left = "12.2%";

zurueck.style.width = "8%";
zurueck.style.height = "auto";

zurueck.style.cursor = "pointer";
zurueck.style.zIndex = "10";

/* -----------------------------------
Informationsfenster schließen
----------------------------------- */

zurueck.addEventListener(
    "click",
    function () {

        fenster.remove();

    }
);

fenster.appendChild(zurueck);

/* Ende Rückpfeil */
    /* -----------------------------------
    Fenster ins Spielfeld einsetzen
    ----------------------------------- */

    spielfeld.appendChild(fenster);

}; /* Ende infotafelAnzeigen */
/* ===================================
   MEMORY-RUHMESTAFEL ANZEIGEN
   =================================== */

window.memoryRuhmestafelAnzeigen = function (sonderfeld) {

    /* Spielfeld suchen */

    const spielfeld =
        document.getElementById("spielfeld");

    if (!spielfeld) {
        console.error("Memory-Ruhmestafel: Spielfeld fehlt.");
        return;
    }

    /* Vorhandene Ruhmestafel entfernen */

    document.getElementById(
        "memoryRuhmestafelFenster"
    )?.remove();

    /* Fenster erstellen */

    const fenster = document.createElement("div");

    fenster.id = "memoryRuhmestafelFenster";

    fenster.style.position = "absolute";
    fenster.style.left = "50%";
    fenster.style.top = "50%";
    fenster.style.transform = "translate(-50%, -50%)";
    fenster.style.width = "90%";
    fenster.style.maxWidth = "none";
    fenster.style.zIndex = "10000";
    fenster.style.pointerEvents = "auto";

    /* Schiefertafel einsetzen */

    const tafel = document.createElement("img");

    tafel.id = "memoryRuhmestafelBild";

    tafel.src =
        "Daten/Objekte/Infotafeln/Ruhmestafel-Memory/" +
        "Memory_Ruhmeshalle_Tafel_1024x1024.webp";

    tafel.alt = "Memory-Ruhmestafel";
    tafel.style.display = "block";
    tafel.style.width = "100%";
    tafel.style.height = "auto";

    fenster.appendChild(tafel);

/* -----------------------------------
   Schließen-X oben rechts
   ----------------------------------- */

const schliessen = document.createElement("img");

schliessen.id = "memoryRuhmestafelSchliessen";

schliessen.src =
    "Daten/Objekte/Infotafeln/Ruhmestafel-Memory/SchliessenX.png";

schliessen.alt = "Ruhmestafel schließen";

schliessen.style.position = "absolute";
schliessen.style.top = "5%";
schliessen.style.right = "5%";
schliessen.style.width = "8%";
schliessen.style.height = "auto";
schliessen.style.cursor = "pointer";
schliessen.style.zIndex = "10";

schliessen.addEventListener("click", function () {
    fenster.remove();
});

fenster.appendChild(schliessen);

/* Ende Schließen-X */
/* ===================================
   MEMORY – AUSWAHL EIGENE / GRUPPE
   =================================== */

const memoryButtonPfad =
    "Daten/Objekte/Infotafeln/Ruhmestafel-Memory/";

let memoryAnsicht = "GRUPPE";

/* Einzelnen Button erstellen */

function memoryAnsichtButtonErstellen(name, links) {

    const button = document.createElement("img");

    button.id = "memoryButton" + name;

    button.alt = name;

    button.style.position = "absolute";
	button.style.top = "16%";
	button.style.left = links;
	button.style.width = "32.5%";
    button.style.height = "auto";
    button.style.cursor = "pointer";
    button.style.zIndex = "5";

    button.addEventListener("click", function () {

        memoryAnsicht = name;
        memoryAnsichtButtonsAktualisieren();
		memoryRanglisteAktualisieren();

    });

    fenster.appendChild(button);

    return button;
}

/* Beide Buttons anlegen */

const buttonEigene =
    memoryAnsichtButtonErstellen("EIGENE", "15%");

const buttonGruppe =
    memoryAnsichtButtonErstellen("GRUPPE", "52.5%");

/* Aktive und inaktive Grafiken setzen */

function memoryAnsichtButtonsAktualisieren() {

    for (const name of ["EIGENE", "GRUPPE"]) {

        const button =
            document.getElementById("memoryButton" + name);

        if (!button) continue;

        const zustand =
            memoryAnsicht === name ? "Aktiv" : "Inaktiv";

        button.src =
            memoryButtonPfad +
            "Memory_Rangliste_Button_" +
            name + "_" + zustand + ".webp";
    }
}

/* Ende Memory-Auswahl EIGENE / GRUPPE */
/* ===================================
   MEMORY – ZEITRAUM AUSWÄHLEN
   =================================== */

let memoryZeitraum = "WOCHE";

/* Einzelnen Zeitraum-Button erstellen */

function memoryZeitraumButtonErstellen(name, links) {

    const button = document.createElement("img");

    button.id = "memoryZeitraumButton" + name;
    button.alt = name;

    button.style.position = "absolute";
    button.style.top = "76%";
    button.style.left = links;
    button.style.width = "17%";
    button.style.height = "auto";
    button.style.cursor = "pointer";
    button.style.zIndex = "5";

    button.addEventListener("click", function () {

        memoryZeitraum = name;
        memoryZeitraumButtonsAktualisieren();
		memoryRanglisteAktualisieren();
    });

    fenster.appendChild(button);

    return button;
}

/* Vier Zeitraum-Buttons anlegen */

memoryZeitraumButtonErstellen("TAG", "15%");
memoryZeitraumButtonErstellen("WOCHE", "33%");
memoryZeitraumButtonErstellen("MONAT", "51%");
memoryZeitraumButtonErstellen("ALLZEIT", "69%");

/* Aktive und inaktive Grafiken setzen */

function memoryZeitraumButtonsAktualisieren() {

    for (const name of ["TAG", "WOCHE", "MONAT", "ALLZEIT"]) {

        const button =
            document.getElementById("memoryZeitraumButton" + name);

        if (!button) continue;

        const zustand =
            memoryZeitraum === name ? "Aktiv" : "Inaktiv";

        button.src =
            memoryButtonPfad +
            "Memory_Rangliste_Button_" +
            name + "_" + zustand + ".webp";
    }
}

/* Ende Memory-Zeitraumauswahl */
/* ===================================
   MEMORY – RANGLISTENANZEIGE
   =================================== */

/* Textbereich erstellen */

const rangliste = document.createElement("div");

rangliste.id = "memoryRuhmestafelRangliste";

rangliste.style.position = "absolute";
rangliste.style.left = "16%";
rangliste.style.top = "31%";
rangliste.style.width = "68%";
rangliste.style.height = "42%";

rangliste.style.boxSizing = "border-box";
rangliste.style.overflow = "hidden";
rangliste.style.color = "#f4f0df";
rangliste.style.textAlign = "left";
rangliste.style.fontFamily = "Georgia, serif";
rangliste.style.fontSize = "3.2cqw";
rangliste.style.lineHeight = "1.6";
rangliste.style.whiteSpace = "pre-line";
rangliste.style.pointerEvents = "none";

fenster.style.containerType = "inline-size";

fenster.appendChild(rangliste);

/* -----------------------------------
   Memory: Spielerdaten aus Firebase lesen
   ----------------------------------- */

async function memorySpielerdatenLaden() {

    /* Liste der Gruppenmitglieder lesen */

    const loginRef = window.firebaseRef(
        window.firebaseDatabase,
        "loginUsers"
    );

    const loginSnapshot = await window.firebaseGet(
        loginRef
    );

    const loginUsers = loginSnapshot.val() || {};

    /* Memory-Bestwerte einzeln lesen */

    const ergebnisse = await Promise.all(
        Object.entries(loginUsers).map(
            async function ([uid, spieler]) {

                if (spieler.active !== true) {
                    return null;
                }

                const bestwerteRef = window.firebaseRef(
                    window.firebaseDatabase,
                    "spieler/" + uid +
                    "/extern/taten/memory-single/bestwerte"
                );

                try {

                    const snapshot = await window.firebaseGet(
                        bestwerteRef
                    );

                    return {
                        uid: uid,
                        name: spieler.habiticaName || "Unbekannt",
                        bestwerte: snapshot.val() || {}
                    };

                } catch (fehler) {

                    console.warn(
                        "Memory-Bestwerte nicht lesbar:",
                        uid,
                        fehler
                    );

                    return null;
                }
            }
        )
    );

    /* Nur erfolgreich gelesene Spieler zurückgeben */

    return ergebnisse.filter(
        function (eintrag) {
            return eintrag !== null;
        }
    );

} /* Ende memorySpielerdatenLaden */
/* -----------------------------------
   Geladene Memory-Ergebnisse
   ----------------------------------- */

let memoryGeladeneSpieler = [];
/* -----------------------------------
   Memory: Wochenrangliste ermitteln
   ----------------------------------- */

function memoryRanglisteErmitteln() {

    /* Aktuelle ISO-Kalenderwoche bestimmen */

    const heute = new Date();

    const datum = new Date(Date.UTC(
        heute.getFullYear(),
        heute.getMonth(),
        heute.getDate()
    ));

    datum.setUTCDate(
        datum.getUTCDate() + 4 -
        (datum.getUTCDay() || 7)
    );

    const jahr = datum.getUTCFullYear();
    const jahresanfang = new Date(Date.UTC(jahr, 0, 1));

    const woche = Math.ceil(
        (((datum - jahresanfang) / 86400000) + 1) / 7
    );

const aktuelleWoche =
    jahr + "-W" + String(woche).padStart(2, "0");

/* Tages- und Monatskennung bestimmen */

const aktuellerTag =
    heute.getFullYear() + "-" +
    String(heute.getMonth() + 1).padStart(2, "0") + "-" +
    String(heute.getDate()).padStart(2, "0");

const aktuellerMonat = aktuellerTag.slice(0, 7);

/* Gewählten Zeitraum auf Firebase-Daten abbilden */

const zeitraumDaten = {
    TAG: {
        schluessel: "heute",
        kennung: aktuellerTag
    },
    WOCHE: {
        schluessel: "woche",
        kennung: aktuelleWoche
    },
    MONAT: {
        schluessel: "monat",
        kennung: aktuellerMonat
    },
    ALLZEIT: {
        schluessel: "alltime",
        kennung: "alltime"
    }
};

const auswahl = zeitraumDaten[memoryZeitraum];

/* Gültige Bestwerte sammeln */

    const ergebnisse = [];

    for (const spieler of memoryGeladeneSpieler) {

        const rekord = spieler.bestwerte?.[auswahl.schluessel];

		if (!rekord || rekord.zeitraum !== auswahl.kennung) {
			continue;
		}

        if (
            !Number.isFinite(rekord.versuche) ||
            !Number.isFinite(rekord.zeitSekunden)
        ) {
            continue;
        }

		ergebnisse.push({
			uid: spieler.uid,
			name: spieler.name,
			versuche: rekord.versuche,
			zeitSekunden: rekord.zeitSekunden
		});
    }

    /* Weniger Versuche, danach kürzere Zeit */

    ergebnisse.sort(function (a, b) {

        return (
            a.versuche - b.versuche ||
            a.zeitSekunden - b.zeitSekunden
        );

    });

    return ergebnisse;

} /* Ende memoryRanglisteErmitteln */
/* -----------------------------------
   Memory-Rangliste aktualisieren
   ----------------------------------- */

function memoryRanglisteAktualisieren() {

    /* Gemeinsames Tabellenlayout */

    rangliste.style.display = "grid";
    rangliste.style.gridTemplateColumns = "56% 24% 20%";
    rangliste.style.gridAutoRows = "min-content";
    rangliste.style.columnGap = "0";
    rangliste.style.alignContent = "start";

    /* Einzelne Tabellenzelle hinzufügen */

    function zelle(text, fett = false, ausrichtung = "left") {

        const element = document.createElement("div");

        element.textContent = text;
        element.style.textAlign = ausrichtung;
        element.style.fontWeight = fett ? "bold" : "normal";
        element.style.whiteSpace = "nowrap";

        rangliste.appendChild(element);
    }

    /* Vorherigen Inhalt entfernen */

    rangliste.replaceChildren();

    /* Tabellenüberschriften */

    zelle("Tier", true);
    zelle("Versuche", true, "center");
    zelle("Zeit", true, "right");

if (memoryAnsicht === "EIGENE") {

    /* Eigenen Rekord des angemeldeten Spielers finden */

    const eigeneUid = window.firebaseAuth?.currentUser?.uid;

    const ergebnisse = memoryRanglisteErmitteln();

    const eigenerRekord = ergebnisse.find(function (eintrag) {
        return eintrag.uid === eigeneUid;
    });

    if (!eigenerRekord) {

        zelle("Noch kein Ergebnis");
        zelle("");
        zelle("");

    } else {

        /* Persönliche Bestzeit formatieren */

        const minuten = Math.floor(
            eigenerRekord.zeitSekunden / 60
        );

        const sekunden = Math.floor(
            eigenerRekord.zeitSekunden % 60
        );

        const zeit =
            String(minuten).padStart(2, "0") +
            ":" +
            String(sekunden).padStart(2, "0");

        zelle("Du");
        zelle(String(eigenerRekord.versuche), false, "center");
        zelle(zeit, false, "right");
    }

} else {

        /* Echte Wochenrangliste der Gruppe */

        const ergebnisse = memoryRanglisteErmitteln();

        if (ergebnisse.length === 0) {

            zelle("Noch keine Ergebnisse");
            zelle("");
            zelle("");

        } else {

            ergebnisse.slice(0, 5).forEach(function (eintrag, index) {

                const minuten = Math.floor(
                    eintrag.zeitSekunden / 60
                );

                const sekunden = Math.floor(
                    eintrag.zeitSekunden % 60
                );

                const zeit =
                    String(minuten).padStart(2, "0") +
                    ":" +
                    String(sekunden).padStart(2, "0");

                /* Platzierung bei Gleichstand beibehalten */

let platz = index + 1;

for (let i = index - 1; i >= 0; i--) {

    if (
        ergebnisse[i].versuche === eintrag.versuche &&
        ergebnisse[i].zeitSekunden === eintrag.zeitSekunden
    ) {
        platz = i + 1;
    } else {
        break;
    }
}

zelle(platz + ". " + eintrag.name);
                zelle(String(eintrag.versuche), false, "center");
                zelle(zeit, false, "right");

            });
        }
    }
    /* -----------------------------------
       Handgezeichnete Kreidelinien
       ----------------------------------- */

    const zeilenAnzahl =
        memoryAnsicht === "EIGENE" ? 2 : 6;

    const svgNS = "http://www.w3.org/2000/svg";

    const kreide = document.createElementNS(svgNS, "svg");

    kreide.setAttribute("viewBox", "0 0 100 100");
    kreide.setAttribute("preserveAspectRatio", "none");

    kreide.style.position = "absolute";
    kreide.style.left = "0";
    kreide.style.top = "0";
    kreide.style.width = "100%";
    kreide.style.height =
        (zeilenAnzahl * 5.12) + "cqw";
    kreide.style.overflow = "visible";
    kreide.style.pointerEvents = "none";

    /* Einen unregelmäßigen Kreidestrich zeichnen */

    function kreidestrich(verlauf) {

        const pfad = document.createElementNS(svgNS, "path");

        pfad.setAttribute("d", verlauf);
        pfad.setAttribute("fill", "none");
        pfad.setAttribute("stroke", "#e8e5d8");
        pfad.setAttribute("stroke-width", "0.35");
        pfad.setAttribute("stroke-opacity", "0.65");
        pfad.setAttribute("stroke-linecap", "round");
        pfad.setAttribute("vector-effect", "non-scaling-stroke");

        kreide.appendChild(pfad);
    }

    /* Senkrechte Trennlinien */

    kreidestrich("M 56 1 Q 55.6 48 56.2 99");
    kreidestrich("M 80 1 Q 80.5 52 79.8 99");

    /* Waagerechte Trennlinien */

    for (let i = 1; i < zeilenAnzahl; i++) {

        const y = i * 100 / zeilenAnzahl;

        kreidestrich(
            `M 0 ${y} Q 49 ${y - 0.6} 100 ${y + 0.3}`
        );
    }

    rangliste.appendChild(kreide);

    /* Ende handgezeichnete Kreidelinien */
}

/* Ende Memory-Rangliste aktualisieren */

/* Ende Memory-Ranglistenanzeige */
/* Fenster einblenden */

spielfeld.appendChild(fenster);

/* Startauswahl anzeigen */

memoryAnsichtButtonsAktualisieren();
memoryZeitraumButtonsAktualisieren();
memoryRanglisteAktualisieren();
/* -----------------------------------
   Memory: Firebase-Lesezugriff testen
   ----------------------------------- */



memorySpielerdatenLaden()
    .then(function (spielerDaten) {

        memoryGeladeneSpieler = spielerDaten;

        console.log(
            "Memory-Spielerdaten geladen:",
            memoryGeladeneSpieler.length,
            "Spieler"
        );
/* Rangliste mit echten Ergebnissen neu zeichnen */
memoryRanglisteAktualisieren();
    })
    .catch(function (fehler) {

        console.error(
            "Memory-Spielerdaten konnten nicht geladen werden:",
            fehler
        );

    });

/* Ende Memory: Firebase-Lesezugriff testen */
}; /* Ende memoryRuhmestafelAnzeigen */
})();

/* Ende Informationsobjekte */