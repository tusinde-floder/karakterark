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




// ======================
// === LEVELFORDELING ===
// ======================

let fordelingsTilstand = {
    pulje: [],
    tildelt: {},
    valgt: null,   // { vaerdi, kilde } — kilde er 'pulje' eller en evne-nøgle
    laastEvne: null
};
let dragKilde = null;

function initLevelfordeling(laastEvne) {
    fordelingsTilstand = {
        pulje: [15, 12, 10, 8, 5, 4],
        tildelt: {
            form: null, sind: null, intuition: null,
            styrke: null, behaendighed: null, visdom: null, mystik: null
        },
        valgt: null,
        laastEvne: laastEvne
    };
    fordelingsTilstand.tildelt[laastEvne] = 18;

    document.getElementById('levelfordeling-klasse').textContent = karakter.klasse;
    genererLevelfordelingUI();
}

function genererLevelfordelingUI() {
    const evneBeholder = document.getElementById('levelfordeling-evner');
    const puljeBeholder = document.getElementById('levelfordeling-pulje');
    evneBeholder.innerHTML = '';
    puljeBeholder.innerHTML = '';

    for (const evne of evneNoegler) {
        const erLaast = evne === fordelingsTilstand.laastEvne;
        const vaerdi = fordelingsTilstand.tildelt[evne];

        const raekke = document.createElement('div');
        raekke.className = 'levelfordeling__raekke' + (erLaast ? ' levelfordeling__raekke--laast' : '');

        const navn = document.createElement('div');
        navn.className = 'levelfordeling__evne-navn';
        navn.textContent = evneVisningsnavn[evne];

        const slot = document.createElement('div');
        slot.className = 'levelfordeling__slot' + (erLaast ? ' levelfordeling__slot--laast' : '');

        if (vaerdi !== null) slot.appendChild(opretToken(vaerdi, evne));

        if (!erLaast) {
            slot.addEventListener('click', () => klikPaaSlot(evne));
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('dragenter', () => slot.classList.add('levelfordeling__slot--over'));
            slot.addEventListener('dragleave', () => slot.classList.remove('levelfordeling__slot--over'));
            slot.addEventListener('drop', (e) => {
                slot.classList.remove('levelfordeling__slot--over');
                dropPaaSlot(e, evne);
            });
        }

        raekke.appendChild(navn);
        raekke.appendChild(slot);
        evneBeholder.appendChild(raekke);
    }

    for (const vaerdi of fordelingsTilstand.pulje) {
        puljeBeholder.appendChild(opretToken(vaerdi, 'pulje'));
    }
}

function opretToken(vaerdi, kilde) {
    const erLaast = kilde === fordelingsTilstand.laastEvne;
    const erValgt = fordelingsTilstand.valgt?.vaerdi === vaerdi
                 && fordelingsTilstand.valgt?.kilde === kilde;

    const el = document.createElement('div');
    el.className = 'levelfordeling__token';
    if (erLaast) el.classList.add('levelfordeling__token--laast');
    if (erValgt) el.classList.add('levelfordeling__token--valgt');
    el.textContent = vaerdi;
    el.draggable = !erLaast;

    if (!erLaast) {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            klikPaaToken(vaerdi, kilde);
        });
        el.addEventListener('dragstart', () => {
            dragKilde = { vaerdi, kilde };
        });
        el.addEventListener('dragend', () => {
            dragKilde = null;
        });
    }

    return el;
}

// Klik-handlers
function klikPaaToken(vaerdi, kilde) {
    const valgt = fordelingsTilstand.valgt;
    if (valgt?.vaerdi === vaerdi && valgt?.kilde === kilde) {
        fordelingsTilstand.valgt = null;
    } else {
        fordelingsTilstand.valgt = { vaerdi, kilde };
    }
    genererLevelfordelingUI();
}

function klikPaaSlot(evne) {
    const { tildelt, pulje, valgt } = fordelingsTilstand;

    if (valgt === null) {
        // Intet valgt: returnér slot-værdien til puljen
        if (tildelt[evne] !== null) {
            pulje.push(tildelt[evne]);
            pulje.sort((a, b) => b - a);
            tildelt[evne] = null;
        }
    } else if (valgt.kilde === evne) {
        // Klik på samme slot som det valgte token: fravælg
        fordelingsTilstand.valgt = null;
    } else {
        const { vaerdi, kilde } = valgt;

        if (kilde === 'pulje') {
            if (tildelt[evne] !== null) {
                pulje.push(tildelt[evne]);
                pulje.sort((a, b) => b - a);
            }
            pulje.splice(pulje.indexOf(vaerdi), 1);
            tildelt[evne] = vaerdi;
        } else {
            // Slot til slot: byt
            tildelt[kilde] = tildelt[evne];
            tildelt[evne] = vaerdi;
        }

        fordelingsTilstand.valgt = null;
    }

    genererLevelfordelingUI();
}

// Drag-handlers
function dropPaaSlot(e, evne) {
    e.preventDefault();
    if (!dragKilde || evne === fordelingsTilstand.laastEvne) return;

    const { vaerdi, kilde } = dragKilde;
    const { tildelt, pulje } = fordelingsTilstand;

    if (kilde === 'pulje') {
        if (tildelt[evne] !== null) {
            pulje.push(tildelt[evne]);
            pulje.sort((a, b) => b - a);
        }
        pulje.splice(pulje.indexOf(vaerdi), 1);
        tildelt[evne] = vaerdi;
    } else if (kilde !== evne) {
        tildelt[kilde] = tildelt[evne];
        tildelt[evne] = vaerdi;
    }

    dragKilde = null;
    genererLevelfordelingUI();
}

function dropPaaPulje(e) {
    e.preventDefault();
    if (!dragKilde || dragKilde.kilde === 'pulje') return;

    const { vaerdi, kilde } = dragKilde;
    if (kilde !== fordelingsTilstand.laastEvne) {
        fordelingsTilstand.tildelt[kilde] = null;
        fordelingsTilstand.pulje.push(vaerdi);
        fordelingsTilstand.pulje.sort((a, b) => b - a);
    }

    dragKilde = null;
    genererLevelfordelingUI();
}

function bekræftLevelfordeling() {
    const { tildelt } = fordelingsTilstand;

    const alleUdfyldt = evneNoegler.every(evne => tildelt[evne] !== null);
    if (!alleUdfyldt) {
        visBesked('Fordel alle levels før du fortsætter.');
        return;
    }

    karakter.navn = document.getElementById('levelfordeling-navn').value.trim() || 'Karakter';

    for (const evne of evneNoegler) {
        karakter[evne] = tildelt[evne];
    }

    opdaterEffektiveEvner();
    beregnRessourcer();
    karakter.livNu  = karakter.livMax;
    karakter.sejdNu = karakter.sejdMax;
    karakter.huNu   = karakter.huMax;
    karakter.flaskerNu = karakter.flaskerMax;
    gemData();
    opdaterVistData();

    visArk();
    lukVindue('levelfordeling');
    visBesked(`${karakter.navn} oprettet.`);
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
    const klasseUdstyrRef = klasseData.udstyr || [];
    const klasseUdstyr = klasseUdstyrRef.map(ref => {
        return altUdstyr.find(u => u.id === ref.id);
    })

    Object.assign(karakter, baseKarakter, klasseData);
    karakter.vaaben = [...klasseVaaben];
    karakter.faerdigheder = klasseFaerdighederne.map(f => f.id);
    karakter.valgteFaerdigheder = klasseFaerdighederne.map(f => f.id);
    karakter.besvaergelser = (karakter.besvaergelser || []).map(b => typeof b === 'string' ? b : b.id);
    karakter.valgteBesvaergelser = [...karakter.besvaergelser];
    karakter.udstyr = klasseUdstyr.map(u => u.id);
    karakter.valgtUdstyr = klasseUdstyr.map(u => u.id);

    gemData();
    skjulArk();
    const startEvne = evneNoegler.find(evne => klasseData[evne] === 18);
    lukVindue('ny-karakter');
    initLevelfordeling(startEvne);
    aabenVindue('levelfordeling');
}