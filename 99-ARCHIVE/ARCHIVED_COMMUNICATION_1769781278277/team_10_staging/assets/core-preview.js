
    window.onload = () => {
      console.log("🚀 Phoenix Sandbox Engine v214 Active");
      if (window.lucide) lucide.createIcons();
      
      // Auto-fix relative paths for sandbox environment
      document.querySelectorAll('img').forEach(img => {
        let src = img.getAttribute('src');
        if (src && src.startsWith('/')) img.setAttribute('src', '.' + src);
      });
    };
  