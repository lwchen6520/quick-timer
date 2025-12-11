// Sacred Timer experience
let duration = 60000; // milliseconds
let remaining = duration;
let timerId = null;
let isRunning = false;
let endTime = null;
let hasWarned = false;
let hasEnded = false;
let audioRemind;
let audioEnd;

const ring = document.getElementById('ring-progress');
const timeEl = document.getElementById('time');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');
const resetBtn = document.getElementById('reset');

const radius = 90;
const circumference = 2 * Math.PI * radius;
ring.style.strokeDasharray = `${circumference} ${circumference}`;
ring.style.strokeDashoffset = `${circumference}`;

function newAudio(file) {
  const node = new Audio();
  node.src = file;
  node.loop = false;
  node.load();
  document.body.appendChild(node);
  return node;
}

function stopSound(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateRing() {
  const progress = duration === 0 ? 1 : 1 - remaining / duration;
  const offset = circumference * (1 - progress);
  ring.style.strokeDashoffset = `${Math.max(0, offset)}`;
}

function updateDisplay(message) {
  timeEl.textContent = formatTime(remaining);
  if (message) {
    statusEl.textContent = message;
  } else if (hasEnded) {
    statusEl.textContent = '時間到了，請給自己一個深呼吸 ✨';
  } else {
    statusEl.textContent = '靜心倒數中';
  }
  updateRing();
}

function finishTimer() {
  isRunning = false;
  hasEnded = true;
  clearInterval(timerId);
  timerId = null;
  remaining = 0;
  updateDisplay();
  stopSound(audioRemind);
  audioEnd && audioEnd.play();
  toggleBtn.textContent = '開始';
}

function tick() {
  remaining = Math.max(0, endTime - Date.now());

  if (remaining <= 60000 && !hasWarned && duration > 60000) {
    hasWarned = true;
    audioRemind && audioRemind.play();
  }

  if (remaining === 0) {
    finishTimer();
    return;
  }

  updateDisplay();
}

function startTimer() {
  if (remaining <= 0) {
    remaining = duration || 1000;
  }
  endTime = Date.now() + remaining;
  isRunning = true;
  hasEnded = false;
  timerId && clearInterval(timerId);
  timerId = setInterval(tick, 100);
  toggleBtn.textContent = '暫停';
  updateDisplay('光圈正在收斂');
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerId);
  timerId = null;
  toggleBtn.textContent = '開始';
  updateDisplay('稍作停留再繼續');
}

function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  pauseTimer();
  remaining = duration = duration || 60000;
  hasWarned = false;
  hasEnded = false;
  stopSound(audioRemind);
  stopSound(audioEnd);
  updateDisplay('回到起點，重新開始');
}

function adjustTime(deltaSeconds) {
  const deltaMs = deltaSeconds * 1000;
  duration = Math.max(0, duration + deltaMs);
  remaining = Math.max(0, remaining + deltaMs);
  hasWarned = false;
  hasEnded = false;
  stopSound(audioRemind);

  if (isRunning) {
    endTime = Date.now() + remaining;
  }
  updateDisplay('時間已微調');
}

function presetTime(seconds) {
  duration = seconds * 1000;
  remaining = duration;
  hasWarned = false;
  hasEnded = false;
  stopSound(audioRemind);
  stopSound(audioEnd);

  if (isRunning) {
    endTime = Date.now() + remaining;
  }
  updateDisplay('已設定新的神聖時間');
}

function bindControls() {
  toggleBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);

  document.querySelectorAll('[data-adjust]').forEach((btn) => {
    btn.addEventListener('click', () => adjustTime(Number(btn.dataset.adjust)));
  });

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => presetTime(Number(btn.dataset.preset)));
  });
}

window.onload = function () {
  audioRemind = newAudio('audio/smb_warning.mp3');
  audioEnd = newAudio('audio/smb_mariodie.mp3');
  bindControls();
  updateDisplay();
};
