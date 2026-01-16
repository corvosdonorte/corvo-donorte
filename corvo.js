import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore, collection, getDocs,
  addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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

const rankingRef = collection(db, "ranking");

let grupo = [];
let admin = false;
let authReady = false;
let currentView = "home";

onAuthStateChanged(auth, user => {
  admin = user?.email === "corvosdonorte@gmail.com";
  authReady = true;
  carregarRanking();
  aplicarEstadoAuth();
});

async function loginGoogle() {
  await signInWithPopup(auth, provider);
}

async function logoutGoogle() {
  await signOut(auth);
}

function aplicarEstadoAuth() {
  document.body.classList.toggle("admin", admin);
}

function irPara(view) {
  currentView = view;
  const home = document.getElementById("home");
  const atividades = document.getElementById("atividades");
  if (home) home.hidden = view !== "home";
  if (atividades) atividades.hidden = view !== "atividades";
}

function rank(pontos, drakimas) {
  if (pontos >= 50 && drakimas >= 100) return "Adamantita";
  if (pontos >= 49 && drakimas >= 85) return "Oricalco";
  if (pontos >= 35 && drakimas >= 70) return "Mithril";
  if (pontos >= 25 && drakimas >= 55) return "Platina";
  if (pontos >= 15 && drakimas >= 35) return "Ouro";
  if (pontos >= 10 && drakimas >= 20) return "Prata";
  if (pontos >= 5 && drakimas >= 10) return "Bronze";
  return "Ferro";
}

function cls(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function coroa() {
  return `<span class="coroa">👑</span>`;
}

function drakimaIcon() {
  return `
  <svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.15"/>
    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M22 26c0-6 4-10 10-10s10 4 10 10c0 4-2 7-4 9v4c0 2-2 4-6 4s-6-2-6-4v-4c-2-2-4-5-4-9z"
      fill="currentColor"/>
  </svg>`;
}

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function presencaPadrao() {
  return { mes: mesAtual(), dias: Array(8).fill(null) };
}

function garantirPresenca(m) {
  if (!m.presenca || m.presenca.mes !== mesAtual()) {
    m.presenca = presencaPadrao();
    updateDoc(doc(db, "ranking", m.id), { presenca: m.presenca });
  }
}

async function carregarRanking() {
  if (!authReady) return;

  grupo = [];
  const snap = await getDocs(rankingRef);
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));

  grupo.forEach(garantirPresenca);
  grupo.sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0));

  mostrar();
  mostrarPresenca();
}

async function adicionarMembro() {
  if (!admin) return;

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  const titulo = document.getElementById("titulo").value;

  if (!nome || !classe) return;

  await addDoc(rankingRef, {
    nome, classe, titulo: titulo || "",
    pontos: 0, drakimas: 0,
    presenca: presencaPadrao()
  });

  document.getElementById("nome").value = "";
  carregarRanking();
}

async function vitoria(i) {
  if (!admin) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), { pontos: grupo[i].pontos + 1 });
  carregarRanking();
}

async function derrota(i) {
  if (!admin || grupo[i].pontos === 0) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), { pontos: grupo[i].pontos - 1 });
  carregarRanking();
}

async function editarMembro(i) {
  if (!admin) return;
  const m = grupo[i];

  const titulo = prompt("Título:", m.titulo || "");
  const classe = prompt("Classe:", m.classe);
  const dr = parseInt(prompt("Drakimas:", m.drakimas ?? 0), 10);

  if (isNaN(dr)) return;

  await updateDoc(doc(db, "ranking", m.id), { titulo, classe, drakimas: dr });
  carregarRanking();
}

async function remover(i) {
  if (!admin || !confirm("Remover este membro?")) return;
  await deleteDoc(doc(db, "ranking", grupo[i].id));
  carregarRanking();
}

const svgVazio = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
const svgOk = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#2ecc71"/><path d="M7 12l3 3 6-6" stroke="#000" stroke-width="2" fill="none"/></svg>`;
const svgNo = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#e74c3c"/><path d="M8 8l8 8M16 8l-8 8" stroke="#000" stroke-width="2"/></svg>`;
const svgJust = `<svg viewBox="0 0 24 24"><polygon points="12,3 22,20 2,20" fill="#f1c40f"/><text x="12" y="16" text-anchor="middle" font-size="12">?</text></svg>`;

function iconPresenca(v) {
  if (v === true) return svgOk;
  if (v === false) return svgNo;
  if (v === "justificado") return svgJust;
  return svgVazio;
}

async function togglePresenca(i, d) {
  if (!admin) return;

  const estados = [null, true, false, "justificado"];
  const atual = grupo[i].presenca.dias[d];
  grupo[i].presenca.dias[d] =
    estados[(estados.indexOf(atual) + 1) % estados.length];

  await updateDoc(doc(db, "ranking", grupo[i].id), { presenca: grupo[i].presenca });
  mostrarPresenca();
}

function mostrarPresenca() {
  const lista = document.getElementById("lista-presenca");
  if (!lista) return;

  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const dias = m.presenca.dias.map((v, d) =>
      `<span class="bolinha" ${admin ? `onclick="togglePresenca(${i},${d})"` : ""}>
        ${iconPresenca(v)}
      </span>`
    ).join("");

    lista.innerHTML += `
      <li class="linha-presenca">
        <span class="nome-presenca">${m.nome}</span>
        <div class="dias-presenca">${dias}</div>
      </li>
    `;
  });
}

function mostrar() {
  const lista = document.getElementById("ranking");
  if (!lista) return;

  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const r = rank(m.pontos, m.drakimas);
    const top = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";

    lista.innerHTML += `
      <li class="${top}">
        <span class="nome">
          ${i < 3 ? coroa() : ""}${i + 1}º ${m.nome}
          — ${m.pontos} vitórias
          <span class="badge drakma">${drakimaIcon()} ${m.drakimas}</span>
          ${m.titulo ? `<span class="badge titulo ${cls(m.titulo)}">${m.titulo}</span>` : ""}
          <span class="badge classe ${cls(m.classe)}">${m.classe}</span>
          <span class="badge ${cls(r)}">${r}</span>
        </span>

        ${admin ? `
        <div class="acoes">
          <button class="btn" onclick="vitoria(${i})">+</button>
          <button class="btn" onclick="derrota(${i})">-</button>
          <button class="btn editar" onclick="editarMembro(${i})">🖌️</button>
          <button class="btn" onclick="remover(${i})">🗑</button>
        </div>` : ""}
      </li>`;
  });
}

window.loginGoogle = loginGoogle;
window.logoutGoogle = logoutGoogle;
window.adicionarMembro = adicionarMembro;
window.vitoria = vitoria;
window.derrota = derrota;
window.editarMembro = editarMembro;
window.remover = remover;
window.irPara = irPara;
window.togglePresenca = togglePresenca;
