let standardKlasser = [];
let alleVaaben = [];
let alleBesvaergelser = [];
let klasseFaerdigheder = [];
let evneFaerdigheder = [];
let alleFaerdigheder = [];
let altUdstyr = [];

// Karakterobjektet
let karakter = {
    navn: "",
    klasse: "",
    draaber: 0,
    draaberEfterladt: 0,

    livNu: 1,
    sejdNu: 1,
    huNu: 1,

    sekvens: 0,
    haab: 0,
    forvitring: 0,
    laesioner: 0,
    udmattelse: 0,

    form: 1,
    sind: 1,
    intuition: 1,
    styrke: 1,
    behaendighed: 1,
    visdom: 1,
    mystik: 1,

    forskydning: {
        form: 0,
        sind: 0,
        intuition: 0,
        styrke: 0,
        behaendighed: 0,
        visdom: 0,
        mystik: 0,
    },

    faerdigheder: [],
    valgteFaerdigheder: [],
    brugteFaerdigheder: [],

    vaaben: [],
    valgteVaaben: [],

    udstyr: [],
    valgtUdstyr: [],

    besvaergelser: [],
    valgteBesvaergelser: [],

    stenskaar: 0,
    flaskerMax: 1,
    flaskerNu: 1,
    endeligtDoed: false,

    noter: "",

    arktilstand: {
        fysiskskade: true,
        aktivfane: ''
    }
}

let effektiveEvner = {};
let udstyrEffekter = {};



// ===============
// === VISNING ===
// ===============

// Visningsfunktionen
function opdaterVistData() {
    opdaterEffektiveEvner();
    opdaterGrundlaeggende();
    opdaterRessourcer();
    opdaterStatus();
    opdaterEvner();
    opdaterInventarOgNoter();
    opdaterBeredskab();
    opdaterArkTilstand();
    gemData();
    opdaterDoedVisning();
}

function opdaterEffektiveEvner() {
    const udstyrForskydning = beregnUdstyrForskydning();
    for (const evne of evneNoegler) {
        effektiveEvner[evne] = karakter[evne] 
            + (karakter.forskydning[evne] ?? 0) 
            + (udstyrForskydning[evne] ?? 0);
    }
}

function opdaterGrundlaeggende() {
    document.getElementById('karakterNavn').value = karakter.navn;
    document.getElementById('karakterKlasse').value = karakter.klasse;
    const level = karakter.form + karakter.sind + karakter.intuition +
        karakter.styrke + karakter.behaendighed + karakter.visdom + karakter.mystik;
    document.getElementById('karakterLevel').textContent = level;
    document.getElementById('draaber').textContent = karakter.draaber;
    document.getElementById('draaber-efterladt').textContent = karakter.draaberEfterladt;
    document.getElementById('draaber-efterladt-beholder').classList.toggle('aktiv', karakter.draaberEfterladt > 0);
}

function opdaterRessourcer() {
    beregnRessourcer();
    saetRessourcer();
    opdaterBarer();
    opdaterFlaskeIkoner();
}

function opdaterStatus() {
    document.getElementById('sekvens-vaerdi').textContent = karakter.sekvens;
    document.getElementById('sekvens-pulje').textContent = beregnSekvensPulje();
    document.getElementById('haab-vaerdi').textContent = karakter.haab;
    document.getElementById('forvitring-vaerdi').textContent = karakter.forvitring;
    document.getElementById('udmattelse-vaerdi').textContent = karakter.udmattelse;
    document.getElementById('laesioner-vaerdi').textContent = karakter.laesioner;
}

function opdaterEvner() {
    opdaterEvne('form', effektiveEvner.form);
    opdaterEvne('sind', effektiveEvner.sind);
    opdaterEvne('intuition', effektiveEvner.intuition);
    opdaterEvne('styrke', effektiveEvner.styrke);
    opdaterEvne('behaendighed', effektiveEvner.behaendighed);
    opdaterEvne('visdom', effektiveEvner.visdom);
    opdaterEvne('mystik', effektiveEvner.mystik);
}

function opdaterInventarOgNoter() {
    document.getElementById('stenvandsflasker').textContent = karakter.flaskerMax;
    document.getElementById('stenskaar').textContent = karakter.stenskaar;

    document.getElementById('noter-input').value = karakter.noter;
    opdaterNoteOmraade('noter-input');
}

function opdaterBeredskab() {
    opdaterVaabenRaekke();
    opdaterVaabenKort();
    opdaterFaerdighedKortBrug();
    opdaterMagiKortBrug();
    opdaterUdstyrKortBeredskab();
}

function opdaterDoedVisning() {
    if (karakter.endeligtDoed) {
        document.getElementById('endeligtdoed').style.display = 'block';
    } else {
        document.getElementById('endeligtdoed').style.display = 'none';
    }
}

function opdaterArkTilstand() {
    visSkadetype();
    visFane();
}



// Vis besked
function visBesked(tekst) {
    const container = document.getElementById('besked-beholder');
    const el = document.createElement('div');
    el.className = 'besked';
    el.textContent = tekst;
    container.appendChild(el);
    el.addEventListener('click', () => fjernBesked(el));
    el._timer = setTimeout(() => fjernBesked(el), 6000);
}

function fjernBesked(el) {
    clearTimeout(el._timer);
    el.classList.add('ud');
    el.addEventListener('animationend', () => el.remove(), { once: true });
}

// Skjul sektioner
function toggleSektion(type) {
    const sektion = document.getElementById(type + '-indhold');
    sektion.classList.toggle('skjul-indhold');
}

// Vælg fane
function vaelgFane(type) {
    karakter.arktilstand.aktivfane = type;
    visFane();
}

function visFane() {
    const type = karakter.arktilstand.aktivfane;
    document.querySelectorAll('.faneblad--aktiv, .fane__titel--aktiv').forEach(el => {
        el.classList.remove('faneblad--aktiv', 'fane__titel--aktiv');
    });

    document.getElementById(`${type}-indhold`).classList.add('faneblad--aktiv');
    document.getElementById(`${type}-titel`).classList.add('fane__titel--aktiv');
}

// Vis/skjul justeringer
function visJustering(type) {
    if (erEndeligDoed() && type !== 'forvitring') return;

    const justering = document.getElementById(type + '-justering');
    justering.classList.toggle('justering--aktiv');
}

function visStatusJusteringer() {
    if (erEndeligDoed()) return;

    const justeringer = document.querySelectorAll('.sektion__status .justering');
    const alleAktive = Array.from(justeringer).every(el => el.classList.contains('justering--aktiv'));
    justeringer.forEach(el => {
        el.classList.toggle('justering--aktiv', !alleAktive);
    });
}

function visEvneJusteringer() {
    if (erEndeligDoed()) return;
    
    const justeringer = document.querySelectorAll('.justering--evne-forskydning');
    const alleAktive = Array.from(justeringer).every(el => el.classList.contains('justering--aktiv'));
    justeringer.forEach(el => {
        el.classList.toggle('justering--aktiv', !alleAktive);
    });
}

// Vis/skjul-knapper
function toggleVisSkjul(knapId, indholdId) {
    const knap = document.getElementById(knapId);
    const indhold = document.getElementById(indholdId);
    const erSkjult = indhold.classList.toggle('skjul-indhold');
    knap.classList.toggle('skjult');
}

// Åben/luk vinduer
function aabenVindue(vindueId) {
    const tilladte = ['karakter', 'ny-karakter', 'nulstil-karakter'];
    if (erEndeligDoed() && !tilladte.includes(vindueId)) return;
    
    document.getElementById(vindueId + '-vindue').style.display = 'flex';
}

function lukVindue(vindueId) {
    document.getElementById(vindueId + '-vindue').style.display = 'none';
}

// Vis ark
function visArk() {
    document.getElementById('beholder').style.display = '';
    document.getElementById('eksporter-knap').style.display = '';
}



// =======================
// === HJÆLPEBEREGNERE ===
// =======================

function beregnUdstyrForskydning() {
    const resultat = { form: 0, sind: 0, intuition: 0, styrke: 0, behaendighed: 0, visdom: 0, mystik: 0 };
    karakter.valgtUdstyr.forEach(id => {
        const udstyr = altUdstyr.find(u => u.id === id);
        if (!udstyr?.forskydning) return;
        for (const [evne, værdi] of Object.entries(udstyr.forskydning)) {
            if (evne in resultat) resultat[evne] += værdi;
        }
    });
    return resultat;
}

// Få den her til at virke:
function beregnUdstyrEffekter() {
    const resultat = { huRegen: 0, mentalForsvar: 0 };
    karakter.valgtUdstyr.forEach(id => {
        const udstyr = altUdstyr.find(u => u.id === id);
        if (!udstyr?.effekt) return;
        for (const [effekt, værdi] of Object.entries(udstyr.effekt)) {
            if (effekt in resultat) resultat[effekt] += værdi;
        }
    });
    return resultat;
}

// Ressourcer
function beregnRessourcer() {
    const vitalMax = beregnVitalMax(effektiveEvner.form);
    karakter.livVital = vitalMax;
    karakter.livMax = karakter.livVital - (karakter.forvitring * Math.ceil(karakter.livVital / 20));
    if (karakter.livNu > karakter.livMax) karakter.livNu = karakter.livMax;

    if (karakter.livMax > 0) {
        karakter.endeligtDoed = false;
    } else if (karakter.livMax <= 0) {
        karakter.endeligtDoed = true;
    }

    const sejdMax = beregnSejdMax(effektiveEvner.sind);
    karakter.sejdMax = Math.max(0, sejdMax);
    if (karakter.sejdNu > karakter.sejdMax) karakter.sejdNu = karakter.sejdMax;

    const huMax = Math.max(1, beregnHuMax(effektiveEvner.intuition) - karakter.laesioner);
    const huRegen = Math.max(0, beregnHuRegen(effektiveEvner.intuition) - karakter.udmattelse);
    karakter.huMax = huMax;
    karakter.huRegen = huRegen;
    if (karakter.huNu > karakter.huMax) karakter.huNu = karakter.huMax;
}

function saetRessourcer() {
    document.getElementById('livVital').textContent = karakter.livVital;
    document.getElementById('rustningsgrad').textContent = hentRustningsgrad();
    document.getElementById('livMax').textContent = karakter.livMax;
    document.getElementById('livNu').textContent = karakter.livNu;
    document.getElementById('sejdMax').textContent = karakter.sejdMax;
    document.getElementById('sejdNu').textContent = karakter.sejdNu;
    document.getElementById('huMax').classList.toggle('reduceret', karakter.huMax < beregnHuMax(effektiveEvner.intuition));
    document.getElementById('huRegen').classList.toggle('reduceret', karakter.huRegen < beregnHuRegen(effektiveEvner.intuition));
    document.getElementById('huMax').textContent = karakter.huMax;
    document.getElementById('huRegen').textContent = karakter.huRegen;
    document.getElementById('huNu').textContent = karakter.huNu;
    document.getElementById('flaskerNu').textContent = karakter.flaskerNu;
    document.getElementById('flaskerMax').textContent = karakter.flaskerMax;
}

function opdaterBarer() {
    opdaterLivBar();
    opdaterSejdBar();
    opdaterHuBar();
}

function opdaterLivBar() {
    if (karakter.livNu < 0) {
        document.getElementById('livBar').style.width = '0%';
    } else {

        const forvitringProcent = (karakter.livMax / karakter.livVital * 100).toFixed(0);
        document.getElementById('forvitringBar').style.width = forvitringProcent + '%';

        const livProcent = (karakter.livNu / karakter.livMax * 100).toFixed(0);
        document.getElementById('livBar').style.width = livProcent + '%';

    }
}

function opdaterSejdBar() {
    if (karakter.sejdNu < 0) {
        document.getElementById('sejdBar').style.width = '0%';
    } else {
    const sejdProcent = (karakter.sejdNu / karakter.sejdMax * 100).toFixed(0);
    document.getElementById('sejdBar').style.width = sejdProcent + '%';
    }
}

function opdaterHuBar() {
    if (karakter.huNu < 0) {
        document.getElementById('huBar').style.width = '0%';
    } else {
    const huProcent = (karakter.huNu / karakter.huMax * 100).toFixed(0);
    document.getElementById('huBar').style.width = huProcent + '%';
    }
}

function opdaterFlaskeIkoner() {
    const fyldte = '◉ '.repeat(karakter.flaskerNu).trim();
    const tomme = '○ '.repeat(karakter.flaskerMax - karakter.flaskerNu).trim();
    const ikoner = [fyldte, tomme].filter(s => s).join(' ');
    document.getElementById('flaske-ikoner').textContent = ikoner;
}

// Evner
function opdaterEvne(evne, level) {
    document.getElementById(evne + '-level').textContent = karakter[evne];
    const pulje = beregnPulje(level);
    document.getElementById(evne + '-pulje').textContent = pulje + 'd6';


    const forskudt = document.getElementById(evne + '-forskudt');
    const forskydningsTal = document.getElementById(evne + '-forskydning-vaerdi');
    ['evne__level--forskudt-op', 'evne__level--ikke-forskudt', 'evne__level--forskudt-ned'].forEach(cls => 
        forskudt.classList.remove(cls)
    );

    if (effektiveEvner[evne] === karakter[evne]) {
        forskudt.textContent = level;
        forskydningsTal.textContent = 0;
        forskudt.classList.add('evne__level--ikke-forskudt');
    } else if (effektiveEvner[evne] > karakter[evne]) {
        forskudt.textContent = level;
        forskydningsTal.textContent = '+' + karakter.forskydning[evne];
        forskudt.classList.add('evne__level--forskudt-op');
    } else if (effektiveEvner[evne] < karakter[evne]) {
        forskudt.textContent = level;
        forskydningsTal.textContent = karakter.forskydning[evne];
        forskudt.classList.add('evne__level--forskudt-ned');
    }
}



// Tjek endelig død
function erEndeligDoed() {
    if (!karakter.endeligtDoed) return false;
        visBesked('Du er endeligt død.');
        return true;
}

// Udregn pulje
function beregnPulje(level) {
    if (level <= 6) return 1;
    if (level <= 12) return 2;
    if (level <= 20) return 3;
    if (level <= 29) return 4;
    if (level <= 39) return 5;
    if (level <= 50) return 6;
    if (level <= 63) return 7;
    if (level <= 78) return 8;
    if (level <= 94) return 9;
    return 10;
}

// Liv, Sejd, Hu
function beregnVitalMax(form) {
    if (form <= 20) return form * 5;
    if (form <= 40) return 100 + (form - 20) * 4;
    if (form <= 60) return 180 + (form - 40) * 3;
    if (form <= 80) return 240 + (form - 60) * 2;
    if (form <= 100) return 280 + (form - 80) * 1;
    return 300 + (form - 100);
}

function beregnSejdMax(sind) {
    return sind;
}

function beregnHuMax(intuition) {
    if (intuition <= 9) return 5;
    if (intuition <= 29) return 6;
    if (intuition <= 49) return 7;
    if (intuition <= 69) return 8;
    if (intuition <= 89) return 9;
    return 10;
}

function beregnHuRegen(intuition) {
    if (intuition <= 19) return 4;
    if (intuition <= 39) return 5;
    if (intuition <= 69) return 6;
    return 7;
}

function beregnSekvensPulje() {
    const form = beregnPulje(effektiveEvner.form);
    const intuition = beregnPulje(effektiveEvner.intuition);
    const pulje = form + intuition + 'd6';
    return pulje;
}





// ==================
// === RESSOURCER ===
// ==================

// Dråber
function tilfoejDraaber() {
    const antal = parseInt(document.getElementById('draaber-input').value) || 0;
    karakter.draaber = Math.max(0, karakter.draaber + antal);
    document.getElementById('draaber-input').value = '';
    opdaterVistData();
}

function fjernDraaber() {
    const antal = parseInt(document.getElementById('draaber-input').value) || 0;
    karakter.draaber = Math.max(0, karakter.draaber - antal);
    document.getElementById('draaber-input').value = '';
    opdaterVistData();
}

function efterladDraaber() {
    const efterladte = document.getElementById('draaber-efterladt-beholder');
    karakter.draaberEfterladt = karakter.draaber;
    karakter.draaber = 0;
    if (karakter.draaberEfterladt === 0) {
        efterladte.classList.remove('aktiv');
    } else {
        efterladte.classList.add('aktiv');
    }
}

function samlDraaber() {
    const efterladteDraaber = karakter.draaberEfterladt;
    karakter.draaber = karakter.draaber + efterladteDraaber;
    karakter.draaberEfterladt = 0;
    document.getElementById('draaber-efterladt-beholder').classList.remove('aktiv');
    opdaterVistData();
    visBesked(`Du har samlet ${efterladteDraaber} Dråber op.`);
}

// Liv
function saetSkadetype(type) {
    if (type === 'fysisk') {
        karakter.arktilstand.fysiskskade = true;
    } else if (type === 'mental') {
        karakter.arktilstand.fysiskskade = false;
    }

    gemData();
    visSkadetype();
}

function visSkadetype() {
    const fysiskknap = document.getElementById('skadevalg-fysisk');
    const mentalknap = document.getElementById('skadevalg-mental');
    if (karakter.arktilstand.fysiskskade) {
        fysiskknap.classList.add('skadevaelger__valg--aktiv');
        mentalknap.classList.remove('skadevaelger__valg--aktiv');
    } else {
        fysiskknap.classList.remove('skadevaelger__valg--aktiv');
        mentalknap.classList.add('skadevaelger__valg--aktiv');
    }
}

function hentRustningsgrad() {
    let rustningsgrad = 0;
    karakter.valgtUdstyr.forEach(id => {
        const udstyr = altUdstyr.find(u => u.id === id);
        if (!udstyr?.effekt?.rustningsgrad) return;
        rustningsgrad += udstyr.effekt.rustningsgrad;
    });
    return rustningsgrad;
}

function livSkade() {
    const renSkade = parseInt(document.getElementById('liv-input').value) || 0;
    
    let endeligSkade = renSkade;
    if (karakter.arktilstand.fysiskskade) {
        const rustningsgrad = hentRustningsgrad();
        endeligSkade = Math.max(0, renSkade - rustningsgrad);
    }

    let nyLaesion = endeligSkade >= (karakter.livMax / 2);
    if (nyLaesion) {
        karakter.laesioner++;
    }

    karakter.livNu = Math.max(0, karakter.livNu - endeligSkade);
    gemData();
    document.getElementById('liv-input').value = '';
    opdaterVistData();

    if (nyLaesion) {
        visBesked('Du har fået en læsion.');
    }
}

function livGenvind() {
    const heletLiv = parseInt(document.getElementById('liv-input').value) || 0;
    karakter.livNu = Math.min(karakter.livMax, karakter.livNu + heletLiv);
    document.getElementById('liv-input').value = '';
    opdaterVistData();
}

// Sejd
function sejdBrug() {
    const forbrug = parseInt(document.getElementById('sejd-input').value) || 0;

    if (forbrug <= 0) return;

    if (karakter.sejdNu <= 0) {
        visBesked('Du har ikke mere Sejd.');
        return;
    };

    if (forbrug > karakter.sejdNu) {
        visBesked('Du har ikke nok Sejd.');
        return;
    }

    const nySejd = karakter.sejdNu - forbrug;

    if (nySejd === 0) {
        visBesked('Du løb tør for Sejd og er udmattet.')
        karakter.udmattelse++;
    };

    karakter.sejdNu = nySejd;
    document.getElementById('sejd-input').value = '';
    opdaterVistData();
}

function sejdGenvind() {
    const genvundet = parseInt(document.getElementById('sejd-input').value) || 0;

    if (genvundet <= 0) return;

    if (genvundet > 0 && karakter.sejdNu === 0 && karakter.udmattelse > 0) {
        karakter.udmattelse -= 1;
        visBesked('Du er ikke længere udmattet af Sejd-mangel.');
    }

    karakter.sejdNu = Math.min(karakter.sejdMax, karakter.sejdNu + genvundet);
    document.getElementById('sejd-input').value = '';
    opdaterVistData();
}

// Hu
function huBrug() {
    if (karakter.huNu === 0) {
        visBesked('Du har ikke nok Hu.');
        return;
    }
    
    karakter.huNu = karakter.huNu - 1;
    opdaterVistData();
    tjekBevidstloeshed();
}

function huGenvind() {
    karakter.huNu = Math.min(karakter.huMax, karakter.huNu +1);
    opdaterVistData();
}

function huRegen() {
    karakter.huNu = Math.min(karakter.huMax, karakter.huNu + karakter.huRegen);
    opdaterVistData();
    tjekBevidstloeshed();
}

function tjekBevidstloeshed() {
    if (karakter.huRegen === 0 && karakter.huNu === 0) {
        visBesked('Du er bevidstløs.');
    }
}

// Flasker
function drikFlaske(type) {
    if (karakter.flaskerNu <= 0) {
        visBesked('Du har ikke flere stenvandsflasker.');
        return;}

    if (type === 'liv') {
        if (karakter.livNu === karakter.livMax) {
            visBesked('Du har allerede fuld Liv.');
            return;
        }
        const flaskeLiv = Math.ceil(karakter.livMax / 2);
        karakter.livNu = Math.min(karakter.livMax, flaskeLiv + karakter.livNu);
        karakter.flaskerNu -= 1;
    } else if (type === 'sejd') {
        if (karakter.sejdNu === karakter.sejdMax) {
            visBesked('Du har allerede fuld Sejd.');
            return;
        }
        const flaskeSejd = Math.ceil(karakter.sejdMax / 2);
        if (karakter.sejdNu <= 0 && karakter.udmattelse > 0) {
            karakter.udmattelse -= 1;
        }
        karakter.sejdNu = Math.min(karakter.sejdMax, flaskeSejd + karakter.sejdNu);
        karakter.flaskerNu -= 1;
    } else if (type === 'laesion') {
        if (karakter.laesioner <= 0) {
            visBesked('Du har ingen læsioner.');
            return;
        }
        karakter.laesioner -= 1;
        karakter.flaskerNu -= 1;
    }

    karakter.huNu -= 1;

    opdaterVistData();
}



// ===============
// === STATIUS ===
// ===============

// Sekvens
function saetSekvens() {
    const sekvensInput = document.getElementById('sekvens-input');
    const nytSekvens = parseInt(sekvensInput.value) || 0;
    karakter.sekvens = nytSekvens;
    sekvensInput.value = '';
    opdaterVistData();
}

function justerStat(stat, aendring, min = 0, max = Infinity) {
    if (stat === 'udmattelse' && karakter.sejdNu === 0 && karakter.udmattelse === 1) {
        visBesked('Genvind Sejd for at lette din udmattelse.');
        return;
    };

    karakter[stat] = Math.max(min, Math.min(max, karakter[stat] + aendring));
    opdaterVistData();
}

// Vandsten
function hvil() {
    opdaterEffektiveEvner();
    if (karakter.sejdNu <= 0 && karakter.udmattelse > 0) {
        karakter.udmattelse -= 1;
    }
    karakter.laesioner = 0;
    karakter.livNu = karakter.livMax;
    karakter.sejdNu = karakter.sejdMax;
    karakter.huNu = beregnHuMax(effektiveEvner.intuition);
    karakter.flaskerNu = karakter.flaskerMax;
    karakter.brugteFaerdigheder = [];
    opdaterVistData();
    lukVindue('hvil');
}

function doed() {
    opdaterEffektiveEvner();
    const haabBesked = karakter.forvitring > 0 ? ' Rul 1d6, få 1 Håb på en træffer.' : '' ;
    karakter.forvitring++;
    const vitalMax = beregnVitalMax(effektiveEvner.form);
    const nyLivMax = vitalMax - (karakter.forvitring * Math.ceil(vitalMax * 0.05));
    karakter.livNu = Math.max(0, nyLivMax);
    
    efterladDraaber();
    
    if (nyLivMax <= 0) {
        karakter.endeligtDoed = true;
        visBesked('Du er endeligt død.');
        return;
    }

    if (karakter.draaberEfterladt > 0) {
        visBesked('Du er død og genopvågnet. Du har efterladt ' + karakter.draaberEfterladt + ' Dråber.' + haabBesked);
    } else {
        visBesked('Du er død og genopvågnet.' + haabBesked);
    }

    opdaterVistData();
}

function genskabVitalitet() {
    if (karakter.forvitring === 0) {
        visBesked('Du er allerede vital');
        return;
    }

    karakter.forvitring = 0;
    opdaterEffektiveEvner();
    beregnRessourcer();
    karakter.livNu = karakter.livVital;
    opdaterVistData();
    visBesked('Vitalitet genskabt!');
}



// =========================
// === BEREDSKAB OG KORT ===
// =========================

function tilfoejVaaben() {
    const input = document.getElementById('tilfoej-vaaben-input');
    const tekst = input.value || '';
    if (tekst === '') {return};

    const vaaben = alleVaaben.find(v => tekst.includes(v.id));

    if (!vaaben) {
        visBesked(`${tekst} kunne ikke findes.`);
        return;
    }

    karakter.vaaben.push({...vaaben});
    gemData();
    genererVaabenliste();
    visBesked(`Du har fået ${vaaben.navn}.`);
    input.value = '';
}

function tilfoejMagi() {
    const input = document.getElementById('tilfoej-magi-input');
    const tekst = input.value || '';
    if (tekst === '') {return};

    const besvaergelse = alleBesvaergelser.find(b => tekst.includes(b.id));

    if (!besvaergelse) {
        visBesked(`${tekst} kunne ikke findes.`);
        return;
    }

    karakter.besvaergelser.push(besvaergelse.id);
    gemData();
    opdaterMagiKortValg();
    visBesked(`Du har lært ${besvaergelse.navn}.`);
    input.value = '';
}

function tilfoejUdstyr() {
    const input = document.getElementById('tilfoej-udstyr-input');
    const tekst = input.value || '';
    if (tekst === '') {return};

    const udstyr = altUdstyr.find(u => tekst.includes(u.id));

    if (!udstyr) {
        visBesked(`${tekst} kunne ikke findes.`);
        return;
    }

    karakter.udstyr.push(udstyr.id);
    gemData();
    opdaterUdstyrKortVaelger();
    visBesked(`Du har fået ${udstyr.navn}.`);
    input.value = '';
}

// Våben
function opdaterVaabenRaekke() {
    const container = document.getElementById('vaaben-raekke');
    container.innerHTML = '';

    if (!karakter.vaaben || karakter.vaaben.length === 0) {
        const tom = document.createElement('div');
        tom.className = 'emne-raekke-tom';
        tom.textContent = 'Ingen våben.';
        container.appendChild(tom);
        return;
    }

    for (const vaaben of karakter.vaaben) {
        const erValgt = karakter.valgteVaaben.includes(vaaben.id);
        const el = document.createElement('div');
        el.className = 'emne-valg' + (erValgt ? ' aktiv' : '');
        el.textContent = vaaben.navn + (vaaben.opgradering > 0 ? ' +' + vaaben.opgradering : '');

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (karakter.valgteVaaben.includes(vaaben.id)) {
                karakter.valgteVaaben = karakter.valgteVaaben.filter(id => id !== vaaben.id);
            } else {
                karakter.valgteVaaben.push(vaaben.id);
            }
            gemData();
            opdaterVistData();
        });

        container.appendChild(el);
    }
}

function opdaterVaabenKort() {
    document.getElementById('basisskade-beholder').innerHTML = '';
    karakter.vaaben
        .filter(v => karakter.valgteVaaben.includes(v.id))
        .forEach(vaaben => genererVaabenKort(vaaben));
}

function genererVaabenKort(vaaben) {
    const beholder = document.getElementById('basisskade-beholder');
    const id = vaaben.id;
    const kort = document.createElement('div');
    kort.className = 'kort';
    kort.id = id + '-kort';
    beholder.appendChild(kort);

    const basisskade = beregnBasisskade(vaaben);
    const angrebSkade = Math.ceil( basisskade * vaaben.angreb.skadeFaktor );
    const teknikSkade = Math.ceil( basisskade * vaaben.teknik.skadeFaktor );
    const angrebHuForbrug = `${vaaben.angreb.hu} Hu`
    const teknikHuForbrug = `${vaaben.teknik.hu} Hu`

    kort.innerHTML = 
    `<div class="kort__top">
        <div class="kort__titel" id="kort-${vaaben.navn}">${vaaben.navn}${ vaaben.opgradering ? ' +' + vaaben.opgradering : ''}</div>
        <div class="kort__basis" id="${vaaben.navn}-basis">${evneVisningsnavn[vaaben.basis]}</div>
    </div>

    <div class="kort__top">
        <div></div>
        <div class="kort__basis--tillaeg">${ vaaben.tillaegsevne ? '+' + vaaben.tillaegsTaeller + '/' + vaaben.tillaegsNaevner + ' ' + evneVisningsnavn[vaaben.tillaegsevne] : ''}</div>
    </div>

    <div class="kort__data">
        <div class="kort__angreb">
            <div class="kort__vaerdi" id="${vaaben.navn}-angreb-skade">${angrebSkade}</div>
            <div class="kort__forbrug">${vaaben.angreb.hu ? vaaben.angreb.hu + ' Hu' : ''}<span class="kort__forbrug">${vaaben.angreb.sejd ? '· ' + vaaben.angreb.sejd + ' Sejd' : ''}</span></div>
        </div>

        <div class="kort__linje">
            <div class="kort__teknik">
                <div id="${vaaben.teknik.navn}-titel" class="kort__teknik-titel">${vaaben.teknik.navn}</div>
                <div class="kort__forbrug">${vaaben.teknik.hu ? vaaben.teknik.hu + ' Hu' : ''}
                <span class="kort__forbrug">${vaaben.teknik.sejd ? '· ' + vaaben.teknik.sejd + ' Sejd' : ''}</span></div>
                    
            </div>
            <div class="kort__teknikvaerdi" id="${vaaben.navn}-teknik-skade">${teknikSkade}</div>
        </div>
    </div>`;

    const ingenSkadeAngreb = vaaben.angreb.skadeFaktor === 0 || !vaaben.angreb.skadeFaktor;
    const ingenSkadeTeknik = vaaben.teknik.skadeFaktor === 0 || !vaaben.teknik.skadeFaktor;

    if (ingenSkadeAngreb) {kort.querySelector('.kort__angreb').classList.add('skjul-indhold')};
    if (ingenSkadeTeknik) {kort.querySelector('.kort__teknikvaerdi').classList.add('skjul-indhold')};

    visTooltip();

    function visTooltip() {
        const vaabenTooltip = document.getElementById('vaaben-tooltip');

        kort.addEventListener('mouseenter', () => {
            const prefix = vaaben.opgradering ? '+' : '';
            vaabenTooltip.innerHTML =
                `<div style="color: var(--tekst-aktiv); font-weight: 600;">${vaaben.navn} <span>${vaaben.opgradering ? '+' + vaaben.opgradering : ''}</span></div>` // Navn
                + vaaben.beskrivelse // Beskrivelse
                + '<br><br>Teknik: ' + `${vaaben.teknik.navn} <br>` // Tekniknavn
                + vaaben.teknik.beskrivelse; // Teknikbeskrivelse
            vaabenTooltip.style.display = 'block';
        });

        kort.addEventListener('mousemove', (e) => {
            const gap = 11;
            let x = e.clientX + gap;
            let y = e.clientY + gap;

            const tooltipBredde = vaabenTooltip.offsetWidth;
            const viewportBredde = window.innerWidth;

            if (x + tooltipBredde > viewportBredde) {
                x = e.clientX - tooltipBredde - gap;
            }

            vaabenTooltip.style.left = x + 'px';
            vaabenTooltip.style.top = y + 'px';
        });

        kort.addEventListener('mouseleave', () => {
            vaabenTooltip.style.display = 'none';
        });
    }
}

function beregnBasisskade(vaaben) {
    const basisLevel = effektiveEvner[vaaben.basis];
    const basisDel = basisLevel * (1 + vaaben.opgradering * 0.2);
    const tillaegsDel = vaaben.tillaegsevne
        ? (effektiveEvner[vaaben.tillaegsevne])
          * (vaaben.tillaegsTaeller / vaaben.tillaegsNaevner)
        : 0;
    return Math.round(basisDel + tillaegsDel);
}





// Udstyr
function opdaterUdstyrKortBeredskab() {
    document.getElementById('udstyr-beholder').innerHTML = '';
    altUdstyr
        .filter(u => karakter.valgtUdstyr.includes(u.id))
        .forEach(udstyr => udstyrKort(udstyr, 'udstyr-beholder'));
}

function opdaterUdstyrKortVaelger() {
    const raekkefoelge = ['hoved', 'vedhaeng', 'krop'].forEach(plads => {
        document.getElementById('kendt-udstyr-' + plads).innerHTML = '';
        altUdstyr
            .filter(u => karakter.udstyr.includes(u.id))
            .filter(u => u.plads.includes(plads))
            .forEach(udstyr => udstyrKort(udstyr, 'kendt-udstyr-' + plads));
    });
}

function opretUdstyrKort(udstyr, beholder) {
    const id = beholder + udstyr.id;
    const kort = document.createElement('div');
    kort.className = 'kort';
    kort.id = id + '-kort';

    kort.innerHTML = 
    `<div class="kort__top">
        <div class="kort__titel" id="titel-${id}">${udstyr.navn}</div>
        <div class="kort__basis" id="type-${id}" style="text-align: right">${udstyr.type}</div>
    </div>

    <div class="kort__info-kolonner">
        <div class="kort__info-kolonne kort__basis--info" id="info-krav-${id}"></div>
        <div class="kort__info-kolonne kort__basis--info" id="info-effekt-${id}"></div>
    </div>

    <div class="kort__data">
        <div class="kort__linje" id="beskrivelse-${id}">
            <div class="kort__beskrivelse">${udstyr.beskrivelse}</div>
        </div>
    </div>`;

    return kort;
}

function udstyrKort(udstyr, beholder) {
    const kort = opretUdstyrKort(udstyr, beholder);
    document.getElementById(beholder).appendChild(kort);
    const id = beholder + udstyr.id;
    const kravBeholder = document.getElementById(`info-krav-${id}`);
    const effektBeholder = document.getElementById(`info-effekt-${id}`);

    if (udstyr.levelKrav) {
        const krav = Object.entries(udstyr.levelKrav)
            .filter(([evne]) => evneVisningsnavn[evne])
            .map(([evne, værdi]) => `${evneVisningsnavn[evne]} ${værdi}`)
            .join(`<br>`);

        const vistKrav = document.createElement('div');
        vistKrav.innerHTML = `${krav}`;
        kravBeholder.appendChild(vistKrav);
    }

    if (udstyr.percyklus) {
        if (beholder !== 'udstyr-beholder') {
            const percyklusTekst = document.createElement('div');
            percyklusTekst.textContent = 'per cyklus';
            effektBeholder.appendChild(percyklusTekst);
        } else {
            const knap = document.createElement('div');
            knap.className = 'brug-knap';
            knap.id = `cyklus-brug-${id}`;
            knap.textContent = 'Brug';
            effektBeholder.appendChild(knap);

            saetBrugtVisningUdstyr(id, karakter.brugteFaerdigheder.includes(id));
            knap.addEventListener('click', () => {
                const brugt = karakter.brugteFaerdigheder.includes(id);
                if (brugt) {
                    karakter.brugteFaerdigheder = karakter.brugteFaerdigheder.filter(f => f !== id);
                } else {
                    karakter.brugteFaerdigheder.push(id);
                }
                saetBrugtVisningUdstyr(id, !brugt);
                gemData();
            });
        }
    }

    if (udstyr.forskydning) {
        const forskydning = Object.entries(udstyr.forskydning)
            .filter(([evne]) => evneVisningsnavn[evne])
            .map(([evne, værdi]) => {
                const værdiklasse = værdi > 0 ? 'forskudt-op' : 'forskudt-ned';
                const værditekst = værdi > 0 ? '+' + værdi : værdi;
                return `${evneVisningsnavn[evne]} <span class="${værdiklasse}">${værditekst}</span>`;
            })
            .join(`<br>`);
        
        const vistforskydning = document.createElement('div');
        vistforskydning.style.textAlign = 'right';
        vistforskydning.innerHTML = forskydning;
        effektBeholder.appendChild(vistforskydning);
    }

    if (udstyr.effekt) {
        const effektVisningsnavn = {
            huRegen: 'Hu ↺', mentalForsvar: 'Undslip', rustningsgrad: 'Rustningsgrad:'
        };

        const effekt = Object.entries(udstyr.effekt)
        .map(([effekt, værdi]) => {
            const værdiklasse = værdi > 0 ? 'forskudt-op' : 'forskudt-ned';
            let værditekst = værdi;

            if (effekt === 'mentalForsvar') {
                værditekst = '+' + værdi + 'd6';
            } else if (værdi > 0 && effekt !== 'rustningsgrad') {
                værditekst = '+' + værdi;
            }

            return `${effektVisningsnavn[effekt]} <span class="${værdiklasse}">${værditekst}</span>`;
            })
            .join(`<br>`);

        const visteffekt = document.createElement('div');
        visteffekt.style.textAlign = 'right';
        visteffekt.innerHTML = effekt;
        effektBeholder.appendChild(visteffekt);
    }

    if (beholder !== 'udstyr-beholder') {
        const erValgt = karakter.valgtUdstyr.includes(udstyr.id);

        const titel = document.getElementById(`titel-${id}`);
        const type = document.getElementById(`type-${id}`);
        const krav = document.getElementById(`info-krav-${id}`);
        const effekt = document.getElementById(`info-effekt-${id}`);
        const beskrivelse = document.getElementById(`beskrivelse-${id}`);

        if (!erValgt) {
            titel.classList.add('inaktiv');
            type.classList.add('inaktiv');
            krav.classList.add('inaktiv');
            effekt.classList.add('inaktiv');
            beskrivelse.classList.add('inaktiv');
        }

        kort.addEventListener('click', () => {vaelgUdstyr()});

        function vaelgUdstyr() {
            if (erValgt) {
                karakter.valgtUdstyr = karakter.valgtUdstyr.filter(u => u !== udstyr.id);
                titel.classList.add('inaktiv');
                type.classList.add('inaktiv');
                krav.classList.add('inaktiv');
                effekt.classList.add('inaktiv');
                beskrivelse.classList.add('inaktiv');

                gemData();
                opdaterUdstyrKortVaelger();
                opdaterVistData();
            } else {
                const konflikt = karakter.valgtUdstyr.some(valgId => {
                    const valgUdstyr = altUdstyr.find(u => u.id === valgId);
                    return valgUdstyr.plads === udstyr.plads;
                });

                if (konflikt) {
                    const beskeder = {
                        'hoved': 'Du har allerede udstyr på hovedet.',
                        'vedhaeng': 'Du har allerede et vedhæng.',
                        'krop': 'Du har allerede udstyr på kroppen.'
                    };
                    visBesked(beskeder[udstyr.plads]);
                    return;
                }

                karakter.valgtUdstyr.push(udstyr.id);
                titel.classList.remove('inaktiv');
                type.classList.remove('inaktiv');
                krav.classList.remove('inaktiv');
                effekt.classList.remove('inaktiv');
                beskrivelse.classList.remove('inaktiv');

                gemData();
                opdaterUdstyrKortVaelger();
                opdaterVistData();
            }
        }
    }
}


function saetBrugtVisningUdstyr(id, brugt) {
    const elementer = [
        document.getElementById(`cyklus-brug-${id}`),
        document.getElementById(`titel-${id}`),
        document.getElementById(`beskrivelse-${id}`),
        document.getElementById(`type-${id}`)
    ];
    elementer.forEach(el => el.classList.toggle('inaktiv', brugt));
    document.getElementById(`cyklus-brug-${id}`).textContent = brugt ? 'Brugt' : 'Brug';
}

// Færdigheder
function opdaterFaerdighedKortBrug() {
    document.getElementById('faerdighed-beholder').innerHTML = '';
    alleFaerdigheder
        .filter(v => karakter.valgteFaerdigheder.includes(v.id))
        .forEach(faerdighed => brugsKort(faerdighed));
}

function opretFaerdighedskort(faerdighed) {
    const id = faerdighed.id;
    const kort = document.createElement('div');
    kort.className = 'kort';
    kort.id = id + '-kort';

    kort.innerHTML = 
    `<div class="kort__top">
        <div class="kort__titel" id="titel-${id}">${faerdighed.navn}</div>
        <div class="kort__basis" id="kvalifikation-${id}">${faerdighed.kvalifikation}</div>
    </div>

    <div class="kort__top" id="brug-knap-beholder-${id}">
        <div class="kort__basis--type">${faerdighed.type}</div>
    </div>

    <div class="kort__data" id="info-${id}">
        <div class="kort__linje">
            <div class="kort__beskrivelse">${faerdighed.beskrivelse}</div>
        </div>
    </div>`;

    return kort;
}

function brugsKort(faerdighed) {
    const id = faerdighed.id;
    const kort = opretFaerdighedskort(faerdighed);
    document.getElementById('faerdighed-beholder').appendChild(kort);

    if (faerdighed.type !== "aktiv") return;

    const knap = document.createElement('div');
    knap.className = 'brug-knap';
    knap.id = `cyklus-brug-${id}`;
    knap.textContent = 'Brug';
    document.getElementById(`brug-knap-beholder-${id}`).appendChild(knap);

    saetBrugtVisning(id, karakter.brugteFaerdigheder.includes(id));
    knap.addEventListener('click', () => {
        const brugt = karakter.brugteFaerdigheder.includes(id);
        if (brugt) {
            karakter.brugteFaerdigheder = karakter.brugteFaerdigheder.filter(f => f !== id);
        } else {
            karakter.brugteFaerdigheder.push(id);
        }
        saetBrugtVisning(id, !brugt);
        gemData();
    });
}

function saetBrugtVisning(id, brugt) {
    const elementer = [
        document.getElementById(`cyklus-brug-${id}`),
        document.getElementById(`titel-${id}`),
        document.getElementById(`kvalifikation-${id}`),
        document.getElementById(`info-${id}`),
    ];
    elementer.forEach(el => el.classList.toggle('inaktiv', brugt));
    document.getElementById(`cyklus-brug-${id}`).textContent = brugt ? 'Brugt' : 'Brug';
}

function opdaterValgsKort() {
    const klasseBeholder = document.getElementById('klassefaerdigheder-valg');
    klasseBeholder.innerHTML = '';
    const evneBeholder = document.getElementById('evnefaerdigheder-valg');
    evneBeholder.innerHTML = '';
    klasseFaerdigheder
        .filter(v => v.kvalifikation.includes(karakter.klasse))
        .forEach(faerdighed => valgsKort(faerdighed, klasseBeholder));
    evneFaerdigheder
        .filter(v => karakter.faerdigheder.includes(v.id))
        .forEach(faerdighed => valgsKort(faerdighed, evneBeholder));
}

function valgsKort(faerdighed, beholder) {
    const id = faerdighed.id;
    const kort = opretFaerdighedskort(faerdighed);
    beholder.appendChild(kort);

    const titel = document.getElementById(`titel-${id}`);
    const kval = document.getElementById(`kvalifikation-${id}`);
    const info = document.getElementById(`info-${id}`);
    const erValgt = karakter.valgteFaerdigheder.includes(faerdighed.id);
    const maksAktive = 2;

    if (!erValgt) {
        titel.classList.add('inaktiv');
        kval.classList.add('inaktiv');
        info.classList.add('inaktiv');
    }

    kort.addEventListener('click', () => {
        aktiverFaerdighed(id)
    });

    function aktiverFaerdighed(id) {
        const erValgt = karakter.valgteFaerdigheder.includes(faerdighed.id);
        if (erValgt) {
                titel.classList.add('inaktiv');
                kval.classList.add('inaktiv');
                info.classList.add('inaktiv');
            karakter.valgteFaerdigheder =
                karakter.valgteFaerdigheder.filter(id => id !== faerdighed.id);
        } else {
            if (karakter.valgteFaerdigheder.length >= maksAktive) {
                visBesked('Du kan kun have højst 2 aktive færdigheder.');
                return;
            }
            karakter.valgteFaerdigheder.push(faerdighed.id);
            titel.classList.remove('inaktiv');
            kval.classList.remove('inaktiv');
            info.classList.remove('inaktiv');
        }

        gemData();
        opdaterVistData();
        opdaterValgsKort();
    }
}

function opdaterLaerKort() {
    const kendteBeholder = document.getElementById('kendte-faerdigheder-laer');
    kendteBeholder.innerHTML = '';
    klasseFaerdigheder
        .filter(v => v.kvalifikation.includes(karakter.klasse))
        .forEach(faerdighed => laerKortKendt(faerdighed, kendteBeholder));

    const ukendteBeholder = document.getElementById('ukendte-faerdigheder-laer');
    ukendteBeholder.innerHTML = '';
    evneFaerdigheder
        .filter(v => !karakter.faerdigheder.includes(v.id))
        .forEach(faerdighed => laerKortUkendt(faerdighed, ukendteBeholder));
}

function laerKortKendt(faerdighed, beholder) {
    const kort = opretFaerdighedskort(faerdighed);
    beholder.appendChild(kort);
}

function laerKortUkendt(faerdighed, beholder) {
    const knap = document.createElement('div');
    const kort = opretFaerdighedskort(faerdighed);
    const knapOgKort = document.createElement('div');
    const pris = faerdighed.levelKrav ? Object.values(faerdighed.levelKrav)[0] : null;

    knapOgKort.className = 'knap-og-kort';
    knap.className = 'laas-op-knap';
    knap.innerHTML = `Lås op: ${pris} Dråber`;
    kort.classList.add('hvid-kant');

    // VIS KORT ANERLEDES HVIS MAN IKKE OPFYLDER LEVEL-KRAV

    knapOgKort.appendChild(knap);
    knapOgKort.appendChild(kort);
    beholder.appendChild(knapOgKort);

    knap.addEventListener('click', () => {
        laerFaerdighed(faerdighed.id)
    })

    function laerFaerdighed(id) {
        if (karakter.draaber < pris) {
            visBesked('Du har ikke nok Dråber.');
            return;
        }

        const [evne, kravLevel] = Object.entries(faerdighed.levelKrav)[0];
        if (effektiveEvner[evne] < kravLevel) {
            visBesked(`${faerdighed.navn} kræver ${evneVisningsnavn[evne]} ${kravLevel}.`);
            return;
        }

        karakter.faerdigheder.push(id);
        karakter.draaber -= pris;
        gemData();
        opdaterLaerKort();
        opdaterVistData();
    }
}



// Besværgelser
function opdaterMagiKortBrug() {
    document.getElementById('magi-beholder').innerHTML = '';
    alleBesvaergelser
        .filter(b => karakter.valgteBesvaergelser.includes(b.id))
        .forEach(besvaergelse => magiKortBrug(besvaergelse));
}

function tjekLeder(lederKrav) {
    return karakter.vaaben.find(v =>
        karakter.valgteVaaben.includes(v.id) &&
        v.leder === lederKrav
    ) ?? null;
}

function opretMagiKort(besvaergelse, sted) {
    const id = besvaergelse.id + '-' + sted;
    const kort = document.createElement('div');

    kort.className = 'kort';
    kort.id = id + '-kort';

    kort.innerHTML = 
    `<div class="kort__top">
        <div class="kort__titel">${besvaergelse.navn}</div>
        <div class="kort__basis">${evneVisningsnavn[besvaergelse.basis]}</div>
    </div>

    <div class="kort__top">
        <div class="kort__basis--tillaeg">${besvaergelse.skole}</div>
        <div class="kort__basis--tillaeg">${besvaergelse.type}</div>
        <div class="kort__basis--tillaeg">${besvaergelse.effekt}</div>
    </div>

    <div id="${id}-kort-data" class="kort__data"></div>`;

    return kort;
}

function magiKortBrug(besvaergelse) {
    // Grundlæggende opbygning
    const beholder = document.getElementById('magi-beholder');
    const kort = opretMagiKort(besvaergelse, 'brug');

    beholder.appendChild(kort);

    // Dataopbygning
    const dataBeholder = document.getElementById(`${besvaergelse.id}-brug-kort-data`);
    const lederKrav = besvaergelse.lederKrav;
    const leder = tjekLeder(lederKrav);

    if(leder === null) {
        dataBeholder.innerHTML = 
        `<div class="kort__angreb">
            <div class="kort__beskrivelse">Du mangler en ${lederKrav} Leder.</div>
        </div>`;
        return;
    }

    const basisskade = beregnBasisskade(leder);
    const angrebSkade = besvaergelse.skadeFaktor ? Math.ceil( basisskade * besvaergelse.skadeFaktor ) : '';
    const forbrugHuSejd = besvaergelse.hu && besvaergelse.sejd ? ' · ' : '';

    dataBeholder.innerHTML =
    `<div class="kort__angreb">
        <div class="kort__vaerdi">${angrebSkade}</div>
        <div class="kort__forbrug">${besvaergelse.hu ? besvaergelse.hu + ' Hu' : ''}<span class="kort__forbrug">${forbrugHuSejd}${besvaergelse.sejd ? besvaergelse.sejd + ' Sejd' : ''}</span></div>
    </div>

    <div class="kort__linje">
        <div class="kort__beskrivelse">${besvaergelse.beskrivelse}</div>
    </div>`
}

function opdaterMagiKortValg() {
    document.getElementById('kendt-magi').innerHTML = '';
    alleBesvaergelser
        .filter(b => karakter.besvaergelser.includes(b.id))
        .forEach(besvaergelse => magiKortValg(besvaergelse));
}

function magiKortValg(besvaergelse) {
    const beholder = document.getElementById('kendt-magi');
    const kort = opretMagiKort(besvaergelse, 'valg');
    beholder.appendChild(kort);

    const dataBeholder = document.getElementById(`${besvaergelse.id}-valg-kort-data`);

    dataBeholder.innerHTML =
    `<div class="kort__angreb">
        <div class="kort__forbrug">${besvaergelse.hu ? besvaergelse.hu + ' Hu' : ''}<span class="kort__forbrug">${besvaergelse.sejd ? ' · ' + besvaergelse.sejd + ' Sejd' : ''}</span></div>
    </div>

    <div class="kort__linje">
        <div class="kort__beskrivelse">${besvaergelse.beskrivelse}</div>
    </div>`

    // BESVÆRGELSER SKAL KUNNE AKTIVERES LIGESOM FÆRDIGHEDER
    const erValgt = karakter.valgteBesvaergelser.includes(besvaergelse.id);
    const maksAktive = 3;
    const titel = kort.querySelector('.kort__titel');
    const basis = kort.querySelector('.kort__basis');
    const forbrug = kort.querySelectorAll('.kort__forbrug');

    if (!erValgt) {
        kort.classList.add('inaktiv');
        titel.classList.add('inaktiv');
        basis.classList.add('inaktiv');
        forbrug.forEach(e => e.classList.add('inaktiv'));
    }

    kort.addEventListener('click', () => {
        aktiverMagi(besvaergelse);
    });

    function aktiverMagi(id) {
        const kvalificeret = tjekMagiLevelKrav(besvaergelse);
        const erValgt = karakter.valgteBesvaergelser.includes(besvaergelse.id);

        if (erValgt) {
            kort.classList.add('inaktiv');
            titel.classList.add('inaktiv');
            basis.classList.add('inaktiv');
            forbrug.forEach(e => e.classList.add('inaktiv'));

            karakter.valgteBesvaergelser =
                karakter.valgteBesvaergelser.filter(id => id !== besvaergelse.id);
        } else {
            if (karakter.valgteBesvaergelser.length >= maksAktive) {
                visBesked('Du kan kun have højst 3 aktive besværgelser.');
                return;
            }

            if (!kvalificeret) {
                visBesked(`Du møder ikke kravene for at kunne bruge ${besvaergelse.navn}`);
                return;
            }
            karakter.valgteBesvaergelser.push(besvaergelse.id);
            kort.classList.remove('inaktiv');
            titel.classList.remove('inaktiv');
            basis.classList.remove('inaktiv');
            forbrug.forEach(e => e.classList.remove('inaktiv'));
        }

        gemData();
        opdaterVistData();
        opdaterMagiKortValg();
    }
}

function tjekMagiLevelKrav(besvaergelse) {
    const { levelKrav } = besvaergelse;

    if (!levelKrav || Object.keys(levelKrav).length === 0) {
        return true;
    }

    for (const [evne, level] of Object.entries(levelKrav)) {
        const karakterEvneLevel = (effektiveEvner[evne] || 0);

        if (karakterEvneLevel < level) {
            return false;
        }
    }

    return true;
}



// =============
// === EVNER ===
// =============

function forskydningPlus(evne) {
    karakter.forskydning[evne] += 1;
    opdaterVistData();
}

function forskydningMinus(evne) {
    karakter.forskydning[evne] -= 1;
    opdaterVistData();
}



// =========================
// === INVENTAR OG NOTER ===
// =========================

// Inventar
function initInventar() {
    const flaskeTal = document.getElementById('antal-flaske');
    const stenskaarTal = document.getElementById('antal-stenskaar');

    flaskeTal.textContent = karakter.flaskerMax;
    stenskaarTal.textContent = karakter.stenskaar;

    aabenVindue('inventar');
}

function aendrInventar(emne, aendring) {
    if (emne === 'flaske') {
        const nytAntal = Math.max(0, karakter.flaskerMax + aendring);
        karakter.flaskerMax = nytAntal;
        karakter.flaskerNu = Math.min(karakter.flaskerNu, nytAntal);
        document.getElementById('antal-flaske').textContent = nytAntal;
    } else if (emne === 'stenskaar') {
        const nytAntal = Math.max(0,karakter.stenskaar + aendring);
        karakter.stenskaar = nytAntal;
        document.getElementById('antal-stenskaar').textContent = nytAntal;
    }
    opdaterVistData();
}

// Ændre størrelse på noteområde
function opdaterNoteOmraade(felt) {
    const noter = document.getElementById(felt);
    noter.style.minHeight = '3rem'
    noter.style.height = 'auto';
    noter.style.height = noter.scrollHeight + 'px';
}





// =====================================================
// ====================== VINDUER ======================
// =====================================================

// ======================
// === EVNEFORBEDRING ===
// ======================

const evneNoegler = ['form', 'sind', 'intuition', 'styrke', 'behaendighed', 'visdom', 'mystik'];
const evneVisningsnavn = {
    form: 'Form', sind: 'Sind', intuition: 'Intuition',
    styrke: 'Styrke', behaendighed: 'Behændighed', visdom: 'Visdom', mystik: 'Mystik'
};

// Modul-niveau state så alle funktioner deler samme data
let evneVindueData = null;
let evneForbedringer = {};

function initEvneVindue() {
    evneForbedringer = { form: 0, sind: 0, intuition: 0, styrke: 0, behaendighed: 0, visdom: 0, mystik: 0 };
 
    evneVindueData = {
        karakterLevel: karakter.form + karakter.sind + karakter.intuition +
                       karakter.styrke + karakter.behaendighed + karakter.visdom + karakter.mystik,
        draaber: karakter.draaber,
        evner: {
            form: karakter.form, sind: karakter.sind, intuition: karakter.intuition,
            styrke: karakter.styrke, behaendighed: karakter.behaendighed,
            visdom: karakter.visdom, mystik: karakter.mystik
        }
    };
 
    document.getElementById('evne-liste').innerHTML = '';
    opretEvneListe();
    opdaterEvneVindueHoved();
    opdaterEvneVindueFod();
    aabenVindue('evneforbedring');
}
 
function opretEvneListe() {
    const evneListe = document.getElementById('evne-liste');
 
    for (const evne of evneNoegler) {
        const raekke = document.createElement('div');
        raekke.className = 'vindue__raekke';
        raekke.id = `vindue__raekke-${evne}`;
 
        raekke.innerHTML = `
            <div class="evne-navn">${evneVisningsnavn[evne]}</div>
            <div class="vindue__evne-info" id="info-${evne}"></div>
            <div class="vindue__knapgruppe">
                <button class="minus-btn" id="minus-${evne}">-</button>
                <span class="antal-badge" id="antal-${evne}">0</span>
                <button class="plus-btn" id="plus-${evne}">+</button>
            </div>
        `;
 
        evneListe.appendChild(raekke);
        document.getElementById(`minus-${evne}`).addEventListener('click', () => aendrEvne(evne, -1));
        document.getElementById(`plus-${evne}`).addEventListener('click', () => aendrEvne(evne, 1));
        opdaterEvneInfo(evne);
    }
}
 
function aendrEvne(evne, aendring) {
    const nuvaerendeLvl = evneVindueData.evner[evne];
    const antalForbedringer = evneForbedringer[evne];
    const nytAntal = antalForbedringer + aendring;
    const nytLevel = nuvaerendeLvl + nytAntal;
 
    if (nytAntal < 0) return;
    if (nytLevel > 100) return;
 
    // Simuler ændringen for at tjekke om vi har råd
    if (aendring > 0) {
        evneForbedringer[evne] = nytAntal;
        const nyOmkostning = beregnTotalOmkostning();
        evneForbedringer[evne] = antalForbedringer;
        if (nyOmkostning > evneVindueData.draaber) return;
    }
 
    evneForbedringer[evne] = nytAntal;
    opdaterEvneInfo(evne);
    opdaterEvneVindueHoved();
    opdaterEvneVindueFod();
}

function opdaterEvneInfo(evne) {
    const nuvaerendeLvl = evneVindueData.evner[evne];
    const antalForbedringer = evneForbedringer[evne];
    const nytLevel = nuvaerendeLvl + antalForbedringer;
    const nuvaerendePulje = beregnPulje(nuvaerendeLvl);
    const nyPulje = beregnPulje(nytLevel);

    let info = '';
    if (antalForbedringer > 0) {
        info = `Level ${nuvaerendeLvl} → <span class="ny-vaerdi">${nytLevel}</span> (${nuvaerendePulje}d6`;
        info += nuvaerendePulje !== nyPulje
            ? ` → <span class="ny-vaerdi">${nyPulje}d6</span>)`
            : `)`;
    } else {
        info = `Level ${nuvaerendeLvl} (${nuvaerendePulje}d6)`;
    }
 
    let specialInfo = '';
    if (antalForbedringer > 0) {
        if (evne === 'form')      specialInfo = evneLivInfo(nuvaerendeLvl, nytLevel);
        if (evne === 'sind')      specialInfo = evneSejdInfo(nuvaerendeLvl, nytLevel);
        if (evne === 'intuition') specialInfo = evneHuInfo(nuvaerendeLvl, nytLevel);
    }
 
    const infoDiv = document.getElementById(`info-${evne}`);
    infoDiv.innerHTML = info;
    if (specialInfo) {
        infoDiv.innerHTML += `<div class="vindue__special-info">${specialInfo}</div>`;
    }
 
    if (antalForbedringer > 0) {
        document.getElementById(`antal-${evne}`).textContent = '+' + antalForbedringer;
    } else {
        document.getElementById(`antal-${evne}`).textContent = 0;
    }
}
 
function opdaterEvneVindueHoved() {
    const totalForbedringer = Object.values(evneForbedringer).reduce((a, b) => a + b, 0);
    const nytKarakterLevel = evneVindueData.karakterLevel + totalForbedringer;
    const totalOmkostning = beregnTotalOmkostning();
    const draaberTilbage = evneVindueData.draaber - totalOmkostning;
 
    document.getElementById('karakter-level').innerHTML = totalForbedringer > 0
        ? `${evneVindueData.karakterLevel} → <span class="ny-vaerdi">${nytKarakterLevel}</span>`
        : `${evneVindueData.karakterLevel}`;
 
    document.getElementById('total-omkostning').innerHTML = totalOmkostning > 0 ?
    `<span class="ny-vaerdi ny-vaerdi--draaber">${totalOmkostning}</span> Dråber`
    : `0 Dråber`;
 
    document.getElementById('draaber-info').innerHTML = totalOmkostning > 0
        ? `${evneVindueData.draaber} → <span class="ny-vaerdi ny-vaerdi--draaber">${draaberTilbage}</span> Dråber`
        : `${evneVindueData.draaber} Dråber`;
}
 
function opdaterEvneVindueFod() {
    const total = beregnTotalOmkostning();
    const bekraeftKnap = document.getElementById('bekraeft-evne');
    bekraeftKnap.style.opacity = total === 0 ? '0.4' : '';
    bekraeftKnap.style.pointerEvents = total === 0 ? 'none' : '';
}
 
function beregnTotalOmkostning() {
    let total = 0;
    let akkLevel = evneVindueData.karakterLevel;
 
    for (const evne of evneNoegler) {
        for (let i = 0; i < evneForbedringer[evne]; i++) {
            total += akkLevel;
            akkLevel++;
        }
    }
 
    return total;
}
 
function bekraeftEvneForbedringer() {
    const total = beregnTotalOmkostning();
    if (total === 0) return;
 
    for (const evne of evneNoegler) {
        karakter[evne] += evneForbedringer[evne];
    }
    karakter.draaber -= total;
    
    opdaterVistData();
    lukVindue('evneforbedring');
    visBesked(`Evner forbedret. ${total} Dråber brugt.`);
    hvil();
}

// Specialinfo-hjælpere til Liv, Sejd, Hu
function evneLivInfo(gammelForm, nyForm) {
    const gammelLiv = beregnVitalMax(gammelForm);
    const nytLiv = beregnVitalMax(nyForm);
    const forskel = nytLiv - gammelLiv;
    return forskel > 0
        ? `Liv ${gammelLiv} → <span class="ny-vaerdi">${nytLiv}</span> (+${forskel})`
        : '';
}
 
function evneSejdInfo(gammelSind, nySind) {
    const forskel = nySind - gammelSind;
    return forskel > 0
        ? `Sejd ${gammelSind} → <span class="ny-vaerdi">${nySind}</span> (+${forskel})`
        : '';
}

function evneHuInfo(gammelIntuition, nyIntuition) {
    const gammelHu = beregnHuMax(gammelIntuition);
    const nyHu = beregnHuMax(nyIntuition);
    const gammelRegen = beregnHuRegen(gammelIntuition);
    const nyRegen = beregnHuRegen(nyIntuition);
 
    const dele = [];
    if (gammelHu !== nyHu) dele.push(`Hu ${gammelHu} → <span class="ny-vaerdi">${nyHu}</span>`);
    if (gammelRegen !== nyRegen) dele.push(`Regen ${gammelRegen} → <span class="ny-vaerdi">${nyRegen}</span> Hu/runde`);
    return dele.join(', ');
}



// ==============================
// === VÅBEN OG OPGRADERINGER ===
// ==============================

const vaabenEvner = ['styrke', 'behaendighed', 'visdom', 'mystik'];
const vaabenEvneNavne = {
    styrke: 'Styrke', behaendighed: 'Behændighed', visdom: 'Visdom', mystik: 'Mystik'
};

let vaabenRedigeresID = null;
let vaabenRedigeringData = null;
let valgtOpgraderingsNiveau = 0;
let opgraderingVedVandsten = false;

function genererVaabenId() {
    return 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// Beregner stenskår og dråber for opgradering fra 'fra' til 'til'
function beregnOpgraderingspris(fra, til, vedVandsten) {
    let stenskaar = 0;
    for (let i = fra + 1; i <= til; i++) stenskaar += i;
    const karakterLevel = karakter.form + karakter.sind + karakter.intuition +
                          karakter.styrke + karakter.behaendighed + karakter.visdom + karakter.mystik;
    const draaber = vedVandsten ? karakterLevel * stenskaar : 0;
    return { stenskaar, draaber };
}

// --- Åben våben-vindue ---
function genererVaabenliste() {
    const liste = document.getElementById('vaaben-liste');
    liste.innerHTML = '';

    if (!karakter.vaaben || karakter.vaaben.length === 0) {
        const tom = document.createElement('div');
        tom.className = 'vaabendetaljer__opgradering--tom';
        tom.textContent = 'Ingen våben tilføjet.';
        liste.appendChild(tom);
    } else {
        for (const vaaben of karakter.vaaben) {
            const raekke = document.createElement('div');
            raekke.className = 'vindue__raekke vindue__raekke--vaaben';
            raekke.style.cursor = 'pointer';
            raekke.innerHTML = `
                <div class="evne-navn vaaben">${vaaben.navn || 'Unavngivet'}</div>
                <div class="vindue__raekke--opgradering"><div>${vaaben.opgradering > 0 ? '+' : ''}${vaaben.opgradering}</div></div>
                <div></div>
                <div>${vaabenEvneNavne[vaaben.basis]}</div>
                <div class="vaabendetaljer__opgraderingspil">›</div>
            `;
            raekke.addEventListener('click', () => aabnVaabendetaljevindue(vaaben.id));
            liste.appendChild(raekke);
        }
    }

    aabenVindue('vaabenliste');
}

// --- Våbendetaljer ---
function aabnVaabendetaljevindue(id) {
    vaabenRedigeresID = id;

    opdaterNoteOmraade('vaaben-detalje-beskrivelse');
    opdaterNoteOmraade('vaaben-detalje-teknik');
    opdaterNoteOmraade('vaaben-noter-input');

    if (id === null) {
        vaabenRedigeringData = {
            navn: '',
            basis: 'styrke',
            originalOpgradering: 0,
            midlertidigOpgradering: 0,
            vedVandsten: false,
            beskrivelse: '',
            teknik: '',
            noter: '',
        };
    } else {
        const vaaben = karakter.vaaben.find(v => v.id === id);
        if (!vaaben) return;
        vaabenRedigeringData = {
            navn: vaaben.navn,
            basis: vaaben.basis,
            originalOpgradering: vaaben.opgradering,
            midlertidigOpgradering: vaaben.opgradering,
            vedVandsten: false,
            beskrivelse: vaaben.beskrivelse,
            teknik: vaaben.teknik
                ? (vaaben.teknik.navn + (vaaben.teknik.beskrivelse ? '\n' + vaaben.teknik.beskrivelse : ''))
                : '',
            noter: vaaben.noter || '',
        };
    }

    document.getElementById('vaabendetalje-titel').textContent =
        id === null ? 'Nyt våben' : 'Rediger våben';
    document.getElementById('vaaben-navn-input').value = vaabenRedigeringData.navn;
    document.getElementById('vaaben-detalje-beskrivelse').value = vaabenRedigeringData.beskrivelse;
    document.getElementById('vaaben-detalje-teknik').value = vaabenRedigeringData.teknik;
    document.getElementById('vaaben-noter-input').value = vaabenRedigeringData.noter;
    document.getElementById('slet-vaaben').style.display = id === null ? 'none' : '';

    opdaterVaabenBasisToggle();
    opdaterVaabenOpgraderingKnap();

    lukVindue('vaabenliste');
    aabenVindue('vaabendetalje');
}

function opdaterVaabenBasisToggle() {
    document.querySelectorAll('#vaaben-basis-toggle .vaabendetaljer__opgraderingsselektor').forEach(el => {
        el.classList.toggle('aktiv', el.dataset.basis === vaabenRedigeringData.basis);
    });
}

function opdaterVaabenOpgraderingKnap() {
    const opgraderingstal = document.getElementById('opgraderingstal');
    const knap = document.getElementById('aaben-vaabenopgradering');
    const orig = vaabenRedigeringData.originalOpgradering;
    const mid = vaabenRedigeringData.midlertidigOpgradering;

    if (mid > orig) {
        const { stenskaar, draaber } = beregnOpgraderingspris(
            orig, mid, vaabenRedigeringData.vedVandsten
        );
        let kostTekst = `${stenskaar} Stenskår`;
        if (vaabenRedigeringData.vedVandsten && draaber > 0) kostTekst += `, ${draaber} Dråber`;

        opgraderingstal.innerHTML = `${orig > 0 ? '+' : ''}${orig} → <span class="ny-vaerdi">${mid > 0 ? '+' : ''}${mid}</span>
            <span class="vaabendetaljer__opgraderingspris">(${kostTekst})</span>`;
    } else {
        opgraderingstal.textContent = mid > 0 ? `+${mid}` : `${mid}`;
    }
}

function gemVaaben() {
    const navn = document.getElementById('vaaben-navn-input').value.trim() || 'Unavngivet';
    const noter = document.getElementById('vaaben-noter-input').value;
    const beskrivelse = document.getElementById('vaaben-detalje-beskrivelse').value;

    const teknikTekst = document.getElementById('vaaben-detalje-teknik').value;
    const foersteLinje = teknikTekst.indexOf('\n');
    const teknikNavn = foersteLinje === -1 ? teknikTekst : teknikTekst.slice(0, foersteLinje);
    const teknikBeskrivelse = foersteLinje === -1 ? '' : teknikTekst.slice(foersteLinje + 1).trim();

    const { stenskaar, draaber } = beregnOpgraderingspris(
        vaabenRedigeringData.originalOpgradering,
        vaabenRedigeringData.midlertidigOpgradering,
        vaabenRedigeringData.vedVandsten
    );

    const eksisterende = vaabenRedigeresID !== null
        ? karakter.vaaben.find(v => v.id === vaabenRedigeresID)
        : null;

    const nytVaaben = {
        id: vaabenRedigeresID ?? genererVaabenId(),
        navn,
        basis: vaabenRedigeringData.basis,
        opgradering: vaabenRedigeringData.midlertidigOpgradering,
        beskrivelse,
        angreb: eksisterende?.angreb ?? { skadeFaktor: 0.5, hu: 1 },
        teknik: {
            navn: teknikNavn || 'Teknik',
            beskrivelse: teknikBeskrivelse,
            skadeFaktor: eksisterende?.teknik?.skadeFaktor ?? 1,
            hu: eksisterende?.teknik?.hu ?? 2,
            sejd: eksisterende?.teknik?.sejd ?? 1,
        },
        tillaegsevne: eksisterende?.tillaegsevne ?? null,
        tillaegsTaeller: eksisterende?.tillaegsTaeller ?? null,
        tillaegsNaevner: eksisterende?.tillaegsNaevner ?? null,
        noter,
    };

    if (vaabenRedigeresID === null) {
        vaabenRedigeresID = nytVaaben.id;
        karakter.vaaben.push(nytVaaben);
    } else {
        const idx = karakter.vaaben.findIndex(v => v.id === vaabenRedigeresID);
        if (idx !== -1) karakter.vaaben[idx] = nytVaaben;
    }

    karakter.stenskaar = Math.max(0, karakter.stenskaar - stenskaar);
    if (vaabenRedigeringData.vedVandsten) {
        karakter.draaber = Math.max(0, karakter.draaber - draaber);
    }

    opdaterVistData();
    lukVindue('vaabendetalje');
    genererVaabenliste();
    visBesked(stenskaar > 0 ? `Våben gemt. ${stenskaar} Stenskår brugt.` : 'Våben gemt.');
}

function sletVaaben() {
    if (vaabenRedigeresID === null) return;
    karakter.vaaben = karakter.vaaben.filter(v => v.id !== vaabenRedigeresID);
    karakter.valgteVaaben = karakter.valgteVaaben.filter(id => id !== vaabenRedigeresID);
    vaabenRedigeresID = null;
    opdaterVistData();
    lukVindue('vaabendetalje');
    genererVaabenliste();
    visBesked('Våben slettet.');
}

// Opgradering
function aabnVaabenopgraderingsvindue() {
    if (!vaabenRedigeringData) return;

    valgtOpgraderingsNiveau = vaabenRedigeringData.midlertidigOpgradering;
    opgraderingVedVandsten = vaabenRedigeringData.vedVandsten;

    const navn = document.getElementById('vaaben-navn-input').value.trim() || 'Unavngivet';
    document.getElementById('vaabenopgradering-titel').textContent = navn + ' · Opgradering';

    opdaterVaabenopgraderingsvindue();
    aabenVindue('vaabenopgradering');
}

function aendrVaabenOpgraderingNiveau(retning) {
    const nyt = valgtOpgraderingsNiveau + retning;
    if (nyt < vaabenRedigeringData.originalOpgradering || nyt > 5) return;
    valgtOpgraderingsNiveau = nyt;
    opdaterVaabenopgraderingsvindue();
}

function opdaterVaabenopgraderingsvindue() {
    const orig = vaabenRedigeringData.originalOpgradering;
    const { stenskaar, draaber } = beregnOpgraderingspris(
        orig, valgtOpgraderingsNiveau, opgraderingVedVandsten
    );

    const niveauEl = document.getElementById('vaabenopg-niveau');
    if (valgtOpgraderingsNiveau > orig) {
        niveauEl.innerHTML = `${orig > 0 ? '+' : ''}${orig} → <span class="ny-vaerdi">${valgtOpgraderingsNiveau > 0 ? '+' : ''}${valgtOpgraderingsNiveau}</span>`;
    } else {
        niveauEl.textContent = `${valgtOpgraderingsNiveau > 0 ? '+' : ''}${valgtOpgraderingsNiveau}`;
    }

    document.getElementById('vaabenopg-stenskaar-info').innerHTML = stenskaar > 0
        ? `${karakter.stenskaar} → <span class="ny-vaerdi ny-vaerdi--draaber">${karakter.stenskaar - stenskaar}</span>`
        : `${karakter.stenskaar}`;

    document.getElementById('vaabenopg-draaber-info').innerHTML =
        opgraderingVedVandsten && draaber > 0
        ? `${karakter.draaber} → <span class="ny-vaerdi ny-vaerdi--draaber">${karakter.draaber - draaber}</span>`
        : `${karakter.draaber}`;

    document.getElementById('vaabenopg-smedje').classList.toggle('aktiv', !opgraderingVedVandsten);
    document.getElementById('vaabenopg-vandsten').classList.toggle('aktiv', opgraderingVedVandsten);

    const omk = document.getElementById('vaabenopg-total-omkostning');
    if (stenskaar > 0) {
        let tekst = `${stenskaar} Stenskår`;
        if (opgraderingVedVandsten) tekst += `, ${draaber} Dråber`;
        omk.innerHTML = `<span class="ny-vaerdi ny-vaerdi--draaber">${tekst}</span>`;
    } else {
        omk.textContent = '-';
    }

    document.getElementById('vaabenopg-minus').disabled =
        valgtOpgraderingsNiveau <= orig;
    document.getElementById('vaabenopg-plus').disabled =
        valgtOpgraderingsNiveau >= 5;
    document.getElementById('vaabenopg-niveau-badge').textContent = 
    `${valgtOpgraderingsNiveau > 0 ? '+' : ''}${valgtOpgraderingsNiveau}`;

    const harRaad = stenskaar <= karakter.stenskaar &&
                    (!opgraderingVedVandsten || draaber <= karakter.draaber);
    const harAendring = valgtOpgraderingsNiveau !== vaabenRedigeringData.midlertidigOpgradering;
    const knap = document.getElementById('bekraeft-vaabenopgradering');
    const aktiv = harRaad && harAendring;
    knap.style.opacity = aktiv ? '' : '0.4';
    knap.style.pointerEvents = aktiv ? '' : 'none';
}

function bekraeftVaabenopgradering() {
    vaabenRedigeringData.midlertidigOpgradering = valgtOpgraderingsNiveau;
    vaabenRedigeringData.vedVandsten = opgraderingVedVandsten;
    opdaterVaabenOpgraderingKnap();
    lukVindue('vaabenopgradering');
}





// ============================================================
// ====================== DATAHÅNDTERING ======================
// ============================================================

async function indlaesSpilData() {
    try {
        const svar = await fetch('spildata.json');
        const spildata = await svar.json();
        
        standardKlasser = spildata.klasser;
        alleVaaben = spildata.vaaben;
        alleBesvaergelser = spildata.besvaergelser;
        klasseFaerdigheder = spildata.klassefaerdigheder;
        evneFaerdigheder = spildata.evnefaerdigheder;
        alleFaerdigheder = [...spildata.klassefaerdigheder, ...spildata.evnefaerdigheder];
        altUdstyr = spildata.udstyr;

        console.log("Spildata er indlæst korrekt ☺︎");
        
        indlaesData();
        opdaterVistData();
        
    } catch (fejl) {
        console.error("Fejl under indlæsning af spildata ☹︎", fejl);
    }
}



// Gem og indlæs
const karakterGrundlag = {
    navn: "",
    klasse: "",
    draaber: 2280,
    draaberEfterladt: 0,

    livNu: 1,
    sejdNu: 1,
    huNu: 1,

    sekvens: 0,
    haab: 0,
    forvitring: 0,
    laesioner: 0,
    udmattelse: 0,

    form: 1,
    sind: 1,
    intuition: 1,
    styrke: 1,
    behaendighed: 1,
    visdom: 1,
    mystik: 1,

    forskydning: {
        form: 0,
        sind: 0,
        intuition: 0,
        styrke: 0,
        behaendighed: 0,
        visdom: 0,
        mystik: 0,
    },

    faerdigheder: [],
    valgteFaerdigheder: [],
    brugteFaerdigheder: [],

    vaaben: [],
    valgteVaaben: [],

    udstyr: [],
    valgtUdstyr: [],

    besvaergelser: [],
    valgteBesvaergelser: [],

    stenskaar: 0,
    flaskerMax: 1,
    flaskerNu: 1,
    endeligtDoed: false,

    noter: "",
};

function gemData() {
    localStorage.setItem('karakterark', JSON.stringify(karakter));
}

function indlaesData() {
    const gemt = localStorage.getItem('karakterark');
    if (gemt) {
        Object.assign(karakter, JSON.parse(gemt));
    }
}

function eksporterData() {
    const json = JSON.stringify(karakter, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const navn = karakter.navn || 'Karakter';
    const karakterLevel = karakter.form + karakter.sind + karakter.intuition + karakter.styrke + karakter.behaendighed + karakter.visdom + karakter.mystik;
    a.href = url;
    a.download = `${navn} (Level ${karakterLevel}) Tusinde Floder.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importerData() {
    document.getElementById('importer-input').click();
}

function nulstilData() {
    Object.assign(karakter, JSON.parse(JSON.stringify(karakterGrundlag)));
    gemData();
    opdaterVistData();
    visArk();
    visBesked('Karakter nulstillet.');
}

function hentStandardKlasse(klasse) {
    const karakterVisningsnavn = { asket: 'Asket', bytyv: 'Bytyv', forkynder: 'Forkynder', hedonist: 'Hedonist', lovloes: 'Lovløs', laerd: 'Lærd', militarist: 'Militarist' };
    const diff = standardKlasser.find(k => k.id === klasse);
    if (!diff) return;

    const baseKarakter = JSON.parse(JSON.stringify(karakterGrundlag));
    const klasseData = JSON.parse(JSON.stringify(diff));
    const klasseVaabenRef = klasseData.vaaben || [];
    const klasseVaaben = klasseVaabenRef.map(ref => {
        return alleVaaben.find(v => v.id === ref.id);
    });
    const klasseFaerdighederRef = klasseData.faerdigheder || [];
    const klasseFaerdighederne = klasseFaerdighederRef.map(ref => {
        return klasseFaerdigheder.find(f => f.id === ref.id);
    });

    Object.assign(karakter, baseKarakter, klasseData);
    karakter.vaaben = [...klasseVaaben];
    karakter.faerdigheder = klasseFaerdighederne.map(f => f.id);
    karakter.valgteFaerdigheder = klasseFaerdighederne.map(f => f.id);
    karakter.besvaergelser = (karakter.besvaergelser || []).map(b => typeof b === 'string' ? b : b.id);
    karakter.valgteBesvaergelser = [...karakter.besvaergelser];

    opdaterVistData(); // beregner livMax, sejdMax, huMax ud fra evnelevels
    karakter.livNu  = karakter.livMax;
    karakter.sejdNu = karakter.sejdMax;
    karakter.huNu   = karakter.huMax;
    karakter.flaskerNu = karakter.flaskerMax;
    gemData();
    opdaterVistData();
    visArk();
    visBesked(`Karakter nulstillet til ${karakterVisningsnavn[klasse]}`);
    lukVindue('ny-karakter');
    initEvneVindue();
}