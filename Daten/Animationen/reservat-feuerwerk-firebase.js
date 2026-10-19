/* =========================================================
RESERVAT - FEUERWERK FIREBASE
Firebase-Ereignisse für Multiplayer-Feuerwerk
========================================================= */

(function () {
    "use strict";

    /* -----------------------------------
    Aktiven Listener merken
    ----------------------------------- */

    let listenerBeenden = null;

    /* Ende aktiven Listener merken */


    /* -----------------------------------
    Feuerwerks-Listener starten
    ----------------------------------- */

    function starten() {

        /* Doppelten Start verhindern */

        if (listenerBeenden !== null) {
            return;
        }

        /* Firebase-Verfügbarkeit prüfen */

        if (
            !window.firebaseDatabase ||
            !window.firebaseRef ||
            !window.firebaseOnValue
        ) {
            console.warn(
                "Feuerwerk: Firebase noch nicht bereit."
            );
            return;
        }

        const feuerwerkRef =
            window.firebaseRef(
                window.firebaseDatabase,
                "realtime/effects/fireworks"
            );
			/* -----------------------------------
			Erste Datenlieferung erkennen
			----------------------------------- */

			let ersteDatenlieferung = true;
			/* -----------------------------------
			Zuletzt bekannte Raketennummern
			----------------------------------- */

			const letzteNummern = {};

			/* Ende zuletzt bekannte Raketennummern */

			/* Ende erste Datenlieferung erkennen */
        listenerBeenden =
            window.firebaseOnValue(
                feuerwerkRef,
				function (snapshot) {

					/* -----------------------------------
					Bereits vorhandene Raketen ignorieren
					----------------------------------- */

		if (ersteDatenlieferung) {

			ersteDatenlieferung = false;

			/* Vorhandene Spielerdaten lesen */

			const spielerDaten =
				snapshot.val() || {};

			/* Letzte Raketennummer je Spieler merken */

			Object.keys(spielerDaten).forEach(
				function (uid) {

					letzteNummern[uid] =
						spielerDaten[uid]?.letzteNummer || 0;

				}
			);

			return;
		}

					/* Ende vorhandene Raketen ignorieren */

					/* -----------------------------------
					Neue Raketen aller Spieler erkennen
					----------------------------------- */

					const spielerDaten = snapshot.val() || {};

					Object.keys(spielerDaten).forEach(function (uid) {

						const spieler = spielerDaten[uid];

						if (!spieler || !spieler.raketen) {
							return;
						}

						const aktuelleNummer =
							Number(spieler.letzteNummer) || 0;

						const bekannteNummer =
							letzteNummern[uid];

						/* Neuer Spieler im Listener */

						if (bekannteNummer === undefined) {
							letzteNummern[uid] = 0;
						}

						const vorherigeNummer =
							letzteNummern[uid];

						/* Keine neue Rakete vorhanden */

						if (aktuelleNummer <= vorherigeNummer) {
							return;
						}

						/* Neue Raketen aus den fünf Plätzen sammeln */

						const neueRaketen =
							Object.values(spieler.raketen)
								.filter(function (rakete) {

									return (
										rakete &&
										rakete.nummer > vorherigeNummer &&
										rakete.nummer <= aktuelleNummer
									);

								})
								.sort(function (a, b) {

									return a.nummer - b.nummer;

								});

						/* Neue Raketen einzeln verarbeiten */

						neueRaketen.forEach(function (rakete) {

							/* Nur aktuelle Ereignisse berücksichtigen */

							if (
								!Number.isFinite(rakete.zeitpunkt) ||
								Math.abs(Date.now() - rakete.zeitpunkt) > 5000
							) {
								return;
							}

							console.log(
								"Feuerwerk: Neue Rakete empfangen:",
								uid,
								rakete
							);

							/* -----------------------------------
							Rakete auf der richtigen Karte anzeigen
							----------------------------------- */

							if (
								rakete.karte !==
								window.aktuelleSpielerPosition?.karte
							) {
								return;
							}

							if (
								!window.reservatFeuerwerk ||
								typeof window.reservatFeuerwerk.start !== "function"
							) {
								return;
							}

				/* -----------------------------------
				Rakete mit Sound starten
				----------------------------------- */

				const gestartet =
					window.reservatFeuerwerk.start({
						position: {
							x: rakete.x,
							y: rakete.y
						},
						palette: rakete.palette,
						groesse: rakete.groesse,
						seed: rakete.seed,
						vonFirebase: true
					});

				if (
					gestartet === true &&
					typeof window.reservatSoundAbspielen === "function"
				) {

				/* -----------------------------------
				Entfernung zur Rakete berechnen
				----------------------------------- */

				const spielerPosition =
					window.aktuelleSpielerPosition;

				const entfernung =
					window.reservatSoundEntfernung(
						spielerPosition.x,
						spielerPosition.y,
						[[rakete.x, rakete.y]]
					);

				/* -----------------------------------
				Lautstärke nach Entfernung bestimmen
				----------------------------------- */

				const lautstaerke =
					window.reservatSoundLautstaerke(
						entfernung,
						5,
						0.4
					);

				/* -----------------------------------
				Feuerwerkssound abspielen
				----------------------------------- */

				if (lautstaerke > 0) {

					window.reservatSoundAbspielen(
						"Daten/Sounds/Effekte/Rakete_Start_Boeller_3_1s.ogg",
						lautstaerke
					);

				}

				/* Ende entfernungsabhängiger Feuerwerkssound */

				}

				/* Ende Rakete mit Sound starten */

							/* Ende empfangene Rakete anzeigen */

						});

						/* Letzte verarbeitete Nummer merken */

						letzteNummern[uid] = aktuelleNummer;

					});

					/* Ende neue Raketen erkennen */

				},

				function (fehler) {

					console.error(
						"Feuerwerk: Firebase-Lesefehler:",
						fehler
					);

					/* Listener ist nicht mehr aktiv */
					listenerBeenden = null;

				}
            );

        console.log(
            "Feuerwerk: Listener gestartet."
        );

    } /* Ende Feuerwerks-Listener starten */


    /* -----------------------------------
    Feuerwerks-Listener beenden
    ----------------------------------- */

    function beenden() {

        if (listenerBeenden !== null) {

            listenerBeenden();
            listenerBeenden = null;

            console.log(
                "Feuerwerk: Listener beendet."
            );
        }

    } /* Ende Feuerwerks-Listener beenden */

    /* -----------------------------------
    Raketenstart in Firebase speichern
    ----------------------------------- */

    async function raketeSpeichern(rakete) {

        /* Firebase-Verfügbarkeit prüfen */

        if (
            !window.firebaseDatabase ||
            !window.firebaseRef ||
            !window.firebaseRunTransaction
        ) {
            console.warn(
                "Feuerwerk: Firebase noch nicht bereit."
            );
            return;
        }

        /* -----------------------------------
		Angemeldeten Spieler ermitteln
		----------------------------------- */

		const spieler =
			window.firebaseAuth?.currentUser;

		if (!spieler) {
			console.warn(
				"Feuerwerk: Kein Spieler angemeldet."
			);
			return;
		}

		const uid = spieler.uid;

		/* Ende angemeldeten Spieler ermitteln */

		/* -----------------------------------
		Firebase-Speicherort festlegen
		----------------------------------- */

		const spielerFeuerwerkRef =
			window.firebaseRef(
				window.firebaseDatabase,
				"realtime/effects/fireworks/" + uid
			);

		/* Ende Firebase-Speicherort festlegen */

		/* -----------------------------------
		Rakete im Fünfer-Ringspeicher ablegen
		----------------------------------- */

		try {

			await window.firebaseRunTransaction(
				spielerFeuerwerkRef,
				function (bisherigeDaten) {

					const daten = bisherigeDaten || {
						letzteNummer: 0,
						raketen: {}
					};

					const nummer =
						(daten.letzteNummer || 0) + 1;

					const platz =
						String(((nummer - 1) % 5) + 1);

					daten.letzteNummer = nummer;

					daten.raketen[platz] = {
						nummer: nummer,
						karte: rakete.karte,
						x: rakete.x,
						y: rakete.y,
						palette: rakete.palette,
						groesse: rakete.groesse,
						seed: rakete.seed,
						zeitpunkt: Date.now()
					};

					return daten;
				}
			);

		} catch (fehler) {

			console.error(
				"Feuerwerk: Rakete konnte nicht gespeichert werden:",
				fehler
			);

		}

		/* Ende Rakete im Fünfer-Ringspeicher ablegen */

    } /* Ende Raketenstart speichern */

    /* -----------------------------------
    Funktionen bereitstellen
    ----------------------------------- */

		window.reservatFeuerwerkFirebase = {
			starten,
			beenden,
			raketeSpeichern
		};

    /* Ende Funktionen bereitstellen */

})();

/* Ende Reservat - Feuerwerk Firebase */