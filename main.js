(() => {
	// Helpers
	const $ = id => document.getElementById(id);

	function normalizeHex(s){
		if(!s) return null;
		s = s.trim().replace(/^#/,"");
		if(/^[0-9a-fA-F]{3}$/.test(s)) s = s.split("").map(c=>c+c).join("");
		if(/^[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
		return null;
	}

	function hexToRgb(hex){
		const n = normalizeHex(hex);
		if(!n) return null;
		return {r:parseInt(n.slice(0,2),16),g:parseInt(n.slice(2,4),16),b:parseInt(n.slice(4,6),16)};
	}

	function rgbToHex({r,g,b}){
		const to2 = v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
		return `#${to2(r)}${to2(g)}${to2(b)}`;
	}

	function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}

	function randomColorInRange(aHex,bHex){
		const a = hexToRgb(aHex) || {r:0,g:0,b:0};
		const b = hexToRgb(bHex) || {r:255,g:255,b:255};
		const rMin = Math.min(a.r,b.r), rMax = Math.max(a.r,b.r);
		const gMin = Math.min(a.g,b.g), gMax = Math.max(a.g,b.g);
		const bMin = Math.min(a.b,b.b), bMax = Math.max(a.b,b.b);
		return {r:randInt(rMin,rMax), g:randInt(gMin,gMax), b:randInt(bMin,bMax)};
	}

	function manhattan(c1,c2){
		return Math.abs(c1.r-c2.r)+Math.abs(c1.g-c2.g)+Math.abs(c1.b-c2.b);
	}

	// UI
	const top = $('top'), play = $('play'), result = $('result');
	const playArea = document.querySelector('.play-area');
	const answerInput = $('answer');
	const resultMsg = $('resultMsg');

	function show(s){ top.classList.add('hidden'); play.classList.add('hidden'); result.classList.add('hidden'); s.classList.remove('hidden'); }

	let targetRgb = {r:0,g:0,b:0};

	function applyPlayBg(rgb){
		const hex = rgbToHex(rgb);
		playArea.style.background = hex;
		document.body.style.background = hex;
		targetRgb = rgb;
	}

	function startGame(){
		const start = normalizeHex($('rangeStart').value) || '000000';
		const end = normalizeHex($('rangeEnd').value) || 'ffffff';
		const rgb = randomColorInRange(start,end);
		applyPlayBg(rgb);
		// sync result params
		$('thresholdResult').value = $('threshold').value;
		$('rangeStartResult').value = $('rangeStart').value;
		$('rangeEndResult').value = $('rangeEnd').value;
		answerInput.value = '';
		show(play);
	}

	function submitAnswer(){
		const raw = answerInput.value;
		const userRgb = hexToRgb(raw);
		if(!userRgb){
			resultMsg.innerHTML = `<p class="result-status">無効なカラーコードです。</p><p class="result-detail">例: #aabbcc または aabbcc</p>`;
			show(result);
			return;
		}
		const thresh = Math.max(0, Math.min(765, Number($('threshold').value || $('thresholdResult').value || 0)));
		const dist = manhattan(userRgb, targetRgb);
		const correct = dist <= thresh;
		const userHex = rgbToHex(userRgb);
		const targetHex = rgbToHex(targetRgb);
		resultMsg.innerHTML = `
			<p class="result-status ${correct ? 'correct' : 'incorrect'}">${correct ? '正解！' : '不正解'}</p>
			<p class="result-detail">誤差: <strong>${dist}</strong> / 許容: <strong>${thresh}</strong></p>
			<div class="result-colors">
				<div class="result-color">
					<div class="color-swatch" style="background:${userHex}"></div>
					<div class="color-label">あなたの解答: <strong>${userHex}</strong></div>
				</div>
				<div class="result-color">
					<div class="color-swatch" style="background:${targetHex}"></div>
					<div class="color-label">正解: <strong>${targetHex}</strong></div>
				</div>
			</div>
		`;
		// keep background as is (per spec)
		show(result);
	}

	function again(){
		// use parameters from result inputs if modified
		const start = $('rangeStartResult').value || $('rangeStart').value;
		const end = $('rangeEndResult').value || $('rangeEnd').value;
		const thresh = $('thresholdResult').value || $('threshold').value;
		$('rangeStart').value = start; $('rangeEnd').value = end; $('threshold').value = thresh;
		startGame();
	}

	function backToTop(){
		// sync params back
		$('threshold').value = $('thresholdResult').value;
		$('rangeStart').value = $('rangeStartResult').value;
		$('rangeEnd').value = $('rangeEndResult').value;
		// reset page bg to white (top background per spec)
		document.body.style.background = '';
		show(top);
	}

	// hooks
	$('startBtn').addEventListener('click', startGame);
	$('submitBtn').addEventListener('click', submitAnswer);
	$('giveupBtn').addEventListener('click', backToTop);
	$('againBtn').addEventListener('click', again);
	$('backTopBtn').addEventListener('click', backToTop);

	// allow Enter to submit in textarea when Ctrl+Enter or Cmd+Enter
	answerInput.addEventListener('keydown', e=>{
		if((e.ctrlKey||e.metaKey) && e.key === 'Enter'){ submitAnswer(); }
	});

	// init
	show(top);

})();

