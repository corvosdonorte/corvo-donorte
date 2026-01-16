// ======================================================
// FIREBASE IMPORTS
// ======================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore, collection, getDocs,
  addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ======================================================
// FIREBASE CONFIG
// ======================================================
const firebaseConfig = {
  apiKey: "AIzaSyBIW5VVHxqchFRoaCoesLLAUXvYW7bvDr4",
  authDomain: "corvosdonorte-48440.firebaseapp.com",
  projectId: "corvosdonorte-48440",
  storageBucket: "corvosdonorte-48440.firebasestorage.app",
  messagingSenderId: "306517537620",
  appId: "1:306517537620:web:2942dceb67154cd6054ec1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ======================================================
// COLLECTION
// ======================================================
const rankingRef = collection(db, "ranking");

// ======================================================
// GLOBAL STATE (⚠️ GARANTIDO)
// ======================================================
let grupo = [];
let admin = false;
let authReady = false;

// ======================================================
// AUTH
// ======================================================
onAuthStateChanged(auth, user => {
  admin = user?.email === "corvosdonorte@gmail.com";
  authReady = true;
  document.body.classList.toggle("admin", admin);
  carregarRanking();
});

// ======================================================
// NAV
// ======================================================
function irPara(view) {
  document.getElementById("home").hidden = view !== "home";
  document.getElementById("atividades").hidden = view !== "atividades";
}

// ======================================================
// RANK HELPERS (SEU CÓDIGO)
// ======================================================
function rank(p, d) {
  if (p >= 50 && d >= 100) return "Adamantita";
  if (p >= 49 && d >= 85) return "Oricalco";
  if (p >= 35 && d >= 70) return "Mithril";
  if (p >= 25 && d >= 55) return "Platina";
  if (p >= 15 && d >= 35) return "Ouro";
  if (p >= 10 && d >= 20) return "Prata";
  if (p >= 5 && d >= 10) return "Bronze";
  return "Ferro";
}

const cls = t =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const coroa = () => `<span class="coroa">👑</span>`;

// ======================================================
// PRESENÇA
// ======================================================
const mesAtual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
};

const presencaPadrao = () => ({
  mes: mesAtual(),
  dias: Array(8).fill(null)
});

function garantirPresenca(m) {
  if (!m.presenca || m.presenca.mes !== mesAtual()) {
    m.presenca = presencaPadrao();
    updateDoc(doc(db, "ranking", m.id), { presenca: m.presenca });
  }
}

// ======================================================
// LOAD
// ======================================================
async function carregarRanking() {
  if (!authReady) return;

  grupo = [];
  const snap = await getDocs(rankingRef);
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));

  grupo.forEach(garantirPresenca);
  grupo.sort((a,b)=> (b.pontos ?? 0) - (a.pontos ?? 0));

  renderRanking();
  renderPresenca();
}

// ======================================================
// CRUD (INALTERADO)
// ======================================================
async function adicionarMembro() {
  if (!admin) return;

  const nome = nomeInput.value.trim();
  if (!nome || !classe.value) return;

  await addDoc(rankingRef, {
    nome,
    classe: classe.value,
    titulo: titulo.value || "",
    pontos: 0,
    drakimas: 0,
    presenca: presencaPadrao()
  });

  nomeInput.value = "";
  carregarRanking();
}

// ======================================================
// PRESENÇA SVG
// ======================================================
const svg = {
  null: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  true: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#2ecc71"/><path d="M7 12l3 3 6-6" stroke="#000" stroke-width="2" fill="none"/></svg>`,
  false: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#e74c3c"/><path d="M8 8l8 8M16 8l-8 8" stroke="#000" stroke-width="2"/></svg>`,
  justificado: `<svg viewBox="0 0 24 24"><polygon points="12,3 22,20 2,20" fill="#f1c40f"/><text x="12" y="16" text-anchor="middle" font-size="12">?</text></svg>`
};

// ======================================================
// PRESENÇA ACTION
// ======================================================
async function togglePresenca(i, d) {
  if (!admin) return;
  const estados = [null, true, false, "justificado"];
  const atual = grupo[i].presenca.dias[d];
  grupo[i].presenca.dias[d] =
    estados[(estados.indexOf(atual)+1)%4];

  await updateDoc(doc(db,"ranking",grupo[i].id),{
    presenca: grupo[i].presenca
  });
  renderPresenca();
}

// ======================================================
// RENDER PRESENÇA (TABELA)
// ======================================================
function renderPresenca() {
  const tbody = document.getElementById("tabela-presenca");
  if (!tbody) return;

  tbody.innerHTML = "";

  grupo.forEach((m,i)=>{
    const dias = m.presenca.dias.map((v,d)=>`
      <span class="presenca" ${admin?`onclick="togglePresenca(${i},${d})"`:""}>
        ${svg[v]}
      </span>`).join("");

    tbody.innerHTML += `
      <tr>
        <td>${m.nome}</td>
        <td><div class="dias">${dias}</div></td>
      </tr>`;
  });
}

// ======================================================
// RENDER RANKING (SEU MODELO)
// ======================================================
function renderRanking() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  grupo.forEach((m,i)=>{
    const r = rank(m.pontos,m.drakimas);
    const top = i===0?"top1":i===1?"top2":i===2?"top3":"";

    lista.innerHTML += `
      <li class="${top}">
        <span class="nome">
          ${i<3?coroa():""}${i+1}º ${m.nome}
          — ${m.pontos} vitórias
          <span class="badge classe ${cls(m.classe)}">${m.classe}</span>
          <span class="badge ${cls(r)}">${r}</span>
        </span>
      </li>`;
  });
}

// ======================================================
// EXPORTS (OBRIGATÓRIO)
// ======================================================
window.loginGoogle = () => signInWithPopup(auth,provider);
window.logoutGoogle = () => signOut(auth);
window.adicionarMembro = adicionarMembro;
window.irPara = irPara;
window.togglePresenca = togglePresenca;
