(() => {
  'use strict';
  const body = document.body;
  const root = body.dataset.root || '.';
  const islandId = body.dataset.island || '';
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const islands = {
    'truong-sa-lon': {name:'Trường Sa Lớn', images:['images/truong-sa-lon-1.jpg','images/truong-sa-lon-2.jpg','images/truong-sa-lon-3.jpg'], greeting:'audio/chao-truong-sa-lon.mp3'},
    'sinh-ton': {name:'Sinh Tồn', images:['images/sinh-ton-illustration.svg'], greeting:'audio/chao-sinh-ton.mp3'},
    'song-tu-tay': {name:'Song Tử Tây', images:['images/song-tu-tay-illustration.svg'], greeting:'audio/chao-song-tu-tay.mp3'},
    'an-bang': {name:'An Bang', images:['images/an-bang-illustration.svg'], greeting:'audio/chao-an-bang.mp3'}
  };

  // Homepage intro: robust audio toggle and guaranteed return to homepage.
  const introScreen = document.getElementById('intro-video-screen');
  if (introScreen) {
    const introVideo = document.getElementById('intro-video');
    const skipIntro = document.getElementById('intro-skip');
    const soundButton = document.getElementById('intro-sound-prompt');
    const progressBar = document.getElementById('intro-progress-bar');
    let introClosed = false;
    let soundOn = false;
    let fallbackCloseTimer = 0;
    let durationCloseTimer = 0;
    document.documentElement.classList.add('intro-active');
    document.body.classList.add('intro-active');

    function closeIntro() {
      if (introClosed) return;
      introClosed = true;
      window.clearTimeout(fallbackCloseTimer);
      window.clearTimeout(durationCloseTimer);
      introVideo.removeEventListener('ended', closeIntro);
      introScreen.classList.add('is-leaving');
      introVideo.pause();
      document.documentElement.classList.remove('intro-active');
      document.body.classList.remove('intro-active');
      // Remove the overlay even if a CSS transition event never fires on mobile.
      window.setTimeout(() => { if (introScreen.isConnected) introScreen.remove(); }, 450);
    }

    function updateSoundButton() {
      soundButton.textContent = soundOn ? '🔊' : '📢';
      soundButton.setAttribute('aria-label', soundOn ? 'Tắt âm thanh video' : 'Bật âm thanh video');
      soundButton.setAttribute('title', soundOn ? 'Tắt âm thanh' : 'Bật âm thanh');
      soundButton.classList.toggle('sound-on', soundOn);
    }

    function updateIntroProgress() {
      const duration = Number(introVideo.duration);
      if (progressBar && Number.isFinite(duration) && duration > 0) {
        progressBar.style.width = Math.min(100, introVideo.currentTime / duration * 100) + '%';
      }
      // Some Android WebViews omit `ended`; close when playback reaches its final frame.
      if (Number.isFinite(duration) && duration > 0 && introVideo.currentTime >= duration - 0.08) closeIntro();
    }

    function startDurationFallback() {
      const duration = Number(introVideo.duration);
      if (Number.isFinite(duration) && duration > 0) {
        window.clearTimeout(durationCloseTimer);
        durationCloseTimer = window.setTimeout(closeIntro, Math.ceil((duration + 1.2) * 1000));
      }
    }

    function startVideoMutedIfNeeded() {
      const result = introVideo.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          if (introClosed) return;
          // If audible autoplay is blocked, muted playback lets the visitor use the speaker button.
          introVideo.muted = true;
          introVideo.defaultMuted = true;
          soundOn = false;
          updateSoundButton();
          introVideo.play().catch(() => {
            // If autoplay is blocked entirely, a tap on the video itself starts playback.
            introScreen.classList.add('needs-gesture');
          });
        });
      }
    }

    soundButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (introClosed) return;
      if (!soundOn || introVideo.muted) {
        // Unmute and call play synchronously inside the trusted tap gesture.
        introVideo.muted = false;
        introVideo.defaultMuted = false;
        introVideo.volume = 1;
        soundOn = true;
        updateSoundButton();
        const result = introVideo.play();
        if (result && typeof result.catch === 'function') result.catch(() => {
          soundOn = false;
          introVideo.muted = true;
          introVideo.defaultMuted = true;
          updateSoundButton();
          introScreen.classList.add('needs-gesture');
        });
      } else {
        introVideo.muted = true;
        introVideo.defaultMuted = true;
        soundOn = false;
        updateSoundButton();
      }
    });

    // If autoplay is blocked completely, tapping the video area starts it; buttons remain separate.
    introVideo.addEventListener('click', event => {
      if (introClosed) return;
      if (introVideo.paused) {
        introVideo.play().then(() => introScreen.classList.remove('needs-gesture')).catch(() => {});
      }
    });
    skipIntro.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      closeIntro();
    });
    introScreen.addEventListener('click', event => {
      if (event.target === introScreen) event.stopPropagation();
    });
    introVideo.addEventListener('timeupdate', updateIntroProgress);
    introVideo.addEventListener('ended', closeIntro);
    introVideo.addEventListener('loadedmetadata', startDurationFallback, { once: true });
    introVideo.addEventListener('error', () => {
      // A broken/missing clip must never trap visitors on the intro screen.
      fallbackCloseTimer = window.setTimeout(closeIntro, 1800);
    }, { once: true });

    introVideo.autoplay = true;
    introVideo.playsInline = true;
    introVideo.preload = 'auto';
    introVideo.muted = true;
    introVideo.defaultMuted = true;
    introVideo.volume = 1;
    soundOn = false;
    updateSoundButton();
    startVideoMutedIfNeeded();
    if (introVideo.readyState >= 1) startDurationFallback();
    // Absolute safety net: always restore the homepage, even if media events never fire.
    fallbackCloseTimer = window.setTimeout(closeIntro, 17000);
  }

  // Clock: always display Vietnam time (UTC+7), independent of the device timezone.
  const timeFormatter = new Intl.DateTimeFormat('vi-VN', {timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const dateFormatter = new Intl.DateTimeFormat('vi-VN', {timeZone:'Asia/Ho_Chi_Minh',weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
  function updateClock() {
    const now = new Date();
    document.querySelectorAll('[data-vn-time]').forEach(el => { el.textContent = timeFormatter.format(now) + ' · UTC+7'; });
    document.querySelectorAll('[data-vn-date]').forEach(el => { el.textContent = dateFormatter.format(now); });
    // Approximate local sky cycle; decorative transitions, not astronomical sunrise data.
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(now);
    const part = type => parts.find(item => item.type === type)?.value || '0';
    const hour = Number(part('hour')) % 24, minute = Number(part('minute')), minutes = hour * 60 + minute;
    let phase = 'night', label = 'Đêm · Ánh trăng';
    if (minutes >= 300 && minutes < 420) { phase = 'sunrise'; label = 'Bình minh · Trăng nhường nắng'; }
    else if (minutes >= 420 && minutes < 1020) { phase = 'day'; label = minutes >= 690 && minutes < 750 ? 'Giữa trưa · Mặt trời tỏa tia nắng' : 'Ban ngày · Ánh mặt trời'; }
    else if (minutes >= 1020 && minutes < 1140) { phase = 'sunset'; label = 'Hoàng hôn · Nắng nhường trăng'; }
    else if (minutes >= 1410 || minutes < 30) { phase = 'midnight'; label = 'Giữa khuya · Trăng và sao li ti'; }
    document.querySelectorAll('[data-sky-clock]').forEach(el => { el.dataset.skyClock = phase; el.setAttribute('aria-label', label); });
    document.querySelectorAll('[data-sky-phase]').forEach(el => { el.textContent = label; });
  }
  updateClock(); window.setInterval(updateClock, 1000);

  // Real compass: use device orientation when the browser exposes a heading sensor.
  const compassHeading = document.getElementById('compass-heading');
  const compassNeedle = document.getElementById('compass-needle');
  const compassInstrument = document.getElementById('compass-instrument');
  let compassSeen = false;
  function directionName(deg) {
    return ['Bắc','Đông Bắc','Đông','Đông Nam','Nam','Tây Nam','Tây','Tây Bắc'][Math.round(deg / 45) % 8];
  }
  function handleOrientation(event) {
    let heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading :
      (Number.isFinite(event.alpha) ? (360 - event.alpha) % 360 : null);
    if (heading === null) return;
    compassSeen = true;
    heading = (heading + 360) % 360;
    if (compassHeading) compassHeading.textContent = `${directionName(heading)} · ${Math.round(heading)}°`;
    if (compassNeedle) compassNeedle.style.transform = `translate(-50%,-50%) rotate(${heading}deg)`;
  }
  if (compassHeading && ('DeviceOrientationEvent' in window)) {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      compassHeading.textContent = 'Chạm để bật la bàn';
      compassInstrument?.addEventListener('click', async () => {
        try { const permission = await DeviceOrientationEvent.requestPermission(); if (permission === 'granted') compassHeading.textContent = 'Đang xác định hướng…'; }
        catch (_) { compassHeading.textContent = 'Cảm biến không khả dụng'; }
      });
    }
    window.setTimeout(() => { if (!compassSeen && compassHeading.textContent === 'Đang xác định hướng…') compassHeading.textContent = 'La bàn không hỗ trợ'; }, 5000);
  } else if (compassHeading) compassHeading.textContent = 'La bàn không hỗ trợ';

  // A small occasional boat whistle and animated exhaust; audio starts only after a user gesture.
  const boat = document.querySelector('.hero-boat');
  let boatAudioContext = null;
  function boatWhistle() {
    if (!boat || document.hidden || !boatAudioContext || boatAudioContext.state !== 'running') return;
    try {
      const osc = boatAudioContext.createOscillator(), gain = boatAudioContext.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(520, boatAudioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(410, boatAudioContext.currentTime + 0.8);
      gain.gain.setValueAtTime(0.0001, boatAudioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.055, boatAudioContext.currentTime + 0.08);
      gain.gain.setValueAtTime(0.055, boatAudioContext.currentTime + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, boatAudioContext.currentTime + 0.9);
      osc.connect(gain); gain.connect(boatAudioContext.destination); osc.start(); osc.stop(boatAudioContext.currentTime + 0.92);
      boat.classList.add('whistling'); window.setTimeout(() => boat.classList.remove('whistling'), 1000);
    } catch (_) {}
  }
  function enableBoatAudio() {
    if (!boat || boatAudioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try { boatAudioContext = new AudioCtx(); boatAudioContext.resume().catch(() => {}); } catch (_) {}
  }
  window.addEventListener('pointerdown', enableBoatAudio, {once:true, passive:true});
  window.setInterval(() => { if (Math.random() > 0.52) boatWhistle(); }, 18000);

  // Optional real site-wide analytics. Configure your own GoatCounter site code in docs/README.md.
  const analyticsCode = document.documentElement.dataset.goatcounter || body.dataset.goatcounter || '';
  const countEls = [...document.querySelectorAll('[data-visit-count]')];
  const noteEls = [...document.querySelectorAll('[data-visit-note]')];
  if (analyticsCode && !/YOUR[-_ ]?SITE|example/i.test(analyticsCode)) {
    const script = document.createElement('script');
    script.async = true; script.src = 'https://gc.zgo.at/count.js';
    script.dataset.goatcounter = analyticsCode.replace(/\/$/, '') + '/count';
    script.onload = () => {
      const pagePath = window.location.pathname || '/';
      const counterUrl = analyticsCode.replace(/\/$/, '') + '/counter/' + encodeURIComponent(pagePath) + '.json';
      fetch(counterUrl, {mode:'cors', cache:'no-store'})
        .then(response => { if (!response.ok) throw new Error('Counter endpoint unavailable'); return response.json(); })
        .then(data => {
          const count = data.count ?? data.total ?? data.views;
          countEls.forEach(el => { el.textContent = Number.isFinite(Number(count)) ? Number(count).toLocaleString('vi-VN') + ' lượt xem trang này' : 'Đã bật ghi nhận lượt xem'; });
          noteEls.forEach(el => { el.textContent = Number.isFinite(Number(count)) ? 'Số liệu từ dịch vụ thống kê trực tuyến.' : 'Đang ghi nhận truy cập; chưa đọc được bộ đếm công khai.'; });
        })
        .catch(() => {
          countEls.forEach(el => { el.textContent = 'Đã bật ghi nhận lượt xem'; });
          noteEls.forEach(el => { el.textContent = 'Đã gửi dữ liệu thống kê; bộ đếm công khai có thể chưa được bật trong cấu hình dịch vụ.'; });
        });
    };
    script.onerror = () => {
      countEls.forEach(el => { el.textContent = 'Chưa lấy được dữ liệu thống kê'; });
    };
    document.head.appendChild(script);
  }

  // Full-page zoom transition from homepage to a separate island URL.
  const overlay = document.getElementById('transition-overlay');
  const label = document.getElementById('transition-label');
  document.querySelectorAll('a.island-link').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const href = link.getAttribute('href');
      if (!href) return;
      try { sessionStorage.setItem('dao-transition-enter', '1'); } catch (_) {}
      if (!overlay || reducedMotion) return;
      event.preventDefault();
      if (label) label.textContent = 'Đang tiến vào ' + (link.dataset.islandName || 'đảo') + '…';
      overlay.classList.add('active');
      window.setTimeout(() => { window.location.href = href; }, 680);
    });
  });
  let arrivedFromSelection = false;
  try {
    arrivedFromSelection = sessionStorage.getItem('dao-transition-enter') === '1';
    if (arrivedFromSelection) {
      sessionStorage.removeItem('dao-transition-enter');
      if (!reducedMotion) body.classList.add('page-enter');
    }
  } catch (_) {}
  document.querySelectorAll('.island-nav a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || reducedMotion || !overlay) return;
      const href = link.getAttribute('href'); if (!href || href === '#') return;
      event.preventDefault();
      try { sessionStorage.setItem('dao-transition-enter', '1'); } catch (_) {}
      if (label) label.textContent = 'Đang chuyển hải trình…';
      overlay.classList.add('active');
      window.setTimeout(() => { window.location.href = href; }, 600);
    });
  });

  // Central audio policy: any other media playback pauses the island greeting.
  const greeting = document.getElementById('island-greeting');
  function stopGreeting() {
    if (!greeting) return;
    greeting.pause();
    try { greeting.currentTime = 0; } catch (_) {}
  }
  document.addEventListener('play', event => {
    const target = event.target;
    if (target instanceof HTMLMediaElement && target !== greeting) stopGreeting();
  }, true);
  document.addEventListener('click', event => {
    const soundControl = event.target.closest('video, audio, [data-sound-action]');
    if (soundControl && soundControl !== greeting) stopGreeting();
  }, true);
  // Greeting is attempted after arrival from a user-selected island. Browsers may block autoplay;
  // in that case the visitor can start it after a direct interaction.
  if (greeting && arrivedFromSelection) {
    const attempt = () => greeting.play().catch(() => {});
    if (document.readyState === 'complete') attempt();
    else window.addEventListener('load', attempt, {once:true});
  }

  // Gallery: one 5-second interval, shared by auto-advance and manual controls.
  const mainImage = document.getElementById('gallery-main-image');
  const galleryThumbs = [...document.querySelectorAll('.gallery-thumbnail')];
  const prev = document.getElementById('gallery-prev');
  const next = document.getElementById('gallery-next');
  if (mainImage && islandId && islands[islandId]) {
    const data = islands[islandId];
    const images = data.images.map(path => root + '/' + path);
    let index = 0;
    let timer = null;
    const gallery = mainImage.closest('.gallery-panel');
    function showImage(nextIndex, animate=true) {
      index = (nextIndex + images.length) % images.length;
      if (animate) mainImage.classList.add('changing');
      const target = images[index];
      const apply = () => {
        mainImage.src = target;
        mainImage.onload = () => mainImage.classList.remove('changing');
        if (mainImage.complete) window.setTimeout(() => mainImage.classList.remove('changing'), 80);
      };
      if (animate) window.setTimeout(apply, 110); else apply();
      galleryThumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
    }
    function resetTimer() {
      if (timer) window.clearInterval(timer);
      if (images.length > 1 && !document.hidden) timer = window.setInterval(() => showImage(index + 1), 5000);
    }
    function manualMove(delta) { showImage(index + delta); resetTimer(); }
    if (prev) prev.addEventListener('click', () => manualMove(-1));
    if (next) next.addEventListener('click', () => manualMove(1));
    galleryThumbs.forEach((thumb, i) => thumb.addEventListener('click', () => { showImage(i); resetTimer(); }));
    if (gallery) {
      let touchX = null;
      gallery.addEventListener('touchstart', e => { touchX = e.changedTouches[0]?.clientX ?? null; }, {passive:true});
      gallery.addEventListener('touchend', e => {
        if (touchX === null) return;
        const delta = touchX - (e.changedTouches[0]?.clientX ?? touchX); touchX = null;
        if (Math.abs(delta) > 45) manualMove(delta > 0 ? 1 : -1);
      }, {passive:true});
      gallery.addEventListener('mouseenter', () => { if (timer) window.clearInterval(timer); });
      gallery.addEventListener('mouseleave', resetTimer);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (timer) window.clearInterval(timer); timer = null; }
      else resetTimer();
    });
    // Preload the next image to reduce perceived delay.
    if (images.length > 1) { const preload = new Image(); preload.src = images[1]; }
    resetTimer();
  }

  // Keep the decorative boat smooth and avoid JS animation loops.
  const shipLane = document.querySelector('.ship-lane');
  if (shipLane && document.hidden) shipLane.classList.add('paused');
  document.addEventListener('visibilitychange', () => {
    if (shipLane) shipLane.classList.toggle('paused', document.hidden);
  });
})();
