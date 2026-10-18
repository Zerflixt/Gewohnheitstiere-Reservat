/* =========================================================
SPIELERKARTENBETRACHTER
Kartenquelle: Wild am Sonntag 25
========================================================= */

window.spielerkarteAdresseErmitteln =
    function (spielerName) {

        /* -----------------------------------
        Spielername prüfen
        ----------------------------------- */

        if (!spielerName) {
            return null;
        }

        /* -----------------------------------
        Dateinamen wie im Kartenstudio bilden
        ----------------------------------- */

        let sichererName =
            spielerName.replace(
                /[<>:"/\\|?*]/g,
                "_"
            );

        let dateiname =
            "2026-10-10_WaS025_" +
            sichererName +
            ".png";

        /* -----------------------------------
        GitHub-Adresse zusammensetzen
        ----------------------------------- */

        let basisAdresse =
            "https://zerflixt.github.io/" +
            "Wild-am-Sonntag-25/" +
            "2026-10-10_WaS025_Karten/";

        return (
            basisAdresse +
            encodeURIComponent(dateiname)
        );

    };

/* Ende Spielerkarte-Adresse ermitteln */
/* =========================================================
SPIELERKARTEN-KNOPF VERBINDEN
========================================================= */

$(document).on(
    "click",
    "#spielerkarteButton",
    function () {

        /* Eigenen Spieler verwenden */

        let spieler =
            window.spielerkartenEigenerSpieler;

        if (!spieler || !spieler.profile?.name) {
            alert("Dein Spielername ist noch nicht verfügbar.");
            return;
        }

        /* Kartenadresse ermitteln */

        let kartenAdresse =
            window.spielerkarteAdresseErmitteln(
                spieler.profile.name
            );

        if (!kartenAdresse) {
            alert("Deine Spielerkarte konnte nicht gefunden werden.");
            return;
        }

/* -----------------------------------
Kartenbetrachter öffnen
----------------------------------- */

window.spielerkartenBetrachterOeffnen(
    kartenAdresse
);

    }
);

/* Ende Spielerkarten-Knopf verbinden */
/* =========================================================
SPIELERKARTENBETRACHTER ÖFFNEN
========================================================= */

window.spielerkartenBetrachterOeffnen =
    function (kartenAdresse) {

        /* -----------------------------------
        Bereits geöffneten Betrachter prüfen
        ----------------------------------- */

        if (
            document.getElementById(
                "spielerkartenBetrachter"
            )
        ) {
            return;
        }

        /* -----------------------------------
        Hintergrund und Betrachter erstellen
        ----------------------------------- */

        const betrachter =
            document.createElement("div");

        betrachter.id =
            "spielerkartenBetrachter";

        betrachter.innerHTML = `
            <div id="spielerkartenInhalt">

                <div id="spielerkartenBildbereich">
                    <img
                        id="spielerkartenBild"
                        alt="Eigene Spielerkarte"
						draggable="false"
                    >
                </div>

                <div id="spielerkartenWerkzeugleiste">

					<button
						id="spielerkartenSchliessen"
						type="button"
						title="Kartenansicht schließen"
						aria-label="Kartenansicht schließen"
					>
						<img
							src="Daten/Icons/Goldenes_X.png"
							alt=""
						>
					</button>

                </div>

            </div>
        `;

        document.body.appendChild(
            betrachter
        );

        /* -----------------------------------
        Kartenbild laden
        ----------------------------------- */

        document.getElementById(
            "spielerkartenBild"
        ).src = kartenAdresse;
		/* -----------------------------------
		Maussteuerung aktivieren
		----------------------------------- */

		window.spielerkarteMaussteuerungAktivieren();

		/* Ende Maussteuerung aktivieren */

    };

/* Ende Spielerkartenbetrachter öffnen */


/* =========================================================
SPIELERKARTENBETRACHTER SCHLIESSEN
========================================================= */

window.spielerkartenBetrachterSchliessen =
    function () {

        const betrachter =
            document.getElementById(
                "spielerkartenBetrachter"
            );

        if (betrachter) {
            betrachter.remove();
        }

    };

/* Ende Spielerkartenbetrachter schließen */


/* =========================================================
SCHLIESSEN-BUTTON VERBINDEN
========================================================= */

$(document).on(
    "click",
    "#spielerkartenSchliessen",
    function () {

        window.spielerkartenBetrachterSchliessen();

    }
);

/* Ende Schließen-Button verbinden */
/* =========================================================
BROWSER-DRAGGING DER SPIELERKARTE VERHINDERN
========================================================= */

$(document).on(
    "dragstart",
    "#spielerkartenBild",
    function (ereignis) {

        ereignis.preventDefault();

        return false;

    }
);

/* Ende Browser-Dragging verhindern */
/* =========================================================
SPIELERKARTE - MAUS UND TOUCHSTEUERUNG
========================================================= */

window.spielerkarteMaussteuerungAktivieren =
    function () {

        const bildbereich =
            document.getElementById("spielerkartenBildbereich");

        const bild =
            document.getElementById("spielerkartenBild");

        if (!bildbereich || !bild) {
            return;
        }

        /* -----------------------------------
        Gemeinsamer Kartenzustand
        ----------------------------------- */

        let zoom = 1;
        let verschiebungX = 0;
        let verschiebungY = 0;

        const minimalZoom = 1;
        const maximalZoom = 5;

        const aktiveFinger = new Map();

        let mausZieht = false;
        let letzteMausX = 0;
        let letzteMausY = 0;

        let letzterMittelpunkt = null;
        let letzterAbstand = null;

        /* -----------------------------------
        Verschiebung begrenzen
        ----------------------------------- */

        function verschiebungBegrenzen() {

            const maxX =
                bildbereich.clientWidth * (zoom - 1) / 2;

            const maxY =
                bildbereich.clientHeight * (zoom - 1) / 2;

            verschiebungX = Math.max(
                -maxX,
                Math.min(maxX, verschiebungX)
            );

            verschiebungY = Math.max(
                -maxY,
                Math.min(maxY, verschiebungY)
            );

        } /* Ende verschiebungBegrenzen */

        /* -----------------------------------
        Kartenposition aktualisieren
        ----------------------------------- */

        function karteAktualisieren() {

            verschiebungBegrenzen();

            bild.style.transform =
                `translate(${verschiebungX}px, ${verschiebungY}px) ` +
                `scale(${zoom})`;

            bild.style.cursor =
                zoom > 1
                    ? (mausZieht ? "grabbing" : "grab")
                    : "default";

        } /* Ende karteAktualisieren */

        /* -----------------------------------
        Zoom um einen bestimmten Punkt
        ----------------------------------- */

        function zoomAnPunkt(neuerZoom, x, y) {

            const bisherigerZoom = zoom;

            zoom = Math.max(
                minimalZoom,
                Math.min(maximalZoom, neuerZoom)
            );

            const rechteck =
                bildbereich.getBoundingClientRect();

            const punktX =
                x - rechteck.left - rechteck.width / 2;

            const punktY =
                y - rechteck.top - rechteck.height / 2;

            const verhaeltnis =
                zoom / bisherigerZoom;

            verschiebungX =
                punktX -
                (punktX - verschiebungX) * verhaeltnis;

            verschiebungY =
                punktY -
                (punktY - verschiebungY) * verhaeltnis;

            karteAktualisieren();

        } /* Ende zoomAnPunkt */

        /* -----------------------------------
        Mausrad-Zoom
        ----------------------------------- */

        bildbereich.addEventListener(
            "wheel",
            function (ereignis) {

                ereignis.preventDefault();

                const faktor =
                    ereignis.deltaY < 0
                        ? 1.15
                        : 1 / 1.15;

                zoomAnPunkt(
                    zoom * faktor,
                    ereignis.clientX,
                    ereignis.clientY
                );

            },
            { passive: false }
        );

        /* Ende Mausrad-Zoom */

        /* -----------------------------------
        Fingerpositionen auswerten
        ----------------------------------- */

        function fingerDatenErmitteln() {

            const finger =
                Array.from(aktiveFinger.values());

            if (finger.length === 0) {
                return null;
            }

            if (finger.length === 1) {
                return {
                    x: finger[0].x,
                    y: finger[0].y,
                    abstand: null
                };
            }

            const erster = finger[0];
            const zweiter = finger[1];

            return {
                x: (erster.x + zweiter.x) / 2,
                y: (erster.y + zweiter.y) / 2,

                abstand: Math.hypot(
                    zweiter.x - erster.x,
                    zweiter.y - erster.y
                )
            };

        } /* Ende fingerDatenErmitteln */

        /* -----------------------------------
        Touch-Ausgangswerte speichern
        ----------------------------------- */

        function touchAusgangswerteSetzen() {

            const daten = fingerDatenErmitteln();

            letzterMittelpunkt = daten
                ? { x: daten.x, y: daten.y }
                : null;

            letzterAbstand = daten
                ? daten.abstand
                : null;

        } /* Ende touchAusgangswerteSetzen */

        /* -----------------------------------
        Maus oder Finger aufsetzen
        ----------------------------------- */

        bildbereich.addEventListener(
            "pointerdown",
            function (ereignis) {

                if (ereignis.pointerType === "mouse") {

                    if (
                        ereignis.button !== 0 ||
                        zoom <= 1
                    ) {
                        return;
                    }

                    mausZieht = true;

                    letzteMausX = ereignis.clientX;
                    letzteMausY = ereignis.clientY;

                } else {

                    aktiveFinger.set(
                        ereignis.pointerId,
                        {
                            x: ereignis.clientX,
                            y: ereignis.clientY
                        }
                    );

                    touchAusgangswerteSetzen();

                }

                bildbereich.setPointerCapture(
                    ereignis.pointerId
                );

                karteAktualisieren();

            }
        );

        /* Ende Pointer-Start */

        /* -----------------------------------
        Maus oder Finger bewegen
        ----------------------------------- */

        bildbereich.addEventListener(
            "pointermove",
            function (ereignis) {

                /* Maus verschieben */

                if (ereignis.pointerType === "mouse") {

                    if (!mausZieht) {
                        return;
                    }

                    verschiebungX +=
                        ereignis.clientX - letzteMausX;

                    verschiebungY +=
                        ereignis.clientY - letzteMausY;

                    letzteMausX = ereignis.clientX;
                    letzteMausY = ereignis.clientY;

                    karteAktualisieren();
                    return;
                }

                /* Touch verschieben */

                if (!aktiveFinger.has(ereignis.pointerId)) {
                    return;
                }

                aktiveFinger.set(
                    ereignis.pointerId,
                    {
                        x: ereignis.clientX,
                        y: ereignis.clientY
                    }
                );

                const daten = fingerDatenErmitteln();

                if (!daten || !letzterMittelpunkt) {
                    touchAusgangswerteSetzen();
                    return;
                }

                /* Mit zwei Fingern zoomen */

                if (
                    aktiveFinger.size >= 2 &&
                    daten.abstand > 0 &&
                    letzterAbstand > 0
                ) {

                    const faktor =
                        daten.abstand / letzterAbstand;

                    zoomAnPunkt(
                        zoom * faktor,
                        letzterMittelpunkt.x,
                        letzterMittelpunkt.y
                    );

                }

                /* Karte mit Fingern verschieben */

                if (zoom > 1) {

                    verschiebungX +=
                        daten.x - letzterMittelpunkt.x;

                    verschiebungY +=
                        daten.y - letzterMittelpunkt.y;

                }

                karteAktualisieren();

                letzterMittelpunkt = {
                    x: daten.x,
                    y: daten.y
                };

                letzterAbstand = daten.abstand;

            }
        );

        /* Ende Pointer-Bewegung */

        /* -----------------------------------
        Maus oder Finger loslassen
        ----------------------------------- */

        function pointerBeenden(ereignis) {

            if (ereignis.pointerType === "mouse") {

                mausZieht = false;

            } else {

                aktiveFinger.delete(
                    ereignis.pointerId
                );

                touchAusgangswerteSetzen();

            }

            karteAktualisieren();

        } /* Ende pointerBeenden */

        bildbereich.addEventListener(
            "pointerup",
            pointerBeenden
        );

        bildbereich.addEventListener(
            "pointercancel",
            pointerBeenden
        );

        bildbereich.addEventListener(
            "lostpointercapture",
            pointerBeenden
        );

        /* -----------------------------------
        Anfangsansicht herstellen
        ----------------------------------- */

        karteAktualisieren();

    };

/* Ende Spielerkarte - Maus und Touchsteuerung */
/* =========================================================
SPIELERKARTENBETRACHTER - DARSTELLUNG
========================================================= */

(function () {

    const style =
        document.createElement("style");

    style.id =
        "spielerkartenBetrachterStyles";

    style.textContent = `

		 /* =========================================================
		SPIELERKARTENBETRACHTER - LAYOUT
		========================================================= */

		#spielerkartenBetrachter {
			position: fixed;
			inset: 0;
			z-index: 100000;
			background: rgba(0, 0, 0, 0.92);

			display: flex;
			align-items: center;
			justify-content: center;

			padding: 16px;
			box-sizing: border-box;

			--kartenBreite: min(
				calc(100dvw - 32px),
				calc((100dvh - 116px) * 5 / 7)
			);
		}

		/* -----------------------------------
		Hochformat: Werkzeugleiste unten
		----------------------------------- */

		#spielerkartenInhalt {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			justify-content: center;
			gap: 0;

			width: var(--kartenBreite);
			height: auto;
			min-height: 0;
		}

		#spielerkartenBildbereich {
			flex: 0 0 auto;
			width: 100%;
			aspect-ratio: 5 / 7;
			
			touch-action: none;
			
			min-width: 0;
			min-height: 0;

			overflow: hidden;
		}

		#spielerkartenBild {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: contain;

			user-select: none;
			-webkit-user-drag: none;
		}

		/* -----------------------------------
		Werkzeugleiste
		----------------------------------- */

		#spielerkartenWerkzeugleiste {
			flex: 0 0 auto;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 12px;

			width: 100%;
			height: 68px;
			min-height: 0;

			padding: 8px 12px;
			box-sizing: border-box;

			background: transparent;
			border: 1px solid #555;
			border-radius: 10px;
		}

		/* -----------------------------------
		Goldenes X
		----------------------------------- */

		#spielerkartenSchliessen {
			flex: 0 0 52px;
			width: 52px;
			height: 52px;
			padding: 0;

			border: none;
			background: transparent;
			cursor: pointer;
			touch-action: manipulation;
		}

		#spielerkartenSchliessen img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		/* -----------------------------------
		Querformat: Werkzeugleiste rechts
		----------------------------------- */

		@media (orientation: landscape) {

			#spielerkartenBetrachter {
				--kartenBreite: min(
					calc(100dvw - 108px),
					calc((100dvh - 32px) * 5 / 7)
				);
			}

			#spielerkartenInhalt {
				flex-direction: row;
				align-items: stretch;

				width: auto;
				height: auto;
			}

			#spielerkartenBildbereich {
				width: var(--kartenBreite);
				aspect-ratio: 5 / 7;
			}

			#spielerkartenWerkzeugleiste {
				flex: 0 0 76px;
				width: 76px;
				height: auto;

				flex-direction: column;
				justify-content: flex-end;

				padding: 12px 8px;
			}
		}

		/* Ende Querformat */

    `;

    document.head.appendChild(style);

})();

/* Ende Spielerkartenbetrachter - Darstellung */