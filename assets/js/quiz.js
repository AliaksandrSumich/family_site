"use strict";
(function(){
  const PASS_THRESHOLD = 50; // % to pass (aligns with official rules)

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }

  function splitCSVLine(line){
    const out = [];
    let cur = ""; let inQ = false; let i=0;
    while(i < line.length){
      const ch = line[i];
      if(ch === '"'){
        if(inQ && line[i+1] === '"'){ cur += '"'; i+=2; continue; }
        inQ = !inQ; i++; continue;
      }
      if(ch === ',' && !inQ){ out.push(cur); cur = ""; i++; continue; }
      cur += ch; i++;
    }
    out.push(cur);
    return out.map(s=>s.trim());
  }

  function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
    if(!lines.length) return [];
    const rows = [];
    for(let i=1;i<lines.length;i++){
      const cols = splitCSVLine(lines[i]);
      if(cols.length < 6) continue;
      const [rawText,question,correct,wrong1,wrong2,audio] = cols;
      rows.push({
        text: rawText.replace(/^\"|\"$/g, ''),
        question: question,
        correct: correct,
        wrong: [wrong1, wrong2],
        audio: audio
      });
    }
    return rows;
  }

  function savePartResult(key, percent, passed){
    try{ localStorage.setItem(key, JSON.stringify({percent, passed, ts: Date.now()})); }catch(e){}
  }

  function renderResult(container, partKey, correct, total){
    const percent = total ? Math.round(correct*100/total) : 0;
    const passed = percent >= PASS_THRESHOLD;
    const text = passed ? "сдал эту часть экзамена" : "не сдал эту часть экзамена";
    container.innerHTML = `
      <div class="mt-4 p-4 rounded-xl border">
        <div class="font-semibold">Результат: ${percent}% — ${text}</div>
        <div class="mt-2 text-sm text-slate-600">Верных ответов: ${correct} из ${total}</div>
      </div>`;
    savePartResult(partKey, percent, passed);
    container.scrollIntoView({behavior:'smooth', block:'center'});
  }

  function buildListening(questions){
    const root = document.getElementById('listening-root');
    if(!root) return;
    root.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'space-y-6';

    questions.forEach((q, idx)=>{
      const opts = shuffle([q.correct, ...q.wrong]);
      const block = document.createElement('div');
      block.className = 'p-4 border rounded-xl';
      block.innerHTML = `
        <div class="text-sm text-slate-600">Задание ${idx+1}</div>
        <audio class="mt-2 w-full" controls preload="none" src="/${q.audio.replace(/^\//,'')}"></audio>
        <p class="mt-3 font-medium">${q.question}</p>
        <fieldset class="mt-2 space-y-2" id="listening_q_${idx}"></fieldset>
        <details class="mt-2 text-xs text-slate-500"><summary class="cursor-pointer">Показать транскрипт</summary><div class="mt-1">${q.text}</div></details>`;
      const fs = block.querySelector('fieldset');
      opts.forEach(opt=>{
        const id = `l_${idx}_${Math.random().toString(36).slice(2,8)}`;
        const w = document.createElement('div');
        w.innerHTML = `
          <label class="flex items-start gap-2 cursor-pointer" for="${id}">
            <input id="${id}" type="radio" name="l_${idx}" value="${opt.replace(/\"/g,'\\\"')}" class="mt-1">
            <span>${opt}</span>
          </label>`;
        fs.appendChild(w);
      });
      form.appendChild(block);
    });

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-3';
    actions.innerHTML = `
      <button type="button" class="px-4 py-2 rounded-xl border" id="check_listening">Проверить ответы</button>
      <button type="button" class="px-4 py-2 rounded-xl border" id="reset_listening">Сбросить</button>`;
    form.appendChild(actions);

    const result = document.createElement('div');
    result.id = 'listening_result';
    form.appendChild(result);

    root.appendChild(form);

    form.querySelector('#check_listening').addEventListener('click', ()=>{
      let correct = 0;
      questions.forEach((q, i)=>{
        const chosen = form.querySelector(`input[name=\\l_${i}]:checked`);
        if(chosen && chosen.value === q.correct){ correct++; }
      });
      renderResult(result, 'result_listening', correct, questions.length);
    });

    form.querySelector('#reset_listening').addEventListener('click', ()=>{
      form.querySelectorAll('input[type=radio]').forEach(i=>{ i.checked=false; });
      result.innerHTML='';
      window.scrollBy({top: -80, behavior: 'smooth'});
    });
  }

  function buildGrammar(){
    const root = document.getElementById('grammar-root');
    if(!root) return;
    const qs = [
      {q:'On … do kina wczoraj.', opts:['poszedł','poszła','poszedłem'], a:'poszedł'},
      {q:'Jutro … się z przyjaciółmi.', opts:['spotkam','spotykam','spotkamy'], a:'spotkam'},
      {q:'Czy … już obiad?', opts:['zjadłeś','zjadłeśeś','zjadł'], a:'zjadłeś'},
      {q:'Nie mogę …, bo pracuję.', opts:['przyjść','przychodzić','przychodzę'], a:'przyjść'},
      {q:'Ona … po polsku bardzo dobrze.', opts:['mówi','powie','mówiła'], a:'mówi'},
      {q:'W weekend … rowerem.', opts:['jeżdżę','jechałem','jadę'], a:'jeżdżę'},
      {q:'Musimy … wcześniej.', opts:['wyjść','wychodzić','wyszedł'], a:'wyjść'},
      {q:'Czy możesz mi …?', opts:['pomóc','pomagam','pomógł'], a:'pomóc'},
      {q:'Wczoraj … list do kolegi.', opts:['napisałem','piszę','napiszę'], a:'napisałem'},
      {q:'O której … spotkanie?', opts:['będzie','jest','było'], a:'będzie'},
      {q:'On nigdy nie … kawy.', opts:['pije','piję','piłem'], a:'pije'},
      {q:'Gdybym miał czas, … do ciebie.', opts:['przyszedłbym','przyjdę','przyszedłem'], a:'przyszedłbym'},
      {q:'Wczoraj o 18:00 … telewizję.', opts:['oglądałem','oglądam','będę oglądał'], a:'oglądałem'},
      {q:'Czy … już zadanie domowe?', opts:['zrobiłaś','robiłaś','zrobisz'], a:'zrobiłaś'},
      {q:'Muszę … lekarza.', opts:['odwiedzić','odwiedzać','odwiedziłem'], a:'odwiedzić'},
      {q:'W tej firmie … po angielsku.', opts:['mówi się','mówimy','mówią'], a:'mówi się'},
      {q:'Wczoraj ona … na mnie godzinę.', opts:['czekała','czeka','czekam'], a:'czekała'},
      {q:'To kino jest … niż tamto.', opts:['lepsze','najlepsze','dobrze'], a:'lepsze'},
      {q:'On jest … ode mnie.', opts:['starszy','najstarszy','stary'], a:'starszy'},
      {q:'Nie … palić w tym budynku.', opts:['wolno','można','trzeba'], a:'wolno'}
    ];

    root.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'space-y-6';

    qs.forEach((q, idx)=>{
      const opts = shuffle(q.opts);
      const block = document.createElement('div');
      block.className = 'p-4 border rounded-xl';
      block.innerHTML = `
        <div class="text-sm text-slate-600">Задание ${idx+1}</div>
        <p class="mt-1 font-medium">${q.q}</p>
        <fieldset class="mt-2 space-y-2" id="g_${idx}"></fieldset>`;
      const fs = block.querySelector('fieldset');
      opts.forEach(opt=>{
        const id = `g_${idx}_${Math.random().toString(36).slice(2,8)}`;
        const w = document.createElement('div');
        w.innerHTML = `
          <label class="flex items-start gap-2 cursor-pointer" for="${id}">
            <input id="${id}" type="radio" name="g_${idx}" value="${opt}" class="mt-1">
            <span>${opt}</span>
          </label>`;
        fs.appendChild(w);
      });
      form.appendChild(block);
    });

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-3';
    actions.innerHTML = `
      <button type="button" class="px-4 py-2 rounded-xl border" id="check_grammar">Проверить ответы</button>
      <button type="button" class="px-4 py-2 rounded-xl border" id="reset_grammar">Сбросить</button>`;
    form.appendChild(actions);

    const result = document.createElement('div');
    result.id = 'grammar_result';
    form.appendChild(result);

    root.appendChild(form);

    form.querySelector('#check_grammar').addEventListener('click', ()=>{
      let correct = 0;
      qs.forEach((q, i)=>{
        const chosen = form.querySelector(`input[name=\\g_${i}]:checked`);
        if(chosen && chosen.value === q.a){ correct++; }
      });
      renderResult(result, 'result_grammar', correct, qs.length);
    });

    form.querySelector('#reset_grammar').addEventListener('click', ()=>{
      form.querySelectorAll('input[type=radio]').forEach(i=>{ i.checked=false; });
      result.innerHTML='';
    });
  }

  function buildReading(){
    const root = document.getElementById('reading-root');
    if(!root) return;
    const qs = [
      {text:'W sobotę otwarto nową kawiarnię w centrum miasta. Lokal jest przytulny i oferuje świeże ciasta.', q:'Co otwarto w centrum miasta?', opts:['Kawiarnię','Sklep odzieżowy','Księgarnię'], a:'Kawiarnię'},
      {text:'Anna szuka mieszkania blisko uniwersytetu, bo codziennie ma zajęcia od rana.', q:'Dlaczego Anna chce mieszkać blisko uniwersytetu?', opts:['Ma zajęcia codziennie rano','Pracuje w bibliotece','Lubi spacerować'], a:'Ma zajęcia codziennie rano'},
      {text:'W przyszłym tygodniu odbędzie się koncert w parku. Wstęp jest bezpłatny, ale liczba miejsc ograniczona.', q:'Co jest ważne dla uczestników koncertu?', opts:['Liczba miejsc jest ograniczona','Trzeba kupić bilet','Koncert jest odwołany'], a:'Liczba miejsc jest ograniczona'},
      {text:'Marek planuje wakacje nad morzem. Chce odpocząć i poczytać książki na plaży.', q:'Gdzie Marek planuje spędzić wakacje?', opts:['Nad morzem','W górach','W mieście'], a:'Nad morzem'},
      {text:'Wczoraj padał deszcz, więc mecz został przeniesiony na inny termin.', q:'Co stało się z meczem?', opts:['Został przeniesiony','Został skrócony','Został rozegrany'], a:'Został przeniesiony'},
      {text:'Sklep będzie zamknięty w niedzielę z powodu remontu.', q:'Kiedy sklep będzie zamknięty?', opts:['W niedzielę','W sobotę','W poniedziałek'], a:'W niedzielę'},
      {text:'Piotr kupił bilet miesięczny, bo codziennie dojeżdża do pracy tramwajem.', q:'Dlaczego Piotr kupił bilet miesięczny?', opts:['Bo codziennie dojeżdża tramwajem','Bo lubi kolekcjonować bilety','Bo jeździ tylko w weekendy'], a:'Bo codziennie dojeżdża tramwajem'},
      {text:'W muzeum wprowadzone zostały bezpłatne wejścia w każdy pierwszy poniedziałek miesiąca.', q:'Kiedy wejście do muzeum jest bezpłatne?', opts:['W pierwszy poniedziałek miesiąca','Codziennie po 18:00','W każdą sobotę'], a:'W pierwszy poniedziałek miesiąca'},
      {text:'Marta dostała zaproszenie na ślub, ale nie może przyjechać, ponieważ jest chora.', q:'Dlaczego Marta nie przyjedzie?', opts:['Bo jest chora','Bo ma egzamin','Bo pracuje w weekend'], a:'Bo jest chora'},
      {text:'Autobus numer 12 odjeżdża z nowego przystanku przy dworcu.', q:'Skąd odjeżdża autobus numer 12?', opts:['Z nowego przystanku przy dworcu','Z centrum handlowego','Z lotniska'], a:'Z nowego przystanku przy dworcu'},
      {text:'W czwartek będzie padał śnieg, dlatego szkoła może być zamknięta.', q:'Co może się stać ze szkołą?', opts:['Może być zamknięta','Będzie otwarta dłużej','Zorganizuje festyn'], a:'Może być zamknięta'},
      {text:'Kasia szuka pracy w kawiarni, bo lubi kontakt z ludźmi.', q:'Jakiej pracy szuka Kasia?', opts:['W kawiarni','W biurze','W muzeum'], a:'W kawiarni'},
      {text:'Jan planuje kurs języka polskiego online, ponieważ pracuje do późna.', q:'Dlaczego Jan wybiera kurs online?', opts:['Bo pracuje do późna','Bo nie lubi nauczycieli','Bo mieszka daleko od miasta'], a:'Bo pracuje do późna'},
      {text:'W bibliotece trzeba oddać książki do końca miesiąca.', q:'Do kiedy trzeba oddać książki?', opts:['Do końca miesiąca','Do jutra rano','Do końca tygodnia'], a:'Do końca miesiąca'},
      {text:'Na rynku otwarto targ z lokalnymi produktami: warzywami, serami i pieczywem.', q:'Co sprzedaje się na targu?', opts:['Lokalne produkty','Elektronikę','Ubrania markowe'], a:'Lokalne produkty'},
      {text:'W sobotę rano odbędzie się sprzątanie parku. Organizatorzy proszą o rękawiczki.', q:'Co powinni przynieść uczestnicy?', opts:['Rękawiczki','Parasol','Latarki'], a:'Rękawiczki'},
      {text:'Pociąg do Gdańska ma 30 minut opóźnienia z powodu awarii.', q:'O ile spóźni się pociąg?', opts:['O 30 minut','O 10 minut','O 2 godziny'], a:'O 30 minut'},
      {text:'Sklep internetowy oferuje darmową dostawę przy zamówieniach powyżej 150 zł.', q:'Kiedy dostawa jest darmowa?', opts:['Przy zamówieniu powyżej 150 zł','Zawsze, bez względu na cenę','Tylko w weekend'], a:'Przy zamówieniu powyżej 150 zł'},
      {text:'Ania uczy się do egzaminu B1 i powtarza gramatykę każdego dnia.', q:'Co Ania powtarza codziennie?', opts:['Gramatykę','Wymowę','Historię'], a:'Gramatykę'},
      {text:'W kinie trwa tydzień filmów polskich, bilety są tańsze niż zwykle.', q:'Co się dzieje w kinie?', opts:['Tydzień filmów polskich','Remont sali','Maraton filmów amerykańskich'], a:'Tydzień filmów polskich'}
    ];

    root.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'space-y-6';

    qs.forEach((q, idx)=>{
      const opts = shuffle(q.opts);
      const block = document.createElement('div');
      block.className = 'p-4 border rounded-xl';
      block.innerHTML = `
        <div class="text-sm text-slate-600">Текст ${idx+1}</div>
        <p class="mt-1 text-slate-700">${q.text}</p>
        <p class="mt-3 font-medium">${q.q}</p>
        <fieldset class="mt-2 space-y-2" id="r_${idx}"></fieldset>`;
      const fs = block.querySelector('fieldset');
      opts.forEach(opt=>{
        const id = `r_${idx}_${Math.random().toString(36).slice(2,8)}`;
        const w = document.createElement('div');
        w.innerHTML = `
          <label class="flex items-start gap-2 cursor-pointer" for="${id}">
            <input id="${id}" type="radio" name="r_${idx}" value="${opt}" class="mt-1">
            <span>${opt}</span>
          </label>`;
        fs.appendChild(w);
      });
      form.appendChild(block);
    });

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-3';
    actions.innerHTML = `
      <button type="button" class="px-4 py-2 rounded-xl border" id="check_reading">Проверить ответы</button>
      <button type="button" class="px-4 py-2 rounded-xl border" id="reset_reading">Сбросить</button>`;
    form.appendChild(actions);

    const result = document.createElement('div');
    result.id = 'reading_result';
    form.appendChild(result);

    root.appendChild(form);

    form.querySelector('#check_reading').addEventListener('click', ()=>{
      let correct = 0;
      qs.forEach((q, i)=>{
        const chosen = form.querySelector(`input[name=\\r_${i}]:checked`);
        if(chosen && chosen.value === q.a){ correct++; }
      });
      renderResult(result, 'result_reading', correct, qs.length);
    });

    form.querySelector('#reset_reading').addEventListener('click', ()=>{
      form.querySelectorAll('input[type=radio]').forEach(i=>{ i.checked=false; });
      result.innerHTML='';
    });
  }

  async function initListening(){
    try{
      const res = await fetch('/assets/data/listening.csv', {cache:'no-store'});
      const text = await res.text();
      const items = parseCSV(text);
      if(!items.length){ throw new Error('No listening data'); }
      buildListening(items);
    }catch(e){
      const root = document.getElementById('listening-root');
      if(root){ root.innerHTML = '<div class="p-4 rounded-xl border text-red-600">Не удалось загрузить задания аудирования. Проверьте файл /assets/data/listening.csv</div>'; }
    }
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    initListening();
    buildGrammar();
    buildReading();
  });
})();
