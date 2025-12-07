# דוח סריקת Alert/Confirm Usage
## Alert/Confirm Usage Scan Report

**תאריך יצירה:** 2025-12-03 01:50:31  
**מטרה:** זיהוי כל השימושים ב-`alert()` ו-`confirm()` בקבצי JS

---

## 📊 סיכום כללי

- **סה"כ קבצים עם alert/confirm:** 35
- **סה"כ מופעי alert():** 39
- **סה"כ מופעי confirm():** 38
- **סה"כ מופעים:** 77

---

## 📁 קבצים עם שימושים

### alerts.js

**סה"כ מופעים:** 7 (alert: 5, confirm: 2)

#### Alert() Usage:

- **שורה 205:**
  ```javascript
  alert('שגיאה בטעינת נתוני ההתראות: ' + error.message);
  ```
  **הקשר:**
  ```javascript
          if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בטעינת נתוני ההתראות', error.message);
        } else {
          alert('שגיאה בטעינת נתוני ההתראות: ' + error.message);
        }
      }
      throw error;
  ```

- **שורה 821:**
  ```javascript
  { type: alert.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert && window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert(${alert.id})`, title: alert.status === 'cancelled' ? 'הפעל מחדש' : 'בטל' },
  ```
  **הקשר:**
  ```javascript
          const result = window.createActionsMenu([
          { type: 'VIEW', onclick: `window.showEntityDetails('alert', ${alert.id}, { mode: 'view' })`, title: 'צפה בפרטי התראה' },
          { type: 'EDIT', onclick: `editAlert(${alert.id})`, title: 'ערוך התראה' },
          { type: alert.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert && window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert(${alert.id})`, title: alert.status === 'cancelled' ? 'הפעל מחדש' : 'בטל' },
          { type: 'DELETE', onclick: `deleteAlert(${alert.id})`, title: 'מחק התראה' }
        ]);
        return result || '';
  ```

- **שורה 3674:**
  ```javascript
  alert('לוג מפורט הועתק ללוח!');
  ```
  **הקשר:**
  ```javascript
              } else if (window.showInfoNotification) {
                window.showInfoNotification('לוג מפורט הועתק ללוח!', 'info');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
  ```

- **שורה 3682:**
  ```javascript
  alert('אין לוג להעתקה');
  ```
  **הקשר:**
  ```javascript
              } else if (window.showInfoNotification) {
                window.showInfoNotification('אין לוג להעתקה', 'warning');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
  ```

- **שורה 3692:**
  ```javascript
  alert('שגיאה בהעתקת הלוג');
  ```
  **הקשר:**
  ```javascript
          } else if (window.showInfoNotification) {
            window.showInfoNotification('שגיאה בהעתקת הלוג', 'error');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}
  ```

#### Confirm() Usage:

- **שורה 2917:**
  ```javascript
  confirmed = window.confirm('האם אתה בטוח שברצונך למחוק התראה זו?');
  ```
  **הקשר:**
  ```javascript
              );
          });
        } else {
          confirmed = window.confirm('האם אתה בטוח שברצונך למחוק התראה זו?');
        }
      }
      if (confirmed) {
  ```

- **שורה 3271:**
  ```javascript
  confirmed = window.confirm('האם אתה בטוח שברצונך להפעיל מחדש את ההתראה?');
  ```
  **הקשר:**
  ```javascript
            );
        });
      } else {
        confirmed = window.confirm('האם אתה בטוח שברצונך להפעיל מחדש את ההתראה?');
      }
    }
    if (!confirmed) {
  ```

---

### modules/business-module.js

**סה"כ מופעים:** 7 (alert: 3, confirm: 4)

#### Alert() Usage:

- **שורה 3115:**
  ```javascript
  alert('לוג מפורט הועתק ללוח!');
  ```
  **הקשר:**
  ```javascript
              if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
  ```

- **שורה 3121:**
  ```javascript
  alert('אין לוג להעתקה');
  ```
  **הקשר:**
  ```javascript
              if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
  ```

- **שורה 3129:**
  ```javascript
  alert('שגיאה בהעתקת הלוג');
  ```
  **הקשר:**
  ```javascript
          if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}
  ```

#### Confirm() Usage:

- **שורה 1896:**
  ```javascript
  firstWarning = window.confirm(
  ```
  **הקשר:**
  ```javascript
              );
          } else {
            // Fallback למקרה שמערכת התראות לא זמינה
            firstWarning = window.confirm(
              '⚠️ אזהרה: במערכת מופיע שיש פוזיציה פתוחה.\n' +
                    'האם אתה בטוח שברצונך לסגור את הטרייד?\n\n' +
                    'פוזיציה נוכחית: ' + currentPosition.quantity + ' מניות',
  ```

- **שורה 1938:**
  ```javascript
  secondWarning = window.confirm(
  ```
  **הקשר:**
  ```javascript
                );
            } else {
              // Fallback למקרה שמערכת התראות לא זמינה
              secondWarning = window.confirm(
                '🔒 ממשק הסגירה המלא כולל סגירת פוזיציה נמצא בפיתוח.\n\n' +
                          'כרגע ניתן לסגור את הטרייד אך יש לזכור לעדכן עסקה לסגירת פוזיציה.\n\n' +
                          'האם אתה בטוח שברצונך להמשיך?',
  ```

- **שורה 2645:**
  ```javascript
  const confirmed = window.confirm(message);
  ```
  **הקשר:**
  ```javascript
            );
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          const confirmed = window.confirm(message);
          resolve(confirmed);
        }
        resolve(confirmed);
  ```

- **שורה 2984:**
  ```javascript
  if (confirm(confirmMessage)) {
  ```
  **הקשר:**
  ```javascript
        `סכום: ${trade.amount || 'לא ידוע'}`;
    
    // הצגת חלון אישור
    if (confirm(confirmMessage)) {
      // ביצוע המחיקה
      deleteTradeRecord(tradeId);
    }
  ```

---

### trade_plans.js

**סה"כ מופעים:** 6 (alert: 0, confirm: 6)

#### Confirm() Usage:

- **שורה 191:**
  ```javascript
  confirmed = confirm(confirmMessage);
  ```
  **הקשר:**
  ```javascript
                    );
                });
              } else {
                confirmed = confirm(confirmMessage);
              }
            }
          }
  ```

- **שורה 738:**
  ```javascript
  window.confirm('האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?')));
  ```
  **הקשר:**
  ```javascript
                              'warning'
                          );
                        }) :
                        window.confirm('האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?')));
            if (confirmed) {
              if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification(
  ```

- **שורה 1436:**
  ```javascript
  confirmed = window.confirm('האם אתה בטוח שברצונך לבטל את תוכנית המסחר?');
  ```
  **הקשר:**
  ```javascript
                    );
                });
              } else {
                confirmed = window.confirm('האם אתה בטוח שברצונך לבטל את תוכנית המסחר?');
              }
            }
          }
  ```

- **שורה 3094:**
  ```javascript
  confirmed = window.confirm('האם למחוק את התנאי הנבחר?');
  ```
  **הקשר:**
  ```javascript
                  );
              });
            } else {
              confirmed = window.confirm('האם למחוק את התנאי הנבחר?');
            }
          }
        }
  ```

- **שורה 3207:**
  ```javascript
  return window.confirm(fullMessage);
  ```
  **הקשר:**
  ```javascript
                );
            });
          } else {
            return window.confirm(fullMessage);
          }
        }
      }
  ```

- **שורה 4318:**
  ```javascript
  confirmed = confirm('האם אתה בטוח שברצונך למחוק את תוכנית המסחר?');
  ```
  **הקשר:**
  ```javascript
                              );
                        });
                    } else {
                        confirmed = confirm('האם אתה בטוח שברצונך למחוק את תוכנית המסחר?');
                    }
                }
            }
  ```

---

### init-system-check.js

**סה"כ מופעים:** 6 (alert: 6, confirm: 0)

#### Alert() Usage:

- **שורה 197:**
  ```javascript
  alert(errorMsg);
  ```
  **הקשר:**
  ```javascript
              if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
            return;
        }
  ```

- **שורה 221:**
  ```javascript
  alert(errorMsg);
  ```
  **הקשר:**
  ```javascript
              if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
        }
    }
  ```

- **שורה 274:**
  ```javascript
  alert('קוד שנוצר:\n\n' + generatedCode.substring(0, 500) + '\n\n... (נראה בקונסולה)');
  ```
  **הקשר:**
  ```javascript
              );
        } else {
            // Fallback - הצגה ב-alert (לא מומלץ)
            alert('קוד שנוצר:\n\n' + generatedCode.substring(0, 500) + '\n\n... (נראה בקונסולה)');
            console.log('📝 Generated script loading code:', generatedCode);
        }
    }
  ```

- **שורה 297:**
  ```javascript
  alert('✅ הקוד הועתק ללוח בהצלחה!');
  ```
  **הקשר:**
  ```javascript
                      if (typeof showNotification === 'function') {
                        showNotification('✅ הקוד הועתק ללוח בהצלחה!', 'success');
                    } else {
                        alert('✅ הקוד הועתק ללוח בהצלחה!');
                    }
                }).catch(err => {
                    console.error('Clipboard API failed:', err);
  ```

- **שורה 328:**
  ```javascript
  alert('✅ הקוד הועתק ללוח בהצלחה!');
  ```
  **הקשר:**
  ```javascript
              if (typeof showNotification === 'function') {
                showNotification('✅ הקוד הועתק ללוח בהצלחה!', 'success');
            } else {
                alert('✅ הקוד הועתק ללוח בהצלחה!');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
  ```

- **שורה 335:**
  ```javascript
  alert('❌ שגיאה בהעתקה - נא להעתיק ידנית מהקונסולה');
  ```
  **הקשר:**
  ```javascript
              if (typeof showNotification === 'function') {
                showNotification('❌ שגיאה בהעתקה - נא להעתיק ידנית', 'error');
            } else {
                alert('❌ שגיאה בהעתקה - נא להעתיק ידנית מהקונסולה');
            }
            console.log('📝 Code to copy:', text);
        } finally {
  ```

---

### warning-system.js

**סה"כ מופעים:** 4 (alert: 0, confirm: 4)

#### Confirm() Usage:

- **שורה 299:**
  ```javascript
  const confirmed = window.confirm(message);
  ```
  **הקשר:**
  ```javascript
    } catch (error) {
    console.error('❌ showConfirmationDialog - Modal Error:', error);
    // fallback ל-confirm רגיל
    const confirmed = window.confirm(message);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
  ```

- **שורה 331:**
  ```javascript
  * Global confirm replacement - replaces all confirm() calls with custom dialog
  ```
  **הקשר:**
  ```javascript
  // ===== GLOBAL CONFIRM REPLACEMENT =====

/**
 * Global confirm replacement - replaces all confirm() calls with custom dialog
 * This function should be used instead of the native confirm() function
 * 
 * @param {string} message - The confirmation message
  ```

- **שורה 332:**
  ```javascript
  * This function should be used instead of the native confirm() function
  ```
  **הקשר:**
  ```javascript
  
/**
 * Global confirm replacement - replaces all confirm() calls with custom dialog
 * This function should be used instead of the native confirm() function
 * 
 * @param {string} message - The confirmation message
 * @param {function} onConfirm - Callback function when user confirms
  ```

- **שורה 352:**
  ```javascript
  * This replaces the browser's native confirm() with our custom dialog
  ```
  **הקשר:**
  ```javascript
  
/**
 * Override native confirm function globally
 * This replaces the browser's native confirm() with our custom dialog
 * 
 * IMPORTANT: This maintains backward compatibility by handling both sync and async patterns
 */
  ```

---

### trades.js

**סה"כ מופעים:** 4 (alert: 0, confirm: 4)

#### Confirm() Usage:

- **שורה 1488:**
  ```javascript
  confirmed = window.confirm(`האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`);
  ```
  **הקשר:**
  ```javascript
              );
          });
        } else {
          confirmed = window.confirm(`האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`);
        }
        if (!confirmed) {
          return;
  ```

- **שורה 3001:**
  ```javascript
  confirmed = window.confirm('האם למחוק את התנאי הנבחר?');
  ```
  **הקשר:**
  ```javascript
            );
        });
      } else {
        confirmed = window.confirm('האם למחוק את התנאי הנבחר?');
      }
    }
  }
  ```

- **שורה 3751:**
  ```javascript
  const confirmed = window.confirm(message);
  ```
  **הקשר:**
  ```javascript
                'warning'
            );
          } else {
            const confirmed = window.confirm(message);
            resolve(confirmed);
          }
        }
  ```

- **שורה 4234:**
  ```javascript
  confirmed = confirm(confirmMessage);
  ```
  **הקשר:**
  ```javascript
              );
          });
        } else {
          confirmed = confirm(confirmMessage);
        }
      }
      if (confirmed) {
  ```

---

### system-management/sm-detailed-log.js

**סה"כ מופעים:** 3 (alert: 3, confirm: 0)

#### Alert() Usage:

- **שורה 479:**
  ```javascript
  alert('לוג מפורט הועתק ללוח!');
  ```
  **הקשר:**
  ```javascript
                      } else if (typeof window.showNotification === 'function') {
                        window.showNotification('לוג מפורט הועתק ללוח', 'success');
                    } else {
                        alert('לוג מפורט הועתק ללוח!');
                    }
                    
                    console.log('✅ Detailed log copied to clipboard');
  ```

- **שורה 498:**
  ```javascript
  alert('לוג מפורט הועתק ללוח!');
  ```
  **הקשר:**
  ```javascript
              const detailedLog = await generateSystemManagementDetailedLog();
            if (detailedLog) {
                await navigator.clipboard.writeText(detailedLog);
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
  ```

- **שורה 506:**
  ```javascript
  alert('שגיאה בהעתקת הלוג: ' + error.message);
  ```
  **הקשר:**
  ```javascript
          if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}
  ```

---

### system-management/sections/sm-section-alerts.js

**סה"כ מופעים:** 3 (alert: 3, confirm: 0)

#### Alert() Usage:

- **שורה 841:**
  ```javascript
  * Dismiss alert (static method for global access)
  ```
  **הקשר:**
  ```javascript
    }

  /**
   * Dismiss alert (static method for global access)
   * דחיית התראה (מתודה סטטית לגישה גלובלית)
   */
  static async dismissAlert(alertId) {
  ```

- **שורה 896:**
  ```javascript
  alert('פתיחת כל ההתראות');
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification('פתיחת כל ההתראות', 'info');
    } else {
      alert('פתיחת כל ההתראות');
    }
  }

  ```

- **שורה 909:**
  ```javascript
  alert('פתיחת כל היסטוריית ההתראות');
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification('פתיחת כל היסטוריית ההתראות', 'info');
    } else {
      alert('פתיחת כל היסטוריית ההתראות');
    }
  }
}
  ```

---

### system-management/sections/sm-section-background-tasks.js

**סה"כ מופעים:** 3 (alert: 3, confirm: 0)

#### Alert() Usage:

- **שורה 847:**
  ```javascript
  alert('פתיחת לוגי משימות רקע');
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification('פתיחת לוגי משימות רקע', 'info');
    } else {
      alert('פתיחת לוגי משימות רקע');
    }
  }

  ```

- **שורה 954:**
  ```javascript
  alert(`פתיחת פרטי משימה: ${taskId}`);
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification(`פתיחת פרטי משימה: ${taskId}`, 'info');
    } else {
      alert(`פתיחת פרטי משימה: ${taskId}`);
    }
  }

  ```

- **שורה 967:**
  ```javascript
  alert('פתיחת כל היסטוריית המשימות');
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification('פתיחת כל היסטוריית המשימות', 'info');
    } else {
      alert('פתיחת כל היסטוריית המשימות');
    }
  }
}
  ```

---

### tag-management-page.js

**סה"כ מופעים:** 2 (alert: 0, confirm: 2)

#### Confirm() Usage:

- **שורה 599:**
  ```javascript
  confirmed = window.confirm(message);
  ```
  **הקשר:**
  ```javascript
                          );
                    });
                } else {
                    confirmed = window.confirm(message);
                }
            }
            if (confirmed) {
  ```

- **שורה 669:**
  ```javascript
  confirmed = window.confirm(message);
  ```
  **הקשר:**
  ```javascript
                          );
                    });
                } else {
                    confirmed = window.confirm(message);
                }
            }
            if (confirmed) {
  ```

---

### cache-management.js

**סה"כ מופעים:** 2 (alert: 2, confirm: 0)

#### Alert() Usage:

- **שורה 1521:**
  ```javascript
  alert('לוג מפורט הועתק ללוח!');
  ```
  **הקשר:**
  ```javascript
              } else if (window.showInfoNotification) {
                window.showInfoNotification('לוג מפורט הועתק ללוח!', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
  ```

- **שורה 1531:**
  ```javascript
  alert('שגיאה בהעתקת הלוג: ' + error.message);
  ```
  **הקשר:**
  ```javascript
          } else if (window.showInfoNotification) {
            window.showInfoNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}
  ```

---

### ui-utils.js

**סה"כ מופעים:** 2 (alert: 0, confirm: 2)

#### Confirm() Usage:

- **שורה 538:**
  ```javascript
  confirmed = window.confirm(`האם אתה בטוח שברצונך לבטל את ${entityLabel} "${displayName}"?`);
  ```
  **הקשר:**
  ```javascript
          );
      });
    } else {
      confirmed = window.confirm(`האם אתה בטוח שברצונך לבטל את ${entityLabel} "${displayName}"?`);
    }
  }

  ```

- **שורה 851:**
  ```javascript
  confirmed = window.confirm(message);
  ```
  **הקשר:**
  ```javascript
          () => {}
      );
    } else {
      confirmed = window.confirm(message);
      if (confirmed) {
        onConfirm();
      }
  ```

---

### linter-realtime-monitor.js

**סה"כ מופעים:** 2 (alert: 2, confirm: 0)

#### Alert() Usage:

- **שורה 2951:**
  ```javascript
  alert(details);
  ```
  **הקשר:**
  ```javascript
          if (typeof showModalNotification === 'function') {
            showModalNotification('פרטי תיקון', details, 'info');
        } else {
            alert(details);
        }
    }
};
  ```

- **שורה 3127:**
  ```javascript
  alert(details);
  ```
  **הקשר:**
  ```javascript
          if (typeof showModalNotification === 'function') {
            showModalNotification('פרטי פעולה', details, 'info');
    } else {
            alert(details);
        }
    }
};
  ```

---

### db-extradata.js

**סה"כ מופעים:** 2 (alert: 2, confirm: 0)

#### Alert() Usage:

- **שורה 141:**
  ```javascript
  alert('לוג מפורט הועתק ללוח!');
  ```
  **הקשר:**
  ```javascript
              } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
  ```

- **שורה 149:**
  ```javascript
  alert('שגיאה בהעתקת הלוג: ' + error.message);
  ```
  **הקשר:**
  ```javascript
          if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}
  ```

---

### system-management/sections/sm-section-operations.js

**סה"כ מופעים:** 2 (alert: 2, confirm: 0)

#### Alert() Usage:

- **שורה 560:**
  ```javascript
  alert('ייצוא הגדרות שרת');
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification('ייצוא הגדרות שרת', 'info');
    } else {
      alert('ייצוא הגדרות שרת');
    }
  }

  ```

- **שורה 689:**
  ```javascript
  alert('ייצוא נתוני מטמון');
  ```
  **הקשר:**
  ```javascript
      if (window.showInfoNotification) {
      window.showInfoNotification('ייצוא נתוני מטמון', 'info');
    } else {
      alert('ייצוא נתוני מטמון');
    }
  }

  ```

---

### conditions/conditions-ui-manager.js

**סה"כ מופעים:** 2 (alert: 0, confirm: 2)

#### Confirm() Usage:

- **שורה 234:**
  ```javascript
  return window.confirm(fullMessage);
  ```
  **הקשר:**
  ```javascript
              window.showNotification(`${title}: ${message}`, 'warning');
        }

        return window.confirm(fullMessage);
    }

    async openConditionForm(condition = null) {
  ```

- **שורה 1113:**
  ```javascript
  return window.confirm(fullMessage);
  ```
  **הקשר:**
  ```javascript
          }

        if (window.confirm) {
            return window.confirm(fullMessage);
        }

        return true;
  ```

---

### services/crud-response-handler.js

**סה"כ מופעים:** 2 (alert: 2, confirm: 0)

#### Alert() Usage:

- **שורה 613:**
  ```javascript
  alert('פרטי השגיאה הועתקו ללוח');
  ```
  **הקשר:**
  ```javascript
                          } else if (window.showInfoNotification) {
                            window.showInfoNotification('פרטי השגיאה הועתקו ללוח', 'success');
                        } else {
                            alert('פרטי השגיאה הועתקו ללוח');
                        }
                    })
                    .catch(() => {
  ```

- **שורה 622:**
  ```javascript
  alert('שגיאה בהעתקה ללוח');
  ```
  **הקשר:**
  ```javascript
                          } else if (window.showInfoNotification) {
                            window.showInfoNotification('שגיאה בהעתקה ללוח', 'error');
                        } else {
                            alert('שגיאה בהעתקה ללוח');
                        }
                    });
            }
  ```

---

### notes.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 554:**
  ```javascript
  confirmed = confirm('האם אתה בטוח שברצונך למחוק את ההערה?');
  ```
  **הקשר:**
  ```javascript
              );
          });
        } else {
          confirmed = confirm('האם אתה בטוח שברצונך למחוק את ההערה?');
        }
      }
      if (!confirmed) {
  ```

---

### user-profile-ai-analysis.js

**סה"כ מופעים:** 1 (alert: 1, confirm: 0)

#### Alert() Usage:

- **שורה 475:**
  ```javascript
  alert(helpText);
  ```
  **הקשר:**
  ```javascript
          if (window.showInfoNotification) {
          window.showInfoNotification(helpText, 'info');
        } else {
          alert(helpText);
        }
      }
    },
  ```

---

### ai-analysis-manager.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 3707:**
  ```javascript
  resolve(confirm('האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.'));
  ```
  **הקשר:**
  ```javascript
                    'danger'
                );
              } else {
                resolve(confirm('האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.'));
              }
            }
          });
  ```

---

### validation-utils.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 755:**
  ```javascript
  resolve(window.confirm(`${title}\n\n${message}`));
  ```
  **הקשר:**
  ```javascript
            'info'
        );
      } else {
        resolve(window.confirm(`${title}\n\n${message}`));
      }
    }
  });
  ```

---

### executions.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 4892:**
  ```javascript
  if (!confirm('האם אתה בטוח שברצונך למחוק את הביצוע?')) {
  ```
  **הקשר:**
  ```javascript
              );
        } else {
            // Fallback to simple confirm
            if (!confirm('האם אתה בטוח שברצונך למחוק את הביצוע?')) {
                return;
            }
            await performExecutionDeletion(executionId);
  ```

---

### ticker-dashboard.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 220:**
  ```javascript
  const confirmed = confirm(message);
  ```
  **הקשר:**
  ```javascript
                  );
            } else {
                // Fallback to browser confirm
                const confirmed = confirm(message);
                resolve(confirmed);
            }
        });
  ```

---

### constraints.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 854:**
  ```javascript
  confirmed = confirm(confirmMessage);
  ```
  **הקשר:**
  ```javascript
        });
    } else {
      // Fallback למקרה שמערכת התראות לא זמינה
      confirmed = confirm(confirmMessage);
    }
    
    if (confirmed) {
  ```

---

### init-system-management.js

**סה"כ מופעים:** 1 (alert: 1, confirm: 0)

#### Alert() Usage:

- **שורה 1490:**
  ```javascript
  alert('קוד שנוצר:\n\n' + code.substring(0, 500) + '\n\n... (נראה בקונסולה)');
  ```
  **הקשר:**
  ```javascript
          window.lastGeneratedCode = code;
    } else {
        // Fallback - show in alert
        alert('קוד שנוצר:\n\n' + code.substring(0, 500) + '\n\n... (נראה בקונסולה)');
        Logger.info('📝 Generated script loading code:', code);
    }
}
  ```

---

### data_import.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 1448:**
  ```javascript
  if (window.confirm(confirmationMessage)) {
  ```
  **הקשר:**
  ```javascript
              
            const confirmationMessage = `האם אתה בטוח שברצונך למחוק את סשן הייבוא #${sessionId}?\n\nפעולה זו תמחק את הסשן לצמיתות.`;
            
            if (window.confirm(confirmationMessage)) {
                try {
                    const response = await fetch(`/api/user-data-import/session/${sessionId}`, {
                        method: 'DELETE',
  ```

---

### import-user-data.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 8382:**
  ```javascript
  } else if (window.confirm(confirmationMessage)) {
  ```
  **הקשר:**
  ```javascript
              null,
            'warning'
        );
    } else if (window.confirm(confirmationMessage)) {
        handleSessionReset(currentSessionId);
    }
}
  ```

---

### trade-history-page.js

**סה"כ מופעים:** 1 (alert: 1, confirm: 0)

#### Alert() Usage:

- **שורה 513:**
  ```javascript
  alert(`פרטי טרייד #${tradeId}\n\nטיקר: ${trade.ticker}\nצד: ${trade.side}\nסוג: ${getInvestmentTypeText(trade.investment_type)}\nתאריך יצירה: ${formatDate(trade.created_at)}\nתאריך סגירה: ${formatDate(trade.closed_at)}\nP/L: $${trade.pl} (${trade.pl >= 0 ? '+' : ''}${trade.pl_percent}%)`);
  ```
  **הקשר:**
  ```javascript
              // Fallback למקרה שהמערכת לא זמינה (מוקאפ)
            const trade = allTrades.find(t => t.id === tradeId);
            if (!trade) return;
            alert(`פרטי טרייד #${tradeId}\n\nטיקר: ${trade.ticker}\nצד: ${trade.side}\nסוג: ${getInvestmentTypeText(trade.investment_type)}\nתאריך יצירה: ${formatDate(trade.created_at)}\nתאריך סגירה: ${formatDate(trade.closed_at)}\nP/L: $${trade.pl} (${trade.pl >= 0 ? '+' : ''}${trade.pl_percent}%)`);
        }
    }

  ```

---

### portfolio-state-page.js

**סה"כ מופעים:** 1 (alert: 1, confirm: 0)

#### Alert() Usage:

- **שורה 2962:**
  ```javascript
  alert('נא לבחור שני תאריכים להשוואה');
  ```
  **הקשר:**
  ```javascript
      }
    
    if (!date1 || !date2) {
        alert('נא לבחור שני תאריכים להשוואה');
        return;
    }
    
  ```

---

### unified-cache-manager.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 2423:**
  ```javascript
  if (confirm('המטמון נוקה בהצלחה. האם להמשיך לטעינה מחדש של העמוד?')) {
  ```
  **הקשר:**
  ```javascript
                          );
                    } else {
                        // Fallback to simple confirm
                        if (confirm('המטמון נוקה בהצלחה. האם להמשיך לטעינה מחדש של העמוד?')) {
                            console.log('✅ User confirmed page reload - executing now...');
                            if (typeof window.hardReload === 'function') {
                                window.hardReload();
  ```

---

### alert-service.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 448:**
  ```javascript
  if (!confirm('האם אתה בטוח שברצונך למחוק את ההתראה?')) {
  ```
  **הקשר:**
  ```javascript
        );
    } else {
      // Fallback to simple confirm
      if (!confirm('האם אתה בטוח שברצונך למחוק את ההתראה?')) {
        return;
      }
      await performAlertDeletion(alertId);
  ```

---

### system-management/sections/sm-section-database.js

**סה"כ מופעים:** 1 (alert: 1, confirm: 0)

#### Alert() Usage:

- **שורה 821:**
  ```javascript
  alert(`רשימת גיבויים:\n${backupsList}`);
  ```
  **הקשר:**
  ```javascript
          if (window.showInfoNotification) {
          window.showInfoNotification(`רשימת גיבויים:\n${backupsList}`, 'info');
        } else {
          alert(`רשימת גיבויים:\n${backupsList}`);
        }
      } else {
        throw new Error(result.message || 'Failed to list backups');
  ```

---

### system-management/sections/sm-section-cache.js

**סה"כ מופעים:** 1 (alert: 1, confirm: 0)

#### Alert() Usage:

- **שורה 803:**
  ```javascript
  alert(`פרטי מטמון:\n${JSON.stringify(sectionInstance.lastData, null, 2)}`);
  ```
  **הקשר:**
  ```javascript
          if (window.showInfoNotification) {
          window.showInfoNotification(`פרטי מטמון:\n${JSON.stringify(sectionInstance.lastData, null, 2)}`, 'info');
        } else {
          alert(`פרטי מטמון:\n${JSON.stringify(sectionInstance.lastData, null, 2)}`);
        }
      }
    }
  ```

---

### conditions/conditions-crud-manager.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 455:**
  ```javascript
  return window.confirm(this.translator.getMessage('confirm_delete'));
  ```
  **הקשר:**
  ```javascript
              return window.showConfirmDialog(this.translator.getMessage('confirm_delete'));
        }
        if (window.confirm && typeof window.confirm === 'function') {
            return window.confirm(this.translator.getMessage('confirm_delete'));
        }
        return true;
    }
  ```

---

### services/unified-crud-service.js

**סה"כ מופעים:** 1 (alert: 0, confirm: 1)

#### Confirm() Usage:

- **שורה 695:**
  ```javascript
  confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את ${entityName} #${entityId}?`);
  ```
  **הקשר:**
  ```javascript
                  } else {
                    // Fallback to simple confirm
                    const entityName = options.entityName || entityType;
                    confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את ${entityName} #${entityId}?`);
                }
                
                if (!confirmed) {
  ```

---

