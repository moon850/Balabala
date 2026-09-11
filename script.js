/* script.js
   Core logic for Mini Candy Crush clone
   Save as script.js and include with <script src="script.js" defer></script>
*/

const width = 8;
const boardSize = width * width;
const colors = ['red','yellow','green','blue','purple','orange'];
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const shuffleBtn = document.getElementById('shuffleBtn');

let board = [];
let score = 0;
let dragged = null;
let replaced = null;

// Create board
function createBoard(){
  boardEl.innerHTML = '';
  board = [];
  for(let i=0;i<boardSize;i++){
    const cell = document.createElement('div');
    cell.className = 'candy';
    const color = randomColor();
    cell.classList.add('c-' + color);
    cell.setAttribute('data-id', i);
    cell.draggable = true;
    addDragHandlers(cell);
    boardEl.appendChild(cell);
    board.push(cell);
  }
}

function randomColor(){ return colors[Math.floor(Math.random()*colors.length)]; }

// Drag handlers
function addDragHandlers(cell){
  cell.addEventListener('dragstart', dragStart);
  cell.addEventListener('dragover', e => e.preventDefault());
  cell.addEventListener('drop', dragDrop);
  cell.addEventListener('dragend', dragEnd);

  // Simple tap-to-swap for mobile
  cell.addEventListener('click', (e) => {
    if(!dragged) {
      dragged = e.currentTarget;
      dragged.style.transform = 'scale(0.95)';
    } else {
      replaced = e.currentTarget;
      swap(dragged, replaced, true);
      dragged.style.transform = '';
      dragged = null;
      replaced = null;
    }
  });
}

function dragStart(e){ dragged = e.target; }
function dragDrop(e){ replaced = e.target; }
function dragEnd(){
  if(dragged && replaced){
    swap(dragged, replaced, true);
  }
  dragged = null;
  replaced = null;
}

// Swap candies
function swap(a, b, check=true){
  if(!a || !b) return;
  const idA = Number(a.getAttribute('data-id'));
  const idB = Number(b.getAttribute('data-id'));
  const validMoves = [idA-1, idA+1, idA-width, idA+width];
  if(!validMoves.includes(idB)) return; // only adjacent

  const classA = Array.from(a.classList).find(c => c.startsWith('c-'));
  const classB = Array.from(b.classList).find(c => c.startsWith('c-'));
  a.classList.remove(classA); a.classList.add(classB);
  b.classList.remove(classB); b.classList.add(classA);

  if(check){
    if(!checkAnyMatch()){
      // revert if no match
      a.classList.remove(classB); a.classList.add(classA);
      b.classList.remove(classA); b.classList.add(classB);
    } else {
      setTimeout(() => collapseBoard(), 120);
    }
  }
}

// Match detection helpers
function getColorAt(idx){
  const el = board[idx];
  if(!el) return null;
  const cls = Array.from(el.classList).find(c => c.startsWith('c-'));
  return cls ? cls.slice(2) : null;
}
function markEmpty(idx){
  const el = board[idx];
  if(!el) return;
  colors.forEach(col => el.classList.remove('c-' + col));
  el.classList.add('empty');
}

// Check rows/columns
function checkRowForThree(){
  let found = false;
  for(let i=0;i<boardSize-2;i++){
    const rowEnd = Math.floor(i/width) === Math.floor((i+2)/width);
    if(!rowEnd) continue;
    const c1 = getColorAt(i);
    if(c1 && c1===getColorAt(i+1) && c1===getColorAt(i+2)){
      [i,i+1,i+2].forEach(markEmpty);
      score += 30; found = true;
    }
  }
  return found;
}
function checkColumnForThree(){
  let found = false;
  for(let i=0;i<boardSize-2*width;i++){
    const c1 = getColorAt(i);
    if(c1 && c1===getColorAt(i+width) && c1===getColorAt(i+2*width)){
      [i,i+width,i+2*width].forEach(markEmpty);
      score += 30; found = true;
    }
  }
  return found;
}

// Collapse and refill
function collapseBoard(){
  for(let i=boardSize-width-1;i>=0;i--){
    const below = i+width;
    if(board[below].classList.contains('empty') && !board[i].classList.contains('empty')){
      const cls = Array.from(board[i].classList).find(c => c.startsWith('c-'));
      if(cls){
        board[below].classList.remove('empty');
        board[below].classList.add(cls);
        board[i].classList.remove(cls);
        board[i].classList.add('empty');
      }
    }
  }
  // refill top row
  for(let i=0;i<width;i++){
    if(board[i].classList.contains('empty')){
      const col = randomColor();
      board[i].classList.remove('empty');
      board[i].classList.add('c-' + col);
    }
  }
  runChecks();
}

// Run checks
function runChecks(){
  let any = false;
  if(checkRowForThree()) any = true;
  if(checkColumnForThree()) any = true;
  if(any) setTimeout(() => collapseBoard(), 120);
  updateScore();
}
function checkAnyMatch(){ return checkRowForThree() || checkColumnForThree(); }
function updateScore(){ scoreEl.textContent = score; }

// Shuffle board
function shuffleBoard(){
  const allColors = board.map(cell => {
    const cls = Array.from(cell.classList).find(c => c.startsWith('c-'));
    return cls ? cls.slice(2) : randomColor();
  });
  for(let i=allColors.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
  }
  board.forEach((cell, idx) => {
    colors.forEach(c => cell.classList.remove('c-' + c));
    cell.classList.remove('empty');
    cell.classList.add('c-' + allColors[idx]);
  });
}

// Reset game
function resetGame(){
  score = 0;
  createBoard();
  runChecks();
}

// Init
createBoard();
runChecks();
setInterval(runChecks, 400);

// Buttons
resetBtn.addEventListener('click', resetGame);
shuffleBtn.addEventListener('click', () => { shuffleBoard(); runChecks(); });