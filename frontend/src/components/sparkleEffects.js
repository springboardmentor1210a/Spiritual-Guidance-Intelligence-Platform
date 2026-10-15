export const spawnSparkleBurst = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);
  
    const numParticles = 12;
    const colors = ['#fbbf24', '#ec4899', '#38bdf8', '#c084fc', '#ffffff'];
  
    for (let i = 0; i < numParticles; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-particle';
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 80;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
  
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty('--sparkle-dx', `${dx}px`);
      p.style.setProperty('--sparkle-dy', `${dy}px`);
  
      const size = 6 + Math.random() * 6;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.boxShadow = `0 0 8px ${p.style.background}`;
  
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  };
  
  export const triggerTabFlash = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const flash = document.createElement('div');
    flash.className = 'tab-switch-flash';
    flash.style.setProperty('--flash-x', `${rect.left + rect.width / 2}px`);
    flash.style.setProperty('--flash-y', `${rect.top + rect.height / 2}px`);
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  };