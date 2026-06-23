    /* ── §02 EDITORIAL SHOWCASE ─────────────── */
    const edSection = $('.editorial-section');
    if (edSection) {
      const edEyebrow = $('#ed-eyebrow');
      if (edEyebrow) animateEyebrow(edEyebrow, '.editorial-section');
      
      const edHeadline = $('#ed-headline');
      if (edHeadline) {
        edHeadline.querySelectorAll('.ed-line').forEach((line, i) => {
          splitWords(line);
          gsap.fromTo(line.querySelectorAll('.sw-i'),
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: 2, ease: 'power2.out', delay: i * 0.1,
              scrollTrigger: { trigger: edHeadline, start: 'top 80%', once: true } }
          );
        });
      }

      const edSub = $('#ed-sub');
      if (edSub) {
        gsap.fromTo(edSub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out', scrollTrigger: { trigger: edSub, start: 'top 85%', once: true } });
      }

      $$('.ed-ev-row').forEach((row, i) => {
        gsap.fromTo(row, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out', delay: i * 0.15, scrollTrigger: { trigger: '#ed-ev-preview', start: 'top 85%', once: true } });
      });

      const edAllBtn = $('#btn-all-events');
      if (edAllBtn) {
        gsap.fromTo(edAllBtn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: edAllBtn, start: 'top 90%', once: true } });
      }

      $$('.ed-img').forEach((imgWrap, i) => {
        revealImage(imgWrap, { dir: i % 2 === 0 ? 'right' : 'left', start: 'top 75%' });
        const img = imgWrap.querySelector('img');
        if (img) {
          gsap.fromTo(img, { scale: 1.3 }, { scale: 1.18, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: imgWrap, start: 'top 75%', once: true } });
        }
      });

      const edBadge = $('#ed-badge');
      if (edBadge) {
        gsap.fromTo(edBadge, { scale: 0, rotation: -45, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.5, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.editorial-images', start: 'top 60%', once: true } });
      }

      $$('.ed-cat-item').forEach((cat, i) => {
        gsap.fromTo(cat, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out', delay: i * 0.1, scrollTrigger: { trigger: '.ed-cat-grid', start: 'top 85%', once: true } });
      });
      
      const edCatFeatured = $('#cat-center');
      if (edCatFeatured) {
        gsap.fromTo(edCatFeatured, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: '.ed-cat-grid', start: 'top 85%', once: true } });
      }
    }
