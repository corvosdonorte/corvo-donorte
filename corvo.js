import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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
const rankingRef = collection(db, "ranking");

let grupo = [];
const SENHA_ADMIN = "corvosvoamjuntos";
let modoAdmin = sessionStorage.getItem("admin") === "true";

const rankingEl = document.getElementById("ranking");
const painelAdmin = document.getElementById("painelAdmin");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnAdicionar = document.getElementById("btnAdicionar");

btnLogin.onclick = () => {
  const senha = prompt("Senha de administrador:");
  if (senha === SENHA_ADMIN) {
    modoAdmin = true;
    sessionStorage.setItem("admin", "true");
    atualizarUIAdmin();
  } else {
    alert("Senha incorreta");
  }
};

btnLogout.onclick = () => {
  modoAdmin = false;
  sessionStorage.removeItem("admin");
  atualizarUIAdmin();
};

function atualizarUIAdmin() {
  painelAdmin.classList.toggle("hidden", !modoAdmin);
  btnLogin.classList.toggle("hidden", modoAdmin);
  btnLogout.classList.toggle("hidden", !modoAdmin);
  render();
}

onSnapshot(rankingRef, snapshot => {
  grupo = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  grupo.sort((a, b) => b.pontos - a.pontos);
  render();
});

btnAdicionar.onclick = async () => {
  if (!modoAdmin) return;
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return alert("Digite um nome");

  await addDoc(rankingRef, { nome, classe, pontos: 0 });
  document.getElementById("nome").value = "";
};

function vitoria(id, pontos) {
  updateDoc(doc(db, "ranking", id), { pontos: pontos + 1 });
}

function derrota(id, pontos) {
  if (pontos > 0)
    updateDoc(doc(db, "ranking", id), { pontos: pontos - 1 });
}

function remover(id) {
  if (confirm("Remover este membro?"))
    deleteDoc(doc(db, "ranking", id));
}

/* RENDER */
function calcularRank(p) {
  if (p <= 5) return "Ferro";
  if (p <= 10) return "Prata";
  if (p <= 15) return "Ouro";
  if (p <= 20) return "Platina";
  if (p <= 25) return "Mithril";
  if (p <= 30) return "Oricalco";
  return "Adamante";
}

function normalizar(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function render() {
  let html = "";

  grupo.forEach((m, i) => {
    const rank = calcularRank(m.pontos);
    const top = i < 3 ? `top${i + 1}` : "";

    html += `
      <li class="${top}">
        <span class="nome">
          ${i + 1}º ${m.nome} — ${m.pontos} vitórias
          <span class="badge ${normalizar(rank)}">${rank}</span>
          <span class="badge classe ${normalizar(m.classe)}">${m.classe}</span>
        </span>
        ${modoAdmin ? `
        <div class="acoes">
          <button class="btn" data-v="${m.id}">+</button>
          <button class="btn" data-d="${m.id}">-</button>
          <div class="lixeira" data-r="${m.id}">🗑</div>
        </div>` : ""}
      </li>
    `;
  });

  rankingEl.innerHTML = html;

  rankingEl.querySelectorAll("[data-v]").forEach(b =>
    b.onclick = () => {
      const m = grupo.find(g => g.id === b.dataset.v);
      vitoria(m.id, m.pontos);
    }
  );

  rankingEl.querySelectorAll("[data-d]").forEach(b =>
    b.onclick = () => {
      const m = grupo.find(g => g.id === b.dataset.d);
      derrota(m.id, m.pontos);
    }
  );

  rankingEl.querySelectorAll("[data-r]").forEach(b =>
    b.onclick = () => remover(b.dataset.r)
  );
}

atualizarUIAdmin();
