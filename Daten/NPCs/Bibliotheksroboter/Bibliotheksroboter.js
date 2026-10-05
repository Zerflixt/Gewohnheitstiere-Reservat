/* =========================================================
BIBLIOTHEKSROBOTER - DIALOG ANZEIGEN
========================================================= */

window.bibliotheksroboterDialogAnzeigen =
function (sonderfeld) {

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

    roboter.src =
        "Daten/NPCs/Bibliotheksroboter/" +
        "NPC_Hilfsrobo_03.png";

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
