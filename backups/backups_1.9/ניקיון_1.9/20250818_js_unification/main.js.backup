document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector("#agGrid");
  if (!gridDiv) return;

  const columnDefs = [
    {
      headerName: "נכס",
      field: "ticker",
      cellRenderer: params => `<a href="#" onclick="openPlanDetails('${params.value}'); return false;">${params.value}</a>`
    },
    { headerName: "תאריך", field: "date" },
    { headerName: "סוג השקעה", field: "type" },
    { headerName: "סכום/כמות", field: "amount" },
    { headerName: "יעד", field: "target" },
    { headerName: "סטופ", field: "stop" },
    { headerName: "נוכחי", field: "current" },
    { headerName: "סטטוס", field: "status" },
    { headerName: "המרה לטרייד", field: "action", cellRenderer: () => '⬅️' }
  ];

  const rowData = [
    { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "" },
    { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "" },
    { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "" },
    { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "" },
    { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "" },
    { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "" }
  ];

  const gridOptions = {
    columnDefs,
    rowData,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true
    }
  };

  agGrid.createGrid(gridDiv, gridOptions);
});

function openPlanDetails(ticker = null) {
  const modal = document.getElementById("planModal");
  const content = document.getElementById("planDetailsContent");
  
  // קבלת תאריך נוכחי
  const today = new Date().toISOString().split('T')[0];
  
  if (ticker) {
    // עריכת תכנון קיים
    content.innerHTML = `<h2>עריכת תכנון - ${ticker}</h2>
      <form id="planForm">
        <div class="form-group">
          <label>נכס:</label>
          <input type="text" value="${ticker}" readonly>
        </div>
        <div class="form-group">
          <label>תאריך:</label>
          <input type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>סוג השקעה:</label>
          <select>
            <option value="סווינג">סווינג</option>
            <option value="השקעה">השקעה</option>
            <option value="פאסיבי">פאסיבי</option>
          </select>
        </div>
        <div class="form-group">
          <label>סכום השקעה:</label>
          <input type="number" placeholder="הכנס סכום">
        </div>
        <div class="form-group">
          <label>כמות מניות:</label>
          <input type="number" placeholder="הכנס כמות">
        </div>
        <div class="form-group">
          <label>מחיר יעד:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר יעד">
        </div>
        <div class="form-group">
          <label>מחיר סטופ:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר סטופ">
        </div>
        <div class="form-actions">
          <button type="submit">שמור</button>
          <button type="button" onclick="closePlanDetails()">ביטול</button>
        </div>
      </form>`;
  } else {
    // הוספת תכנון חדש
    content.innerHTML = `<h2>הוספת תכנון חדש</h2>
      <form id="planForm">
        <div class="form-group">
          <label>נכס:</label>
          <input type="text" placeholder="הכנס סימול הנכס">
        </div>
        <div class="form-group">
          <label>תאריך:</label>
          <input type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>סוג השקעה:</label>
          <select>
            <option value="סווינג">סווינג</option>
            <option value="השקעה">השקעה</option>
            <option value="פאסיבי">פאסיבי</option>
          </select>
        </div>
        <div class="form-group">
          <label>סכום השקעה:</label>
          <input type="number" placeholder="הכנס סכום">
        </div>
        <div class="form-group">
          <label>כמות מניות:</label>
          <input type="number" placeholder="הכנס כמות">
        </div>
        <div class="form-group">
          <label>מחיר יעד:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר יעד">
        </div>
        <div class="form-group">
          <label>מחיר סטופ:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר סטופ">
        </div>
        <div class="form-actions">
          <button type="submit">שמור</button>
          <button type="button" onclick="closePlanDetails()">ביטול</button>
        </div>
      </form>`;
  }
  
  modal.style.display = "block";
}

function closePlanDetails() {
  document.getElementById("planModal").style.display = "none";
}
