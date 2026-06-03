// ===============
// === KNAPPER ===
// ===============

// Hjælpefunktion til at tilføje click-eventlisteners
function klik(id, handler) {
    document.getElementById(id).addEventListener('click', handler)
}

// Dark mode
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Sektionskjulere
['grundlaeggende', 'status', 'beredskab', 'evner', 'inventar-og-noter'].forEach(sektion => {
    klik(`${sektion}-titel`, () => toggleSektion(sektion));
});

// Grundlæggende
klik('draabe-toggle', () => visJustering('draabe'));
klik('draabe-justering-minus', fjernDraaber);
klik('draabe-justering-plus', tilfoejDraaber);
klik('draaber-efterladt-beholder', samlDraaber);

// Beredskab
['basisskade', 'udstyr', 'cyklus', 'magi'].forEach(fane => {
    klik(`${fane}-titel`, () => {
        vaelgFane(fane)
    })
});

// Karakterhåndtering
klik('rediger-knap', () => aabenVindue('karakter'));

klik('eksporter-knap', eksporterData);
klik('importer-knap', importerData);
klik('ny-karakter', () => {
    lukVindue('karakter');
    aabenVindue('ny-karakter')
});
klik('nulstil-knap', () => {
    lukVindue('karakter');
    aabenVindue('nulstil-karakter');}
);
klik('annuller-karakter', () => {
    if (document.getElementById('beholder').style.display === 'none') return;
    lukVindue('karakter')}
);


['asket', 'bytyv', 'forkynder', 'hedonist', 'lovloes', 'laerd', 'militarist'].forEach(klasse => {
    klik(`${klasse}-knap`, () => hentStandardKlasse(klasse));
});

klik('annuller-ny-karakter', () => {
    lukVindue('ny-karakter');
    aabenVindue('karakter');
});


klik('bekraeft-nulstil', () => {
    nulstilData();
    lukVindue('nulstil-karakter');
    lukVindue('ny-karakter');
});

klik('annuller-nulstil', () => {
    lukVindue('nulstil-karakter');
    aabenVindue('karakter');
});

// Status
klik('status-toggle', visStatusJusteringer);

klik('liv-status', () => visJustering('liv'));
klik('liv-justering-minus', livSkade);
klik('liv-justering-plus', livGenvind);

klik('sejd-status', () => visJustering('sejd'));
klik('sejd-justering-minus', sejdBrug);
klik('sejd-justering-plus', sejdGenvind);

klik('hu-status', () => visJustering('hu'));
klik('hu-justering-regen', huRegen);
klik('hu-justering-minus', huBrug);
klik('hu-justering-plus', huGenvind);

klik('flasker', () => visJustering('flaske'));
klik('flaske-liv', () => drikFlaske('liv'));
klik('flaske-sejd', () => drikFlaske('sejd'));
klik('flaske-laesion', () => drikFlaske('laesion'));

// Statuseffekter
klik('sekvens', () => visJustering('sekvens'));
klik('sekvens-saet', saetSekvens);

klik('haab', () => visJustering('haab'));
klik('haab-justering-minus', () => justerStat('haab', -1, 0, 3));
klik('haab-justering-plus', () => justerStat('haab', 1, 0, 3));

klik('forvitring', () => visJustering('forvitring'));
klik('forvitring-justering-minus', () => justerStat('forvitring', -1));
klik('forvitring-justering-plus', () => justerStat('forvitring', 1));

klik('udmattelse', () => visJustering('udmattelse'));
klik('udmattelse-justering-minus', () => justerStat('udmattelse', -1));
klik('udmattelse-justering-plus', () => justerStat('udmattelse', 1));

klik('laesioner', () => visJustering('laesioner'));
klik('laesioner-justering-minus', () => justerStat('laesioner', -1));
klik('laesioner-justering-plus', () => justerStat('laesioner', 1));



// Hvile
klik('hvil-knap', () => aabenVindue('hvil'));
klik('bekraeft-hvil', hvil);

// Evneforbedring
    klik('bekraeft-evne', bekraeftEvneForbedringer);
    klik('annuller-evne', () => lukVindue('evneforbedring'));
    klik('evneforbedringsknap', () => initEvneVindue());

// Færdigheder
    klik('faerdighedsknap', () => aabenVindue('faerdighed-menu'));
    klik('annuller-faerdighed-menu', () => lukVindue('faerdighed-menu'));

    klik('faerdighed-valg-knap', () => {
        aabenVindue('faerdighed-valg');
        opdaterValgsKort();
    });
    klik('annuller-faerdighed-valg', () => lukVindue('faerdighed-valg'));

    klik('faerdighed-laer-knap', () => {
        aabenVindue('faerdighed-laer');
        opdaterLaerKort();
    });
    klik('annuller-faerdighed-laer', () => lukVindue('faerdighed-laer'));

// Besværgelser
    klik('besvaergelsesknap', () => {
        aabenVindue('magi');
        opdaterMagiKortValg();
    });
    klik('laer-magi-knap', () => tilfoejMagi());
    klik('annuller-magi', () => lukVindue('magi'));

// Død
    klik('doed-valg-knap', () => aabenVindue('doed'));
    klik('annuller-hvil', () => lukVindue('hvil'));

    klik('bekraeft-doed', () => {
        doed();
        lukVindue('doed');
        lukVindue('hvil');
    });
    klik('annuller-doed', () => lukVindue('doed'));

    klik('vitalitet-valg-knap', () => aabenVindue('vitalitet'));
    klik('bekraeft-vitalitet', () => {
        genskabVitalitet();
        lukVindue('vitalitet');
        lukVindue('hvil');
    });
    klik('annuller-vitalitet', () => lukVindue('vitalitet'));



// Våben
klik('vaaben-liste-knap', genererVaabenliste);
klik('tilfoej-vaaben-knap', tilfoejVaaben);

// Evner
klik('evne-toggle', visEvneJusteringer);
['form', 'sind', 'intuition', 'styrke', 'behaendighed', 'visdom', 'mystik'].forEach(evne => {
    klik(evne + '-evne', () => visJustering(evne + '-forskydning'));
    klik(evne + '-forskydning-justering-minus', () => forskydningMinus(evne));
    klik(evne + '-forskydning-justering-plus', () => forskydningPlus(evne));
});

// Inventar og noter
klik('inventar-vis-skjul', () => toggleVisSkjul('inventar-vis-skjul', 'inventar-emner'));
klik('noter-vis-skjul', () => toggleVisSkjul('noter-vis-skjul', 'noter-input'));

klik('inventar-emner', initInventar);
klik('minus-flaske', () => aendrInventar('flaske', -1));
klik('plus-flaske', () => aendrInventar('flaske', 1));
klik('minus-stenskaar', () => aendrInventar('stenskaar', -1));
klik('plus-stenskaar', () => aendrInventar('stenskaar', 1));
klik('luk-inventar', () => lukVindue('inventar'));



// Våbenvindue
klik('luk-vaabenliste', () => lukVindue('vaabenliste'));
klik('nyt-vaaben-knap', () => aabnVaabendetaljevindue(null));

document.querySelectorAll('#vaaben-basis-toggle .vaabendetaljer__opgraderingsselektor').forEach(el => {
    el.addEventListener('click', () => {
        vaabenRedigeringData.basis = el.dataset.basis;
        opdaterVaabenBasisToggle();
    });
});

klik('aaben-vaabenopgradering', () => aabnVaabenopgraderingsvindue());
klik('gem-vaaben', gemVaaben);
klik('slet-vaaben', () => visJustering('slet-vaaben-bekraeft'));
klik('slet-vaaben-annuller', () => visJustering('slet-vaaben-bekraeft'));
klik('slet-vaaben-slet', sletVaaben);

klik('annuller-vaabendetalje', () => {
    lukVindue('vaabendetalje');
    genererVaabenliste();
});

// Opgraderingsvindue
klik('vaabenopg-minus', () => aendrVaabenOpgraderingNiveau(-1));
klik('vaabenopg-plus', () => aendrVaabenOpgraderingNiveau(1));
klik('vaabenopg-smedje', () => {
    opgraderingVedVandsten = false;
    opdaterVaabenopgraderingsvindue();
});
klik('vaabenopg-vandsten', () => {
    opgraderingVedVandsten = true;
    opdaterVaabenopgraderingsvindue();
});
klik('bekraeft-vaabenopgradering', bekraeftVaabenopgradering);
klik('annuller-vaabenopgradering', () => lukVindue('vaabenopgradering'));





// ==========================
// === KEYBOARD SHORTCUTS ===
// ==========================

// Enter ved input
document.getElementById('liv-input').addEventListener('keydown', (e) =>{if (e.key === 'Enter') livSkade();});
document.getElementById('sejd-input').addEventListener('keydown', (e) =>{if (e.key === 'Enter') sejdBrug();});
document.getElementById('draaber-input').addEventListener('keydown', (e) => {if (e.key === 'Enter') tilfoejDraaber();});
document.getElementById('sekvens-input').addEventListener('keydown', (e) => {if (e.key === 'Enter') saetSekvens();});
document.getElementById('tilfoej-magi-input').addEventListener('keydown', (e) => {if (e.key === 'Enter') tilfoejMagi();});
document.getElementById('tilfoej-vaaben-input').addEventListener('keydown', (e) => {if (e.key === 'Enter') tilfoejVaaben();});


// Luk vinduer
document.querySelectorAll('.vindue__baggrund').forEach(vindue => {
    vindue.addEventListener('click', (e) => {
        if (e.target !== vindue) return;
        if (document.getElementById('beholder').style.display === 'none') return;
        vindue.style.display = 'none';
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('beholder').style.display === 'none') return;
    document.querySelectorAll('.vindue__baggrund').forEach(vindue => {
        vindue.style.display = 'none';
    });
});





// ===============
// === DIVERSE ===
// ===============

// Håndter textarea-størrelse
document.getElementById('noter-input').addEventListener('input', (e) => {
    karakter.noter = e.target.value;
    opdaterNoteOmraade('noter-input');
    gemData();
});

document.getElementById('vaaben-detalje-beskrivelse').addEventListener('input', () => {
    opdaterNoteOmraade('vaaben-detalje-beskrivelse');
});

document.getElementById('vaaben-detalje-teknik').addEventListener('input', () => {
    opdaterNoteOmraade('vaaben-detalje-teknik');
});

document.getElementById('vaaben-noter-input').addEventListener('input', () => {
    opdaterNoteOmraade('vaaben-noter-input');
});



// Gem karakternavn, klasse
document.getElementById('karakterNavn').addEventListener('input', (e) => {
    karakter.navn = e.target.value;
    gemData();
});

document.getElementById('karakterKlasse').addEventListener('input', (e) => {
    karakter.klasse = e.target.value;
    gemData();
});



// Propagation-stoppers
document.querySelectorAll('.justering').forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

document.getElementById('draaber-efterladt-beholder').addEventListener('click', (e) => {
    e.stopPropagation();
});



// Importer-input
document.getElementById('importer-input').addEventListener('change', (e) => {
    const fil = e.target.files[0];
    if (!fil) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            Object.assign(karakter, data);
            if (!karakter.vaaben) karakter.vaaben = [];
            if (!karakter.draaberEfterladt) karakter.draaberEfterladt = 0;
            opdaterVistData();
            visArk();
            visBesked('Karakter indlæst.');
        } catch {
            visBesked('Fejl: Kunne ikke læse filen.');
        }
    };
    reader.readAsText(fil);
    e.target.value = '';
    lukVindue('karakter');
});





// ======================
// === INITIALISERING ===
// ======================
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

indlaesSpilData();

if (!localStorage.getItem('karakterark')) {
    document.getElementById('beholder').style.display = 'none';
    document.getElementById('eksporter-knap').style.display = 'none';
    aabenVindue('karakter');
}