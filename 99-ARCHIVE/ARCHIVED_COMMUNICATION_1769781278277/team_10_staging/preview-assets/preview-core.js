
    window.onload = () => {
      console.log("🚀 Phoenix Preview Engine Active");
      if (window.lucide) lucide.createIcons();
      
      // הזרקת באנר זיהוי סביבה
      const banner = document.createElement('div');
      banner.className = 'preview-banner';
      banner.innerText = 'TIKTRACK V2 - STAGING PREVIEW MODE';
      document.body.prepend(banner);
    };
  