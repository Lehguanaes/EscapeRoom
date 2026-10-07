const words = ['Encontro', 'no', 'servidor', 'às', '22h.', 'Não', 'confie', 'em', 'ninguém…'];
const sentence = 'Encontro no servidor às 22h. Não confie em ninguém…';
let stack = [];
let deque = [];
let provisionalConclusion = null;

const stackOperations = [
  ['PUSH A', 'push', 'A'],
  ['PUSH I', 'push', 'I'],
  ['PUSH P', 'push', 'P'],
  ['PUSH S', 'push', 'S'],
  ['PUSH T', 'push', 'T'],
  ['POP', 'pop'],
  ['TOP', 'top'],
];
const dequeOperations = [
  ['addFront(C)', 'front', 'C'],
  ['removeFront()', 'removeFront'],
  ['removeBack()', 'removeBack'],
  ['addFront(L)', 'front', 'L'],
  ['addFront(B)', 'front', 'B'],
  ['addBack(O)', 'back', 'O'],
  ['addBack(C)', 'back', 'C'],
];

function startInvestigation() {
  const intro = document.getElementById('investigatorIntro');
  intro.classList.add('show');
  // A animação introduz o papel do jogador antes da primeira etapa.
  setTimeout(() => {
    intro.classList.remove('show');
    go(1);
  }, 3000);
}

function go(stage) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.getElementById(`stage${stage}`).classList.add('active');
  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.classList.toggle('done', index < stage - 1);
    dot.classList.toggle('active', index === stage - 1);
  });
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  if (stage === 2) drawStack();
  if (stage === 3) drawDeque();
}

function showFeedback(id) {
  const feedback = document.getElementById(id);
  feedback.classList.add('show');

  setTimeout(() => {
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

function resetPhrase() {
  const bank = document.getElementById('bank');
  const rebuild = document.getElementById('rebuild');
  bank.innerHTML = '';
  rebuild.innerHTML = '';
  [...words].sort(() => Math.random() - 0.5).forEach((word) => {
    const button = document.createElement('button');
    button.className = 'word';
    button.textContent = word;
    button.onclick = () => (button.parentElement === bank ? rebuild : bank).append(button);
    bank.append(button);
  });
  document.getElementById('phraseFeedback').classList.remove('show');
}

function checkPhrase() {
  const answer = [...document.querySelectorAll('#rebuild .word')].map((word) => word.textContent).join(' ');
  const feedback = document.getElementById('phraseFeedback');

  if (answer === sentence) {
    feedback.classList.remove('error');
    feedback.innerHTML = '✔ Mensagem decifrada. O encontro seria no <span class="key">SERVIDOR</span>, às <span class="key">22H</span>.<p>Investigador, pronto para a próxima pista?</p><div class="actions"><button class="main" onclick="go(2)">ACESSAR ETAPA 2</button></div>';
    showFeedback('phraseFeedback');
  } else {
    feedback.textContent = 'A mensagem ainda não foi descriptografada corretamente. Revise a ordem e tente novamente.';
    feedback.classList.add('error', 'show');
  }
}

function shuffledButtons(id, operations, handler) {
  const host = document.getElementById(id);
  host.innerHTML = '';
  [...operations].sort(() => Math.random() - 0.5).forEach((operation) => {
    const button = document.createElement('button');
    button.className = 'cmd';
    button.textContent = operation[0];
    button.onclick = () => {
      handler(operation);
      // Na deque, os comandos permanecem disponíveis para montar letras repetidas.
      if (id === 'stackCmds') button.disabled = true;
    };
    host.append(button);
  });
}

function drawStack() {
  const view = document.getElementById('stackView');
  if (!document.getElementById('stackCmds').children.length) shuffledButtons('stackCmds', stackOperations, stackAction);
  view.innerHTML = stack.length ? stack.map((letter) => `<span class="item">${letter}</span>`).join('') : '<small>vazia</small>';
}

function resetStack() {
  stack = [];
  document.getElementById('stackFeedback').classList.remove('show');
  document.getElementById('stackLog').textContent = 'Pilha limpa. Tente uma nova sequência.';
  document.getElementById('stackCmds').innerHTML = '';
  drawStack();
}

function stackAction(operation) {
  const [, type, letter] = operation;
  const log = document.getElementById('stackLog');
  // Lógica da pilha: PUSH guarda no topo e TOP valida a sequência final.
  if (type === 'push') {
    stack.push(letter);
    log.textContent = `Letra ${letter} colocada no topo.`;
  }
  if (type === 'pop') {
    const removed = stack.pop();
    log.textContent = removed === undefined ? 'A pilha está vazia.' : `${removed} foi retirada do topo.`;
  }

  if (type === 'top') {
    if (stack.join('') === 'PISTA') {
      log.textContent = `TOP confirma: ${stack.at(-1)}.`;
      showFeedback('stackFeedback');
    } else {
      log.textContent = 'A pilha ainda não forma a palavra correta. Limpe-a e tente outra ordem.';
    }
  }
  drawStack();
}

function drawDeque() {
  const view = document.getElementById('dequeView');
  if (!document.getElementById('dequeCmds').children.length) shuffledButtons('dequeCmds', dequeOperations, dequeAction);
  view.innerHTML = deque.length ? deque.map((part) => `<span class="item">${part === ' ' ? '␣' : part}</span>`).join('') : '<small>vazia</small>';
}

function resetDeque() {
  deque = [];
  document.getElementById('dequeFeedback').classList.remove('show');
  document.getElementById('dequeLog').textContent = 'Deque limpa. Monte o código.';
  document.getElementById('dequeCmds').innerHTML = '';
  drawDeque();
}

function dequeAction(operation) {
  const [, type, value] = operation;
  const log = document.getElementById('dequeLog');
  // Lógica da deque: a frente e o fim podem ser alterados independentemente.
  if (type === 'back') {
    deque.push(value);
    log.textContent = `${value === ' ' ? 'Espaço' : value} entrou no fim.`;
  }
  if (type === 'front') {
    deque.unshift(value);
    log.textContent = `${value} entrou na frente.`;
  }
  if (type === 'removeFront') {
    const removed = deque.shift();
    log.textContent = removed === undefined ? 'A deque está vazia.' : `${removed} foi retirado da frente.`;
}

  if (type === 'removeBack') {
    const removed = deque.pop();
    log.textContent = removed === undefined ? 'A deque está vazia.' : `${removed} foi retirado do fim.`;
  }
  drawDeque();
}

function checkDeque() {
  // Validação do código montado da frente para o fim da deque.
  if (deque.join('') === 'BLOCOC') {
    showFeedback('dequeFeedback');
  }
  else document.getElementById('dequeLog').textContent = 'O código ainda não confere. Revise a ordem das letras e tente novamente.';
}

function selectConclusion(conclusion, button) {
  // O jogador registra uma hipótese antes de avançar para a evidência final.
  provisionalConclusion = conclusion;
  document.querySelectorAll('#stage4 .choice').forEach((choice) => choice.classList.remove('selected'));
  button.classList.add('selected');
  document.getElementById('conclusionFeedback').classList.remove('show');
}

function confirmConclusion() {
  if (!provisionalConclusion) {
    const feedback = document.getElementById('conclusionFeedback');
    feedback.textContent = 'Selecione uma conclusão provisória antes de confirmar.';
    feedback.classList.add('error', 'show');
    return;
  }

  const feedback = document.getElementById('conclusionFeedback');
  feedback.classList.remove('error');
  feedback.innerHTML = 'Conclusão registrada. Agora você terá certeza se está certo com a evidência final.<div class="actions"><button class="main" onclick="go(5)">ACESSAR ETAPA 5</button></div>';
  showFeedback('conclusionFeedback');
}

function finalAccuse(name) {
  const feedback = document.getElementById('finalFeedback');
  feedback.classList.add('show');
  // Lógica final: o log administrativo de Maria explica o cartão adulterado de Erick.
  if (name === 'Maria') {
    document.getElementById('ending').classList.add('show');
  } else {
    document.getElementById('wrongEnding').classList.add('show');
  }
}

resetPhrase();

