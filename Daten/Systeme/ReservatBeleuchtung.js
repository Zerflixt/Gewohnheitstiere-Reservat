
/* =========================================================
   GEWOHNHEITSTIERE-RESERVAT
   ZENTRALE BELEUCHTUNGSSTEUERUNG

   Version 1.0

   Aufgaben:
   - Grundhelligkeit bestimmen
   - Lichtquellen berücksichtigen
   - Helligkeit von Objekten berechnen
   - Bestehende Grafikeffekte erhalten

   Ausbau erfolgt schrittweise.
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------
       Helligkeit begrenzen

       Zulässiger Bereich: 0 bis 1
       ----------------------------------------- */

    function helligkeitBegrenzen(wert) {

        const zahl = Number(wert);

        if (!Number.isFinite(zahl)) {
            return 1;
        }

        return Math.max(
            0,
            Math.min(1, zahl)
        );
    }

    /* Ende Helligkeit begrenzen */


    /* -----------------------------------------
       Grundhelligkeit bestimmen

       Erste Testversion:
       Alle Objekte bleiben normal hell.

       Tageszeit, Disco und Lichtquellen
       werden später ergänzt.
       ----------------------------------------- */

    function helligkeitBestimmen(karte) {

        /* -----------------------------------------
           Grundhelligkeit bestimmen

           Tagsüber: volle Helligkeit
           Nordstrand nachts: 35 %
           ----------------------------------------- */

        let helligkeit = 1;

        if (
            karte === "strand_nord" &&
            typeof window.reservatTageszeitBestimmen === "function" &&
            window.reservatTageszeitBestimmen() === "nacht"
        ) {

            helligkeit = 0.35;

        }

        /* Ende Grundhelligkeit Nordstrand */

        /* -----------------------------------------
           Disco-Beleuchtung berücksichtigen

           Nur im Tiertreff.
           Andere Karten bleiben unverändert.
           ----------------------------------------- */

        if (
            karte === "tiertreff_innen" &&
            typeof window.tiertreffDiscoAktuellerSong === "function" &&
            typeof window.tiertreffDiscoRaumlichtBestimmen === "function"
        ) {

            const song =
                window.tiertreffDiscoAktuellerSong();

            if (song) {

                const lichtzustand =
                    window.tiertreffDiscoRaumlichtBestimmen(
                        song.songId,
                        song.positionSekunden
                    );

                if (lichtzustand === "dunkel") {
                    helligkeit = 0.35;
                }

            }

        }

        return helligkeitBegrenzen(helligkeit);

    }
    /* Ende Grundhelligkeit */

    /* -----------------------------------------
       Lichtquellen berücksichtigen

       Berechnet die Helligkeit an einer
       bestimmten Position auf einer Karte.

       Mehrere Lichtquellen überlagern sich.
       Während der Disco maximal 80 %.
       ----------------------------------------- */

    function lichtquellenHelligkeitBestimmen(karte, x, y) {

        const grundhelligkeit =
            helligkeitBestimmen(karte);

        const kartendaten =
            window.reservatKarten?.[karte];

        if (
            !kartendaten ||
            !Array.isArray(kartendaten.lichtquellen) ||
            !Number.isFinite(x) ||
            !Number.isFinite(y)
        ) {
            return grundhelligkeit;
        }

        let helligkeit = grundhelligkeit;

        /* Alle Lichtquellen der Karte durchgehen */

        kartendaten.lichtquellen.forEach(function (quelle) {

            /* Disco-Quellen nur bei dunklem Raumlicht */

            if (
                quelle.aktivBei === "disco" &&
                grundhelligkeit !== 0.35
            ) {
                return;
            }

            /* Nachtquellen nur nachts */

            if (
                quelle.aktivBei === "nacht" &&
                (
                    typeof window.reservatTageszeitBestimmen !== "function" ||
                    window.reservatTageszeitBestimmen() !== "nacht"
                )
            ) {
                return;
            }

            const reichweite = Number(quelle.reichweite);
            const maximum = Number(quelle.maxHelligkeit);

            if (
                !Number.isFinite(reichweite) ||
                reichweite <= 0 ||
                !Number.isFinite(maximum) ||
                !Array.isArray(quelle.quellfelder)
            ) {
                return;
            }

            /* Nächste Position dieser Lichtquelle */

            let entfernung = Infinity;

            quelle.quellfelder.forEach(function (feld) {

                if (!Array.isArray(feld) || feld.length < 2) {
                    return;
                }

                const abstand = Math.hypot(
                    x - feld[0],
                    y - feld[1]
                );

                entfernung = Math.min(entfernung, abstand);

            });

            if (entfernung >= reichweite) {
                return;
            }

            /* Linear abnehmender Lichtbeitrag */

            const beitrag =
                Math.max(0, maximum - grundhelligkeit) *
                (1 - entfernung / reichweite);

            helligkeit += beitrag;

        });

        /* Gesamthelligkeit auf 100 % begrenzen */

        const obergrenze = 1;

        return helligkeitBegrenzen(
            Math.min(helligkeit, obergrenze)
        );

    }

    /* Ende Lichtquellenberechnung */


    /* -----------------------------------------
       Öffentliche Schnittstelle
       ----------------------------------------- */

    window.reservatBeleuchtung = {

        version: "1.0",

        helligkeitBestimmen:
            helligkeitBestimmen,

        lichtquellenHelligkeitBestimmen:
            lichtquellenHelligkeitBestimmen

    };

    /* Ende öffentliche Schnittstelle */

})();

/* Ende zentrale Beleuchtungssteuerung */
