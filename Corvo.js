let grupo = [];
const SENHA_ADMIN = "corvosvoamjuntos"; // 🔴 MUDE ISSO

/* ---------- LOGIN ADMIN ---------- */
function loginAdmin() {
  const senha = document.getElementById("senhaAdmin").value;
  if (senha === SENHA_ADMIN) {
    localStorage.setItem("adminLogado", "true");
    atualizarUIAdmin();
  } else {
    alert("Senha incorreta");
  }
}

function logoutAdmin() {
  localStorage.removeItem("adminLogado");
  atualizarUIAdmin();
}

function isAdmin() {
  return localStorage.getItem("adminLogado") === "true";
}

function atualizarUIAdmin() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin() ? "flex" : "none";
  });
  mostrar();
}

/* ---------- STORAGE ---------- */
window.onload = () => {
  const dados = localStorage.getItem("rankingCorvoDoNorte");
  if (dados) grupo = JSON.parse(dados);
  atualizarUIAdmin();
};

function salvar() {
  localStorage.setItem("rankingCorvoDoNorte", JSON.stringify(grupo));
}

/* ---------- RANK ---------- */
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
  return c.toLowerCase();
}

/* ---------- CRUD (PROTEGIDO) ---------- */
function adicionarMembro() {
  if (!isAdmin()) return;
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return alert("Digite um nome");
  grupo.push({ nome, pontos: 0, classe });
  document.getElementById("nome").value = "";
  salvar();
  mostrar();
}

function removerMembro(i) {
  if (!isAdmin()) return;
  if (confirm("Remover este membro?")) {
    grupo.splice(i, 1);
    salvar();
    mostrar();
  }
}

function vitoria(i) {
  if (!isAdmin()) return;
  grupo[i].pontos++;
  salvar();
  mostrar();
}

function derrota(i) {
  if (!isAdmin()) return;
  if (grupo[i].pontos > 0) {
    grupo[i].pontos--;
    salvar();
    mostrar();
  }
}

/* ---------- COROA ---------- */
function coroaSVG(tipo) {
  return `
    <span class="coroa ${tipo}">
      <svg viewBox="0 0 64 48">
        <path d="M4 36 L12 10 L28 28 L32 6 L36 28 L52 10 L60 36 Z"
              fill="currentColor"/>
        <rect x="4" y="34" width="56" height="8" rx="4"
              fill="currentColor"/>
      </svg>
    </span>`;
}

/* ---------- RENDER ---------- */
function mostrar() {
  grupo.sort((a, b) => b.pontos - a.pontos);
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const rank = calcularRank(m.pontos);

    let classeTop = "";
    let coroa = "";
    if (i === 0) { classeTop = "top1"; coroa = coroaSVG("ouro"); }
    else if (i === 1) { classeTop = "top2"; coroa = coroaSVG("prata"); }
    else if (i === 2) { classeTop = "top3"; coroa = coroaSVG("bronze"); }

    lista.innerHTML += `
      <li class="${classeTop}">
        <span class="nome">
          ${coroa}
          ${i + 1}º ${m.nome} — ${m.pontos} vitórias
          <span class="badge ${classeRank(rank)}">${rank}</span>
          <span class="badge classe ${classeClasse(m.classe)}">${m.classe}</span>
        </span>

        ${isAdmin() ? `
        <div class="acoes">
          <button class="btn" onclick="vitoria(${i})">+</button>
          <button class="btn" onclick="derrota(${i})">-</button>
          <div class="lixeira" onclick="removerMembro(${i})"></div>
        </div>` : ""}
      </li>
    `;
  });
}
