#!/usr/bin/env python3
"""
סקריפט לתיקון שמות ב-trading_accounts.js
מעדכן את כל השמות הישנים לשמות החדשים עם trading_accounts
"""

import re
import os

def fix_trading_accounts_naming():
    file_path = 'trading-ui/scripts/trading_accounts.js'
    
    if not os.path.exists(file_path):
        print(f"❌ קובץ לא נמצא: {file_path}")
        return
    
    # קריאת הקובץ
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = 0
    
    print("🔧 מתחיל תיקון שמות ב-trading_accounts.js...")
    
    # רשימת החלפות - כל החלפה כוללת את הביטוי הישן והחדש
    replacements = [
        # accountId -> tradingAccountId
        (r'\baccountId\b', 'tradingAccountId'),
        
        # accountData -> tradingAccountData (בפרמטרים של פונקציות)
        (r'\baccountData\b', 'tradingAccountData'),
        
        # account -> tradingAccount (בפרמטרים של פונקציות, לא בתוכן של מחרוזות)
        (r'\baccount\b(?=\s*[=,\)])', 'tradingAccount'),
        
        # accountName -> tradingAccountName (בפרמטרים)
        (r'\baccountName\b(?=\s*[,\)])', 'tradingAccountName'),
        
        # accountType -> tradingAccountType (בפרמטרים)
        (r'\baccountType\b(?=\s*[,\)])', 'tradingAccountType'),
        
        # accountStatus -> tradingAccountStatus (בפרמטרים)
        (r'\baccountStatus\b(?=\s*[,\)])', 'tradingAccountStatus'),
        
        # accountCurrency -> tradingAccountCurrency (בפרמטרים)
        (r'\baccountCurrency\b(?=\s*[,\)])', 'tradingAccountCurrency'),
        
        # accountCashBalance -> tradingAccountCashBalance (בפרמטרים)
        (r'\baccountCashBalance\b(?=\s*[,\)])', 'tradingAccountCashBalance'),
        
        # accountNotes -> tradingAccountNotes (בפרמטרים)
        (r'\baccountNotes\b(?=\s*[,\)])', 'tradingAccountNotes'),
        
        # accountDescription -> tradingAccountDescription (בפרמטרים)
        (r'\baccountDescription\b(?=\s*[,\)])', 'tradingAccountDescription'),
        
        # accountForm -> tradingAccountForm (בפרמטרים)
        (r'\baccountForm\b(?=\s*[,\)])', 'tradingAccountForm'),
        
        # accountModal -> tradingAccountModal (בפרמטרים)
        (r'\baccountModal\b(?=\s*[,\)])', 'tradingAccountModal'),
        
        # accountFilter -> tradingAccountFilter (בפרמטרים)
        (r'\baccountFilter\b(?=\s*[,\)])', 'tradingAccountFilter'),
        
        # accounts -> tradingAccounts (בשמות משתנים, לא בתוכן מחרוזות)
        (r'\baccounts\b(?=\s*[=,\)])', 'tradingAccounts'),
        
        # Account -> TradingAccount (בשמות פונקציות ומחלקות)
        (r'\bAccount\b(?=\s*[\(,\)])', 'TradingAccount'),
        
        # allAccounts -> allTradingAccounts
        (r'\ballAccounts\b', 'allTradingAccounts'),
        
        # openAccounts -> openTradingAccounts
        (r'\bopenAccounts\b', 'openTradingAccounts'),
        
        # selectedAccounts -> selectedTradingAccounts
        (r'\bselectedAccounts\b', 'selectedTradingAccounts'),
        
        # accountMenu -> tradingAccountMenu
        (r'\baccountMenu\b', 'tradingAccountMenu'),
        
        # accountToggle -> tradingAccountToggle
        (r'\baccountToggle\b', 'tradingAccountToggle'),
        
        # accountItem -> tradingAccountItem
        (r'\baccountItem\b', 'tradingAccountItem'),
        
        # allAccountsItem -> allTradingAccountsItem
        (r'\ballAccountsItem\b', 'allTradingAccountsItem'),
        
        # updateAccountFilterMenu -> updateTradingAccountFilterMenu
        (r'\bupdateAccountFilterMenu\b', 'updateTradingAccountFilterMenu'),
        
        # checkLinkedItemsBeforeDelete -> checkLinkedItemsBeforeDeleteTradingAccount
        (r'\bcheckLinkedItemsBeforeDelete\b(?=\s*[\(,\)])', 'checkLinkedItemsBeforeDeleteTradingAccount'),
        
        # checkLinkedItemsBeforeCancel -> checkLinkedItemsBeforeCancelTradingAccount
        (r'\bcheckLinkedItemsBeforeCancel\b(?=\s*[\(,\)])', 'checkLinkedItemsBeforeCancelTradingAccount'),
        
        # showDeleteWarning('account' -> showDeleteWarning('tradingAccount'
        (r"showDeleteWarning\('account'", "showDeleteWarning('tradingAccount'"),
        
        # showLinkedItemsModal(linkedItemsData, 'account' -> showLinkedItemsModal(linkedItemsData, 'tradingAccount'
        (r"showLinkedItemsModal\([^,]*,\s*'account'", "showLinkedItemsModal(linkedItemsData, 'tradingAccount'"),
        
        # showLinkedItemsWarning('account' -> showLinkedItemsWarning('tradingAccount'
        (r"showLinkedItemsWarning\('account'", "showLinkedItemsWarning('tradingAccount'"),
        
        # entity-trading-account-badge -> entity-trading-account-badge (already correct)
        
        # tradingAccountFilterMenu -> tradingAccountFilterMenu (already correct)
        
        # tradingAccountFilterToggle -> tradingAccountFilterToggle (already correct)
        
        # selected-trading-account-text -> selected-trading-account-text (already correct)
        
        # trading-account-filter-item -> trading-account-filter-item (already correct)
        
        # פונקציה לקבלת חשבונות -> פונקציה לקבלת חשבונות מסחר
        (r'פונקציה לקבלת חשבונות נטענים', 'פונקציה לקבלת חשבונות מסחר נטענים'),
        
        # פונקציה לבדיקה אם החשבונות -> פונקציה לבדיקה אם חשבונות המסחר
        (r'פונקציה לבדיקה אם החשבונות נטענו', 'פונקציה לבדיקה אם חשבונות המסחר נטענו'),
        
        # בדיקת תקינות נתוני החשבון -> בדיקת תקינות נתוני החשבון המסחר
        (r'בדיקת תקינות נתוני החשבון', 'בדיקת תקינות נתוני החשבון המסחר'),
        
        # פונקציה לשמירת חשבון -> פונקציה לשמירת חשבון מסחר
        (r'פונקציה לשמירת חשבון', 'פונקציה לשמירת חשבון מסחר'),
        
        # עדכון חשבון ב-API -> עדכון חשבון מסחר ב-API
        (r'עדכון חשבון ב-API', 'עדכון חשבון מסחר ב-API'),
        
        # הצגת מודל עריכת חשבון -> הצגת מודל עריכת חשבון מסחר
        (r'הצגת מודל עריכת חשבון לפי ID', 'הצגת מודל עריכת חשבון מסחר לפי ID'),
        
        # מחיקת חשבון מהשרת -> מחיקת חשבון מסחר מהשרת
        (r'מחיקת חשבון מהשרת', 'מחיקת חשבון מסחר מהשרת'),
        
        # ביטול חשבון -> ביטול חשבון מסחר
        (r'ביטול חשבון \(שינוי סטטוס למבוטל\)', 'ביטול חשבון מסחר (שינוי סטטוס למבוטל)'),
        
        # מחיקת חשבון -> מחיקת חשבון מסחר
        (r'מחיקת חשבון$', 'מחיקת חשבון מסחר'),
        
        # ביטול חשבון עם בדיקת פריטים -> ביטול חשבון מסחר עם בדיקת פריטים
        (r'ביטול חשבון עם בדיקת פריטים מקושרים', 'ביטול חשבון מסחר עם בדיקת פריטים מקושרים'),
        
        # מחיקת חשבון עם בדיקת פריטים -> מחיקת חשבון מסחר עם בדיקת פריטים
        (r'מחיקת חשבון עם בדיקת פריטים מקושרים', 'מחיקת חשבון מסחר עם בדיקת פריטים מקושרים'),
        
        # החזרת חשבון מבוטל -> החזרת חשבון מסחר מבוטל
        (r'החזרת חשבון מבוטל לסטטוס סגור', 'החזרת חשבון מסחר מבוטל לסטטוס סגור'),
        
        # בדיקת מקושרים וביצוע ביטול חשבון -> בדיקת מקושרים וביצוע ביטול חשבון מסחר
        (r'בדיקת מקושרים וביצוע ביטול חשבון', 'בדיקת מקושרים וביצוע ביטול חשבון מסחר'),
        
        # ביצוע הביטול בפועל -> ביצוע הביטול בפועל (כבר נכון)
        
        # בדיקת מקושרים וביצוע מחיקת חשבון -> בדיקת מקושרים וביצוע מחיקת חשבון מסחר
        (r'בדיקת מקושרים וביצוע מחיקת חשבון', 'בדיקת מקושרים וביצוע מחיקת חשבון מסחר'),
        
        # ביצוע המחיקה בפועל -> ביצוע המחיקה בפועל (כבר נכון)
        
        # בדיקת פריטים מקושרים לפני מחיקת חשבון -> בדיקת פריטים מקושרים לפני מחיקת חשבון מסחר
        (r'בדיקת פריטים מקושרים לפני מחיקת חשבון', 'בדיקת פריטים מקושרים לפני מחיקת חשבון מסחר'),
    ]
    
    # ביצוע החלפות
    for old_pattern, new_pattern in replacements:
        old_content = content
        content = re.sub(old_pattern, new_pattern, content)
        if content != old_content:
            matches = len(re.findall(old_pattern, old_content))
            changes_made += matches
            print(f"✅ החלפה: {old_pattern} -> {new_pattern} ({matches} מקומות)")
    
    # בדיקת שינויים
    if content != original_content:
        # שמירת הקובץ המעודכן
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"🎉 הושלם בהצלחה! {changes_made} החלפות בוצעו")
    else:
        print("ℹ️ לא נמצאו שינויים נדרשים")
    
    return changes_made

if __name__ == "__main__":
    changes = fix_trading_accounts_naming()
    print(f"\n📊 סיכום: {changes} החלפות בוצעו בסך הכל")
