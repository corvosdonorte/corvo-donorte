import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let grupo = [];

/* ===== CONFIG ===== */
const SENHA_ADMIN = "corvosvoamjuntos";
let modoAdmin = sessionStorage.getItem("admin") === "true";

/* ===== INIT ===== */
window.onload = async () => {
  await carregarDoFirebase();
  atualizarRanking();
};

/* ===== AUTH ===== */
window.loginAdmin = function () {
  const senha = prompt("Senha de administrador:");
  if (senha === SENHA_ADMIN) {
    modoAdmin = true;
    sessionStorage.setItem("admin", "true");
    alert("Modo administrador ativado");
    atualizarRanking();
  } else {
    alert("Senha incorreta");
  }
};

window.logoutAdmin = function () {
  modoAdmin = false;
  sessionStorage.removeItem("admin");
  atualizarRanking();
};

/* ===== FIREBASE ===== */
async function carregarDoFirebase() {
  grupo = [];
  const q = query(collection(db, "ranking"), orderBy("pontos", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    grupo.push({ id: docSnap.id, ...docSnap.data() });
  });
}

async function salvarNovo(membro) {
  await addDoc(collection(db, "ranking"), membro);
  await carregarDoFirebase();
}

async function atualizarMembro(id, dados) {
  await updateDoc(doc(db, "ranking", id), dados);
  await carregarDoFirebase();
}

async function removerMembroFirebase(id) {
  await deleteDoc(doc(db, "ranking", id));
  await carregarDoFirebase();
}

/* ===== RANK ===== */
function calcularRank(p) {
  if (p <= 9) return "Ferro";
  if (p <= 24) return "Prata";
  if (p <= 44) return "Ouro";
  if (p <= 64) return "Platina";
  if (p <= 79) return "Mithril";
  if (p <= 94) return "Oricalco";
  return "Adamante";
}

function classeRank(r) {
  return r.toLowerCase();
}

function classeClasse(c) {
  return c.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ===== CRUD ===== */
window.adicionarMembro = async function () {
  if (!modoAdmin) return alert("Apenas administradores");

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return alert("Digite um nome");

  await salvarNovo({ nome, classe, pontos: 0 });
  document.getElementById("nome").value = "";
  atualizarRanking();
};

window.removerMembro = async function (i) {
  if (!modoAdmin) return;
  if (confirm("Remover este membro?")) {
    await removerMembroFirebase(grupo[i].id);
    atualizarRanking();
  }
};

window.vitoria = async function (i) {
  if (!modoAdmin) return;
  await atualizarMembro(grupo[i].id, { pontos: grupo[i].pontos + 1 });
  atualizarRanking();
};

window.derrota = async function (i) {
  if (!modoAdmin) return;
  if (grupo[i].pontos > 0) {
    await atualizarMembro(grupo[i].id, { pontos: grupo[i].pontos - 1 });
    atualizarRanking();
  }
};

/* ===== RENDER ===== */
function atualizarRanking() {
  grupo.sort((a, b) => b.pontos - a.pontos);
  mostrar();
}

/* ===== COROAS ===== */
function coroaSVG(tipo) {
  const cores = {
    ouro: ["#ffd700", "#ffae00"],
    prata: ["#e0e0e0", "#b0b0b0"],
    bronze: ["#cd7f32", "#a05a1a"]
  };

  return `
  <span class="coroa ${tipo}">
    <svg viewBox="0 0 64 48">
      <path d="M4 36 L12 10 L28 28 L32 6 L36 28 L52 10 L60 36 Z"
        fill="${cores[tipo][0]}" stroke="#000"/>
    </svg>
  </span>`;
}

/* ===== LISTA ===== */
function mostrar() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const rank = calcularRank(m.pontos);

    let coroa = "";
    let classeTop = "";
    if (i === 0) classeTop = "top1", coroa = coroaSVG("ouro");
    if (i === 1) classeTop = "top2", coroa = coroaSVG("prata");
    if (i === 2) classeTop = "top3", coroa = coroaSVG("bronze");

    const acoes = modoAdmin ? `
      <div class="acoes">
        <button class="btn" onclick="vitoria(${i})">+</button>
        <button class="btn" onclick="derrota(${i})">-</button>
        <div class="lixeira" onclick="removerMembro(${i})">🗑</div>
      </div>` : "";

    lista.innerHTML += `
      <li class="${classeTop}">
        <span class="nome">
          ${coroa}
          ${i + 1}º ${m.nome} — ${m.pontos} vitórias
          <span class="badge ${classeRank(rank)}">${rank}</span>
          <span class="badge classe ${classeClasse(m.classe)}">${m.classe}</span>
        </span>
        ${acoes}
      </li>`;
  });
}

