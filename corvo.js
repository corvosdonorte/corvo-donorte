let grupo = [];

/* ===== CONFIG ===== */
const SENHA_ADMIN = "corvosvoamjuntos";
let modoAdmin = sessionStorage.getItem("admin") === "true";

/* ===== INIT ===== */
window.onload = () => {
  const dados = localStorage.getItem("rankingCorvoDoNorte");
  if (dados) grupo = JSON.parse(dados);
  atualizarRanking();
};

/* ===== AUTH ===== */
function loginAdmin() {
  const senha = prompt("Senha de administrador:");
  if (senha === SENHA_ADMIN) {
    modoAdmin = true;
    sessionStorage.setItem("admin", "true");
    alert("Modo administrador ativado");
    atualizarRanking();
  } else {
    alert("Senha incorreta");
  }
}

function logoutAdmin() {
  modoAdmin = false;
  sessionStorage.removeItem("admin");
  atualizarRanking();
}

/* ===== STORAGE ===== */
function salvar() {
  if (!modoAdmin) return;
  localStorage.setItem("rankingCorvoDoNorte", JSON.stringify(grupo));
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

/* ===== CRUD PROTEGIDO ===== */
function adicionarMembro() {
  if (!modoAdmin) return alert("Apenas administradores");
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return alert("Digite um nome");

  grupo.push({ nome, pontos: 0, classe });
  document.getElementById("nome").value = "";
  salvar();
  atualizarRanking();
}

function removerMembro(i) {
  if (!modoAdmin) return;
  if (confirm("Remover este membro?")) {
    grupo.splice(i, 1);
    salvar();
    atualizarRanking();
  }
}

function vitoria(i) {
  if (!modoAdmin) return;
  grupo[i].pontos++;
  salvar();
  atualizarRanking();
}

function derrota(i) {
  if (!modoAdmin) return;
  if (grupo[i].pontos > 0) {
    grupo[i].pontos--;
    salvar();
    atualizarRanking();
  }
}

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
      <defs>
        <linearGradient id="g-${tipo}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${cores[tipo][0]}"/>
          <stop offset="100%" stop-color="${cores[tipo][1]}"/>
        </linearGradient>
      </defs>
      <path d="M4 36 L12 10 L28 28 L32 6 L36 28 L52 10 L60 36 Z"
        fill="url(#g-${tipo})" stroke="#000"/>
      <rect x="4" y="34" width="56" height="8" rx="4"
        fill="url(#g-${tipo})"/>
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

    if (i === 0) { coroa = coroaSVG("ouro"); classeTop = "top1"; }
    if (i === 1) { coroa = coroaSVG("prata"); classeTop = "top2"; }
    if (i === 2) { coroa = coroaSVG("bronze"); classeTop = "top3"; }

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
