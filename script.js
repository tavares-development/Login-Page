/* =========================================================
   PARTE 1: pegar os elementos da página
   getElementById("x") encontra o elemento que tem id="x" no HTML
   ========================================================= */
const formulario  = document.getElementById("formulario");
const campoEmail  = document.getElementById("email");
const campoSenha  = document.getElementById("senha");
const erroEmail   = document.getElementById("erroEmail");
const erroSenha   = document.getElementById("erroSenha");
const botao       = document.getElementById("botao");
const verSenha    = document.getElementById("verSenha");
const lembrar     = document.getElementById("lembrar");
const telaLogin   = document.getElementById("telaLogin");
const telaSucesso = document.getElementById("telaSucesso");
const boasVindas  = document.getElementById("boasVindas");
const cartao      = document.querySelector(".cartao");

// Login de mentirinha, só para testar (num site real isso fica num servidor!)
const EMAIL_CERTO = "teste@email.com";
const SENHA_CERTA = "senha123";

/* =========================================================
   PARTE 2: lembrar o e-mail (localStorage guarda dados no navegador)
   ========================================================= */
const emailSalvo = localStorage.getItem("emailSalvo");
if (emailSalvo) {
  campoEmail.value = emailSalvo;
  lembrar.checked = true;
}

/* =========================================================
   PARTE 3: botão "Mostrar / Ocultar" a senha
   ========================================================= */
verSenha.addEventListener("click", () => {
  const escondida = campoSenha.type === "password";
  campoSenha.type = escondida ? "text" : "password"; // troca o tipo do campo
  verSenha.textContent = escondida ? "Ocultar" : "Mostrar";
});

/* =========================================================
   PARTE 4: validação (conferir se o que a pessoa digitou faz sentido)
   ========================================================= */
function mostrarErro(campo, caixaErro, mensagem) {
  campo.classList.add("invalido");
  caixaErro.textContent = mensagem;
}
function limparErros() {
  [campoEmail, campoSenha].forEach(c => c.classList.remove("invalido"));
  erroEmail.textContent = "";
  erroSenha.textContent = "";
}

function validar() {
  limparErros();
  let tudoCerto = true;

  // Regex simples: algo + @ + algo + . + algo
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formatoEmail.test(campoEmail.value.trim())) {
    mostrarErro(campoEmail, erroEmail, "Digite um e-mail válido, como voce@email.com.");
    tudoCerto = false;
  }
  if (campoSenha.value.length < 6) {
    mostrarErro(campoSenha, erroSenha, "A senha precisa ter pelo menos 6 caracteres.");
    tudoCerto = false;
  }
  return tudoCerto; // true = pode seguir, false = tem erro
}

function tremerCartao() {
  cartao.classList.remove("tremer");
  void cartao.offsetWidth;          // truque para reiniciar a animação
  cartao.classList.add("tremer");
}

/* =========================================================
   PARTE 5: o que acontece quando clica em "Entrar"
   ========================================================= */
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault(); // impede a página de recarregar sozinha

  if (!validar()) { tremerCartao(); return; }

  // Mostra a bolinha girando por um instante, como num site de verdade
  botao.disabled = true;
  botao.classList.add("carregando");

  setTimeout(() => {
    botao.disabled = false;
    botao.classList.remove("carregando");

    const email = campoEmail.value.trim().toLowerCase();
    if (email === EMAIL_CERTO && campoSenha.value === SENHA_CERTA) {
      // Guarda (ou apaga) o e-mail conforme a caixinha "Lembrar"
      if (lembrar.checked) localStorage.setItem("emailSalvo", email);
      else localStorage.removeItem("emailSalvo");

      boasVindas.textContent = "Bem-vindo(a), " + email.split("@")[0] + "!";
      telaLogin.hidden = true;    // esconde o formulário
      telaSucesso.hidden = false; // mostra a tela de sucesso
    } else {
      mostrarErro(campoSenha, erroSenha, "E-mail ou senha incorretos. Tente de novo.");
      tremerCartao();
    }
  }, 1200); // 1200 milissegundos = 1,2 segundo
});

// Botão "Sair" volta para o formulário
document.getElementById("sair").addEventListener("click", () => {
  campoSenha.value = "";
  telaSucesso.hidden = true;
  telaLogin.hidden = false;
});

/* =========================================================
   PARTE 6: o fundo animado (pontos que se ligam e fogem do mouse)
   ========================================================= */
const tela = document.getElementById("fundo");
const pincel = tela.getContext("2d"); // "pincel" para desenhar no canvas
const mouse = { x: -999, y: -999 };
let pontos = [];

function ajustarTela() {
  tela.width = window.innerWidth;
  tela.height = window.innerHeight;
  // Quantidade de pontos proporcional ao tamanho da tela
  const quantidade = Math.min(110, Math.floor(tela.width * tela.height / 14000));
  pontos = Array.from({ length: quantidade }, () => ({
    x: Math.random() * tela.width,
    y: Math.random() * tela.height,
    vx: (Math.random() - 0.5) * 0.5, // velocidade horizontal
    vy: (Math.random() - 0.5) * 0.5, // velocidade vertical
  }));
}

function desenhar() {
  pincel.clearRect(0, 0, tela.width, tela.height);

  for (const p of pontos) {
    // Move o ponto e faz ele voltar pelo outro lado ao sair da tela
    p.x = (p.x + p.vx + tela.width) % tela.width;
    p.y = (p.y + p.vy + tela.height) % tela.height;

    // Foge do mouse se chegar perto
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 120) { p.x += dx / dist * 2; p.y += dy / dist * 2; }

    pincel.beginPath();
    pincel.arc(p.x, p.y, 2, 0, Math.PI * 2);
    pincel.fillStyle = "#c9c7ff";
    pincel.fill();
  }

  // Liga com uma linha os pontos que estão próximos
  for (let i = 0; i < pontos.length; i++) {
    for (let j = i + 1; j < pontos.length; j++) {
      const d = Math.hypot(pontos[i].x - pontos[j].x, pontos[i].y - pontos[j].y);
      if (d < 130) {
        pincel.strokeStyle = "rgba(201, 199, 255," + (1 - d / 130) * 0.35 + ")";
        pincel.beginPath();
        pincel.moveTo(pontos[i].x, pontos[i].y);
        pincel.lineTo(pontos[j].x, pontos[j].y);
        pincel.stroke();
      }
    }
  }

  // Só continua animando se a pessoa não pediu menos movimento
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(desenhar);
  }
}

window.addEventListener("resize", ajustarTela);
window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
ajustarTela();
desenhar();