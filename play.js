// Bàn cờ tương tác — chess.js kiểm tra nước đi hợp lệ.
document.addEventListener("DOMContentLoaded", () => {
  const boardEl = document.getElementById("chess-board");
  if (!boardEl) return;
  const statusEl = document.getElementById("game-status");
  const counterEl = document.getElementById("move-counter");
  const historyEl = document.getElementById("move-history");
  const glyph = {wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};

  if (typeof Chess === "undefined") {
    statusEl.textContent = "Không tải được thư viện luật cờ vua. Hãy kiểm tra Internet rồi tải lại trang.";
    return;
  }

  const game = new Chess();
  let selected = null;
  let targets = [];
  let flipped = false;

  function setStatus() {
    if (game.in_checkmate()) statusEl.textContent = "Chiếu hết! " + (game.turn() === "w" ? "Đen" : "Trắng") + " thắng.";
    else if (game.in_stalemate()) statusEl.textContent = "Pat — ván cờ hòa vì bên đến lượt không còn nước đi hợp lệ nhưng không bị chiếu.";
    else if (game.in_draw()) statusEl.textContent = "Ván cờ hòa theo luật.";
    else statusEl.textContent = "Lượt " + (game.turn() === "w" ? "Trắng" : "Đen") + (game.in_check() ? " — Vua đang bị chiếu!" : "") + " Chọn một quân để xem nước đi hợp lệ.";
  }

  function renderHistory() {
    const history = game.history();
    historyEl.innerHTML = "";
    if (!history.length) {
      const li = document.createElement("li"); li.textContent = "Chưa có nước đi."; historyEl.appendChild(li);
    } else {
      for (let i = 0; i < history.length; i += 2) {
        const li = document.createElement("li");
        li.textContent = `${Math.floor(i / 2) + 1}. ${history[i]}${history[i + 1] ? "  " + history[i + 1] : ""}`;
        historyEl.appendChild(li);
      }
    }
    counterEl.textContent = "MOVE " + (Math.floor(history.length / 2) + 1);
  }

  function render() {
    boardEl.innerHTML = "";
    const files = flipped ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];
    const ranks = flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
    ranks.forEach((rank, row) => files.forEach((file, col) => {
      const square = file + rank;
      const piece = game.get(square);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chess-square " + ((row + col) % 2 === 0 ? "light" : "dark");
      button.setAttribute("aria-label", square + (piece ? ", " + (piece.color === "w" ? "Trắng " : "Đen ") + piece.type : ""));
      if (square === selected) button.classList.add("selected");
      const target = targets.find(move => move.to === square);
      if (target) { button.classList.add("legal"); if (piece) button.classList.add("capture"); }
      if (piece) { button.textContent = glyph[piece.color + piece.type]; button.classList.add(piece.color === "w" ? "white-piece" : "black-piece"); }
      button.addEventListener("click", () => handleSquare(square));
      boardEl.appendChild(button);
    }));
    setStatus(); renderHistory();
  }

  function handleSquare(square) {
    if (game.game_over()) return;
    if (selected && targets.some(move => move.to === square)) {
      game.move({from:selected,to:square,promotion:"q"});
      selected = null; targets = []; render(); return;
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      selected = square; targets = game.moves({square,verbose:true});
    } else { selected = null; targets = []; }
    render();
  }

  document.getElementById("new-game").addEventListener("click", () => { game.reset(); selected = null; targets = []; flipped = false; render(); });
  document.getElementById("undo-move").addEventListener("click", () => { game.undo(); selected = null; targets = []; render(); });
  document.getElementById("flip-board").addEventListener("click", () => { flipped = !flipped; render(); });
  render();
});
