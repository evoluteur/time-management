// Time Management
// (c) 2025 Laurent Pellet & Olivier Giulieri

const strings = {
  EN: {
    m: " months",
    mToGo: " months to go",
    school: "Study",
    retirement: "Retirement",
    wLife: "Work life",
    tSleep: " sleeping",
    tWork: " working",
    tPerso: " of personal time",
  },
  FR: {
    m: " mois",
    mToGo: " mois restant à vivre",
    school: "Etudes",
    retirement: "Retraite",
    wLife: "Vie active",
    tSleep: " à dormir",
    tWork: " à travailler",
    tPerso: " de temps personnel",
  },
};
let language = "EN";
let i18n = strings.EN;
const today = new Date();
const currentYear = today.getFullYear();
const bDate = new Date("1969-09-26");
let age = today.getFullYear() - bDate.getFullYear();
const monthDiff = today.getMonth() - bDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bDate.getDate())) {
  age--;
}
const loloConfig = {
  etudes: 22,
  retraite: 64,
  expectancy: 84,
  age,
  ageM: monthDiff < 0 ? -monthDiff : 0,
};
const fields = ["etudes", "retraite", "expectancy", "age", "ageM"];
const $ = (id) => document.getElementById(id);
const setup = (lang) => {
  language = lang;
  i18n = strings[lang];
  let fvs = localStorage.getItem("lolo-config");
  if (fvs) {
    fvs = JSON.parse(fvs);
  } else {
    fvs = loloConfig;
  }
  fields.forEach((f) => ($(f).value = fvs[f]));
  stage = $("stage");
  life = $("life");
  calc = $("calc");
  $("cYear").innerHTML = currentYear;
};

const reset = () => {
  fields.forEach((f) => ($(f).value = loloConfig[f]));
  localStorage.removeItem("lolo-config");
};

let config = {};
const getConfig = () => {
  let invalid = false;
  config = {};
  fields.forEach((fid) => {
    const f = $(fid);
    const fv = parseInt(f.value) || 0;
    if (fid != "ageM" && !fv) {
      invalid = true;
      f.className = "invalid";
    } else {
      f.className = "";
    }
    config[fid] = fv;
  });
  return invalid ? null : config;
};

const saveConfig = () => {
  localStorage.setItem("lolo-config", JSON.stringify(config));
};

let stage;
let life;
const setButtons = (go, clearPast, slice, again) => {
  const btns = document.getElementsByTagName("button");
  btns[0].disabled = go;
  btns[1].disabled = clearPast;
  btns[2].disabled = slice;
  btns[3].disabled = again;
};

const hideForm = () => {
  $("inputs").className = "hidden";
};

const showForm = () => {
  $("inputs").className = "";
};

const build = () => {
  const valid = getConfig();
  if (!valid) {
    return;
  }
  saveConfig();
  clean(true);
  hideForm();
  life.innerHTML = "";
  life.style = "border-color:silver;";

  setTimeout(() => {
    addAxisNum(0);
    const t = addLegend(0, config.expectancy / 2, "", "total");
    for (let r = 0; r < config.expectancy; r++) {
      const isOdd = r % 2 !== 0;
      const pre = isOdd ? 12 : 0;
      for (let c = 0; c < 12; c++) {
        const pix = document.createElement("div");
        pix.style = "opacity:0";
        pix.setAttribute("data-col", pre + c);
        life.append(pix);
      }
    }
    life.scrollIntoView();
    const nodes = Array.from(life.children);
    const maxI = config.expectancy * 12;

    let i = 0;
    const myInterval = setInterval(() => {
      nodes[i].style = "";
      i++;
      t.innerHTML = i + i18n.m;
      if (i >= maxI) {
        clearInterval(myInterval);
        setTimeout(() => {
          clearStyles();
          addAxisNum(config.expectancy);
          setTimeout(() => {
            setButtons(true, false, true, true);
            calc0();
          }, 50);
        }, 500);
      }
    }, 5);
  }, 500);
};

function calc0() {
  calc.innerHTML =
    language === "EN"
      ? `
  <h2>Analysis of a ${config.expectancy}-year life</h2>
  <p>We start from the assumption of a ${
    config.expectancy
  }-year life, which is ${config.expectancy * 12} months (${
          config.expectancy
        }x12).</p>`
      : `
  <h2>Analyse d'une vie de ${config.expectancy} ans</h2>
  <p>Nous partons de l'hypothèse d'une vie de ${config.expectancy} ans, soit ${
          config.expectancy * 12
        } mois (${config.expectancy}x12).</p>`;
}

const addAxisNum = (year, offset = 0, id) => {
  const elem = document.createElement("div");
  elem.innerHTML = year;
  elem.className = "axis";
  if (id) {
    elem.id = id;
  }
  const rowIdx = year === 0 ? 1 : Math.ceil((year + offset) / 2);
  elem.style = `bottom:${rowIdx * 14}px`;
  stage.appendChild(elem);
};

const addLegend = (text, year, css, id, suffix) => {
  const elem = document.createElement("div");
  if (id) {
    elem.id = id;
  }
  elem.innerHTML = text + i18n.m + (suffix ? suffix : "");
  elem.className = "legend " + (css ? css : "");
  const rowIdx = year === 0 ? 1 : Math.ceil(year / 2);
  elem.style = `bottom:${-6 + rowIdx * 14}px`;
  stage.appendChild(elem);
  return elem;
};

const addZoneLegend = (text, css, year) => {
  const elem = document.createElement("div");
  elem.innerHTML = text;
  elem.className = "z-legend " + (css ? css : "");
  const rowIdx = year === 0 ? 1 : Math.ceil(year / 2);
  elem.style = `bottom:${-6 + rowIdx * 14}px`;
  stage.appendChild(elem);
};

const clean = (noEnablement) => {
  setButtons(true, true, true, true);
  stage.innerHTML = '<div id="life" class="life"></div>';
  calc.innerHTML = "";
  life = $("life");
  showForm();
  if (!noEnablement) {
    setTimeout(() => {
      setButtons(false, true, true, true);
    }, 50);
  }
};

const clearStyles = () => {
  const nodes = Array.from(life.children);
  nodes.forEach((n) => (n.style = ""));
};

const ageMonths = () => config.age * 12 + config.ageM - 1;

const hidePast = () => {
  setButtons(true, true, true, true);
  const nodes = life.childNodes;
  const totalCount = nodes.length;
  const ageNode = ageMonths();
  const stopIdx = ageNode - 1;
  const t = $("total");
  let i = 0;
  const myInterval = setInterval(() => {
    nodes[i]?.classList.add("expired");
    i++;
    t.innerHTML = totalCount - i + i18n.mToGo;
    if (i > stopIdx) {
      clearInterval(myInterval);
      setTimeout(() => {
        addAxisNum(config.age, 1, "age-legend");
        nodes[ageNode].classList.add("age");
        setButtons(true, true, false, true);
      }, 500);
    }
  }, 1);
};

const showPast = () => {
  const maxNode = ageMonths();
  const nodes = life.childNodes;
  for (let i = 0; i < maxNode; i++) {
    const child = nodes[i];
    child.style = "";
    child.classList.remove("expired");
  }
  $("total").innerHTML = nodes.length + i18n.m;
  setTimeout(() => {
    $("total")?.remove();
  }, 1000);
};

const slice = () => {
  setButtons(true, true, true, true);
  showPast();
  setTimeout(school, 1000);
};

const school = () => {
  const maxNode = config.etudes * 12;
  const nodes = life.childNodes;
  for (let i = 0; i < maxNode; i++) {
    const child = nodes[i];
    child.style = "";
    child.className = "school";
  }
  setTimeout(() => {
    addAxisNum(config.etudes);
    setTimeout(() => {
      const y = config.etudes / 2 + 1;
      addZoneLegend(i18n.school, "z-school", y);
      addLegend(maxNode, y, "l-school");
      setTimeout(() => {
        retire();
      }, 500);
    }, 500);
  }, 500);
};

const retire = () => {
  const minNode = config.retraite * 12 - 1;
  const nodes = life.childNodes;
  for (let i = nodes.length - 1; i > minNode; i--) {
    const child = nodes[i];
    child.style = "";
    child.classList.add("retired");
  }
  setTimeout(() => {
    addAxisNum(config.retraite, 1);
    setTimeout(() => {
      const years = config.expectancy - config.retraite;
      const y = (config.retraite + config.expectancy) / 2 + 1;
      addZoneLegend(i18n.retirement, "z-retired", y);
      addLegend(years * 12, y, "l-retired");
      setTimeout(() => {
        calc1();
        split();
      }, 500);
    }, 500);
  }, 500);
};

function calc1() {
  const yTotal = config.expectancy;
  const mTotal = yTotal * 12;
  const yYouth = config.etudes;
  const mYouth = yYouth * 12;
  const yRetraite = config.retraite;
  const mRetraite = (yTotal - yRetraite) * 12;

  calc.innerHTML +=
    language === "EN"
      ? `
  <p>This time span is divided into three main periods: youth, working life, and retirement.</p>
  <h3>Initial breakdown of ${mTotal} months</h3>
  <ul>
    <li>${mYouth} months of youth (up to age ${yYouth}), which is ${yYouth} years x 12 months</li>
    <li>${mRetraite} months of retirement (from age ${yRetraite} to ${yTotal}), which is ${
          yTotal - yRetraite
        } years x 12 months</li>
    <li>${
      (yRetraite - yYouth) * 12
    } months of working life (from age ${yYouth} to ${yRetraite}), which is ${
          yRetraite - yYouth
        } x 12 months</li>
  </ul>`
      : `
  <p>Cette durée est repartie en trois grandes périodes: jeunesse, vie active et retraite.</p>
  <h3>Répartition initiale des ${mTotal} mois</h3>
  <ul>
    <li>${mYouth} mois de jeunesse (jusqu'a ${yYouth} ans) soit ${yYouth} ans x 12 mois</li>
    <li>${mRetraite} mois de retraite (entre ${yRetraite} et ${yTotal} ans) soit ${
          yTotal - yRetraite
        } ans x 12 mois</li>
    <li>${
      (yRetraite - yYouth) * 12
    } mois de vie active (de ${yYouth} a ${yRetraite} ans) soit ${
          yRetraite - yYouth
        } x 12 mois</li>
  </ul>`;
}

const split = () => {
  const grid = Array.from(life.children);
  const grid1 = grid.slice(config.etudes * 12, config.retraite * 12);
  const vaMonths = grid1.length;

  const vieActive = [];
  for (let i = 0; i < 24; i++) {
    const dcol = "" + i;
    vieActive.push(...grid1.filter((c) => c.getAttribute("data-col") === dcol));
  }

  const y0 = config.retraite - 20;

  setTimeout(() => {
    const y = 2 + (config.retraite + config.etudes) / 2;
    addZoneLegend(i18n.wLife, "z-worklife", y);
    setTimeout(() => {
      const maxDodo = parseInt(vaMonths / 3);
      for (let i = 0; i < maxDodo; i++) {
        vieActive[i].classList.add("dodo");
      }
      setTimeout(() => {
        addLegend(maxDodo, y0 + 8, "l-dodo", null, i18n.tSleep);
        setTimeout(() => {
          const maxBoulot = maxDodo + parseInt(vaMonths * 0.2);
          for (let i = maxDodo; i < maxBoulot; i++) {
            vieActive[i].classList.add("boulot");
          }
          setTimeout(() => {
            addLegend(
              maxBoulot - maxDodo,
              y0 + 4,
              "l-boulot",
              null,
              i18n.tWork
            );
            setTimeout(() => {
              for (let i = maxBoulot; i < vaMonths; i++) {
                vieActive[i].classList.add("perso");
              }
              setTimeout(() => {
                addLegend(
                  vaMonths - maxBoulot,
                  y0,
                  "l-perso",
                  null,
                  i18n.tPerso
                );
                setTimeout(() => {
                  setButtons(true, true, true, false);
                  calc2();
                }, 500);
              }, 500);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }, 500);
};

function calc2() {
  const yTotal = config.expectancy;
  const mTotal = yTotal * 12;
  const yYouth = config.etudes;
  const mYouth = yYouth * 12;
  const yRetraite = config.retraite;
  const mRetraite = (yTotal - yRetraite) * 12;
  const yVA = yRetraite - yYouth;
  const mVA = yVA * 12;
  const mSleep = Math.round(mVA / 3);
  const mWork = Math.round((mVA * 19.9) / 100);
  const mWork2d = (Math.round(mVA * 19.9) / 100 + "").replace(".", ",");
  const mPerso = mVA - mSleep - mWork;

  calc.innerHTML +=
    language === "EN"
      ? `
  <h3>Focus on the working life period (${mVA} months)</h3>

  <h4 class="l-dodo"><div class="dodo"></div>Sleep time (${mSleep} months)</h4>
  <div class="indent">
    <p>The working life lasts ${yVA} years (${yRetraite}-${yYouth}), which equals ${mVA} months (${yVA} x 12)</p>
    <p>We sleep 8 hours per day, which is 1/3 of the time. So sleep during the working life lasts ${mSleep} months (${mVA}/3)</p>
  </div>

  <h4 class="l-boulot"><div class="boulot"></div>Work time (${mWork} months)</h4>
  <div class="indent">
    <p>In France, the maximum number of working days per year is 218</p>
    <p>The standard workday is 8 hours</p>
    <p>This equals 1,744 hours worked per year (218 x 8h)</p>
    <p>Over a working life of ${yVA} years, that adds up to ${
          yVA * 1744
        } hours of work (1,744 x ${yVA})</p>
    <p>There are 8,760 hours in a year (365 days x 24 hours)</p>
    <p>So there are ${
      8760 * yVA
    } hours in the ${yVA}-year working life (8,760 x ${yVA})</p>
    <p>Work time represents 20% of the working life (${yVA * 1744} / ${
          8760 * yVA
        } = 19.9%, rounded to 20%)</p>
    <p>Therefore, work time represents ${mWork} months (${mVA} x 19.9% = ${mWork2d}, rounded to ${mWork} months)</p>
  </div>
  <h4 class="l-perso"><div class="perso"></div>Personal awake time (${mPerso} months)</h4>
  <div class="indent">
    <p>Personal awake time during working life = Total working life (${mVA} months) - Sleep time (${mSleep} months) - Work time (${mWork} months) = ${mPerso} months (${mVA} – ${mSleep} – ${mWork})</p>
  </div>
  <p><br/><a href="javascript:print()" class="print">Print</a></p>`
      : `
  <h3>Focus sur la période de vie active (${mVA} mois)</h3>
  <h4 class="l-dodo"><div class="dodo"></div>Le temps de sommeil (${mSleep} mois)</h4>
  <div class="indent">
    <p>La vie active dure ${yVA} ans (${yRetraite}-${yYouth}) soit ${mVA} mois (${yVA} x 12)</p>
    <p>On dort 8h par jour soit 1/3 du temps. Le sommeil pendant la vie active dure donc ${mSleep} mois (${mVA}/3)</p>
  </div>
  <h4 class="l-boulot"><div class="boulot"></div>Le temps de travail (${mWork} mois)</h4>
  <div class="indent">
    <p>En France, le nombre maximum de jours travaillés est de 218 jours par an</p>
    <p>Le temps de travail est de 8h / jour</p>
    <p>Cela représente 1744 heures travaillées par an (218 x 8h).</p>
    <p>Sur la durée de vie active de ${yVA} ans cela représente ${
          yVA * 1744
        } heures de travail (1744 x ${yVA})</p>
    <p>Il y a 8760 heures dans une année (365 jours x 24 heures)</p>
    <p>Il y a donc ${
      8760 * yVA
    } heures dans la vie active de ${yVA} ans (8760 x ${yVA})</p>
    <p>Le temps de travail représente 20% de la vie active (${yVA * 1744} / ${
          8760 * yVA
        } = 19,9% arrondi à 20%)</p>
    <p>Le temps de travail représente donc ${mWork} mois (${mVA} x 19,9% = ${mWork2d} arrondi à ${mWork} mois)</p>
  </div>
  <h4 class="l-perso"><div class="perso"></div>Le temps personnel éveillé (${mPerso} mois)</h4>
  <div class="indent">
    <p>Le temps personnel éveillé pendant la vie active = Total de la vie active (${mVA} mois) - Temps de
    sommeil (${mSleep} mois) - Temps travail pendant la vie active (${mWork} mois) = ${mPerso} mois (${mVA} – ${mSleep} – ${mWork})</p>
  </div>
  <p><br/><a href="javascript:print()" class="print">Imprimer</a></p>`;
}
