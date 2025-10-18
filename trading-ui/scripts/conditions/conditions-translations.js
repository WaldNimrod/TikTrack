/**
 * Conditions System Translations
 * Hebrew translations for the conditions system
 * Integrates with the central translation system
 */

// Add conditions system translations to the global translation dictionary
if (typeof window.translations === 'undefined') {
    window.translations = {};
}

// Extend the translations object with conditions system translations
Object.assign(window.translations, {
    // General
    'conditions.select_method': 'בחר שיטה',
    'conditions.add_condition': 'הוסף תנאי',
    'conditions.edit_condition': 'ערוך תנאי',
    'conditions.delete_condition': 'מחק תנאי',
    'conditions.save_condition': 'שמור תנאי',
    'conditions.cancel': 'ביטול',
    'conditions.loading': 'טוען...',
    'conditions.error': 'שגיאה',
    'conditions.success': 'הצלחה',
    'conditions.warning': 'אזהרה',
    'conditions.info': 'מידע',
    
    // Method Categories
    'conditions.category.technical_indicators': 'אינדיקטורים טכניים',
    'conditions.category.price_patterns': 'מבני מחיר',
    'conditions.category.support_resistance': 'תמיכה והתנגדות',
    'conditions.category.trend_analysis': 'ניתוח מגמה',
    'conditions.category.volume_analysis': 'ניתוח נפח',
    'conditions.category.fibonacci': 'פיבונאצ\'י',
    
    // Trading Methods
    'conditions.method.moving_averages': 'ממוצעים נעים',
    'conditions.method.volume_analysis': 'ניתוח נפח',
    'conditions.method.support_resistance': 'תמיכה והתנגדות',
    'conditions.method.trend_lines': 'קווי מגמה',
    'conditions.method.technical_patterns': 'מבנים טכניים',
    'conditions.method.fibonacci_golden_zone': 'פיבונאצ\'י ואזור הזהב',
    
    // Method Descriptions
    'conditions.method.moving_averages.description': 'ניתוח מגמה באמצעות ממוצעים נעים',
    'conditions.method.volume_analysis.description': 'ניתוח נפח המסחר לקבלת תובנות',
    'conditions.method.support_resistance.description': 'זיהוי רמות תמיכה והתנגדות',
    'conditions.method.trend_lines.description': 'ציור וניתוח קווי מגמה',
    'conditions.method.technical_patterns.description': 'זיהוי מבנים טכניים בגרף',
    'conditions.method.fibonacci_golden_zone.description': 'ניתוח רמות פיבונאצ\'י ואזור הזהב',
    
    // Parameter Types
    'conditions.parameter.type.number': 'מספר',
    'conditions.parameter.type.price': 'מחיר',
    'conditions.parameter.type.percentage': 'אחוז',
    'conditions.parameter.type.period': 'תקופה',
    'conditions.parameter.type.boolean': 'כן/לא',
    'conditions.parameter.type.dropdown': 'רשימה',
    'conditions.parameter.type.date': 'תאריך',
    
    // Moving Averages Parameters
    'conditions.ma.period': 'תקופה',
    'conditions.ma.type': 'סוג ממוצע',
    'conditions.ma.type.sma': 'ממוצע פשוט (SMA)',
    'conditions.ma.type.ema': 'ממוצע אקספוננציאלי (EMA)',
    'conditions.ma.type.wma': 'ממוצע משוקלל (WMA)',
    'conditions.ma.operator.cross_above': 'חצייה מעלה',
    'conditions.ma.operator.cross_below': 'חצייה מטה',
    'conditions.ma.operator.above': 'מעל',
    'conditions.ma.operator.below': 'מתחת',
    
    // Volume Analysis Parameters
    'conditions.volume.threshold': 'סף נפח',
    'conditions.volume.comparison_period': 'תקופת השוואה',
    'conditions.volume.operator.above_average': 'מעל ממוצע',
    'conditions.volume.operator.below_average': 'מתחת לממוצע',
    'conditions.volume.operator.spike': 'קפיצה (פי 2+)',
    
    // Support & Resistance Parameters
    'conditions.sr.level_price': 'מחיר רמה',
    'conditions.sr.tolerance_percentage': 'אחוז סובלנות',
    'conditions.sr.operator.break_above': 'שבירה מעלה',
    'conditions.sr.operator.break_below': 'שבירה מטה',
    'conditions.sr.operator.touch': 'מגע ברמה',
    'conditions.sr.operator.bounce_from': 'ריבאונד מהרמה',
    
    // Trend Lines Parameters
    'conditions.trend.start_price': 'מחיר התחלה',
    'conditions.trend.end_price': 'מחיר סיום',
    'conditions.trend.start_date': 'תאריך התחלה',
    'conditions.trend.end_date': 'תאריך סיום',
    'conditions.trend.tolerance_percentage': 'אחוז סובלנות',
    'conditions.trend.operator.break_above_trendline': 'שבירת קו מגמה מעלה',
    'conditions.trend.operator.break_below_trendline': 'שבירת קו מגמה מטה',
    'conditions.trend.operator.touch_trendline': 'מגע בקו מגמה',
    
    // Technical Patterns Parameters
    'conditions.pattern.pattern_type': 'סוג מבנה',
    'conditions.pattern.timeframe': 'מסגרת זמן',
    'conditions.pattern.type.cup_and_handle': 'ספל וידית',
    'conditions.pattern.type.head_and_shoulders': 'ראש וכתפיים (bearish)',
    'conditions.pattern.type.inverse_head_and_shoulders': 'ראש וכתפיים הפוך (bullish)',
    'conditions.pattern.type.double_top': 'צמרת כפולה (bearish)',
    'conditions.pattern.type.double_bottom': 'תחתית כפולה (bullish)',
    'conditions.pattern.type.triangle': 'משולש',
    'conditions.pattern.type.flag': 'דגל',
    'conditions.pattern.operator.identify': 'זיהוי מבנה',
    'conditions.pattern.operator.complete': 'השלמת מבנה',
    'conditions.pattern.operator.break': 'שבירת מבנה',
    
    // Fibonacci Parameters
    'conditions.fib.swing_high': 'גבוה של תנודה',
    'conditions.fib.swing_low': 'נמוך של תנודה',
    'conditions.fib.retracement_levels': 'רמות רטרייסמנט',
    'conditions.fib.level.23.6': '23.6%',
    'conditions.fib.level.38.2': '38.2%',
    'conditions.fib.level.50.0': '50.0%',
    'conditions.fib.level.61.8': '61.8%',
    'conditions.fib.level.78.6': '78.6%',
    'conditions.fib.operator.in_golden_zone': 'באזור הזהב',
    'conditions.fib.operator.at_fib_level': 'ברמת פיבונאצ\'י',
    'conditions.fib.operator.bounce_from_fib': 'ריבאונד מפיבונאצ\'י',
    
    // Logical Operators
    'conditions.logical.and': 'וגם',
    'conditions.logical.or': 'או',
    'conditions.logical.none': 'ללא',
    
    // Condition Groups
    'conditions.group.add': 'הוסף קבוצה',
    'conditions.group.remove': 'הסר קבוצה',
    'conditions.group.operator': 'אופרטור לוגי',
    
    // Validation Messages
    'conditions.validation.method_required': 'יש לבחור שיטה',
    'conditions.validation.parameters_required': 'יש למלא פרמטרים',
    'conditions.validation.invalid_json': 'פורמט JSON לא תקין',
    'conditions.validation.entity_required': 'יש לבחור ישות',
    'conditions.validation.field_required': 'שדה זה נדרש',
    'conditions.validation.invalid_value': 'ערך לא תקין',
    'conditions.validation.min_value': 'ערך מינימלי: {min}',
    'conditions.validation.max_value': 'ערך מקסימלי: {max}',
    'conditions.validation.client_errors': 'יש לתקן שגיאות לפני השמירה',
    'conditions.validation.server_error': 'שגיאת שרת',
    
    // Alert Integration
    'conditions.alert.create_from_condition': 'צור התראה מתנאי',
    'conditions.alert.auto_create': 'יצירה אוטומטית',
    'conditions.alert.manual_create': 'יצירה ידנית',
    'conditions.alert.condition_linked': 'תנאי מקושר',
    'conditions.alert.condition_not_linked': 'תנאי לא מקושר',
    
    // Status Messages
    'conditions.status.active': 'פעיל',
    'conditions.status.inactive': 'לא פעיל',
    'conditions.status.pending': 'ממתין',
    'conditions.status.triggered': 'הופעל',
    'conditions.status.expired': 'פג תוקף',
    
    // Action Buttons
    'conditions.actions.add_method': 'הוסף שיטה',
    'conditions.actions.remove_method': 'הסר שיטה',
    'conditions.actions.test_condition': 'בדוק תנאי',
    'conditions.actions.copy_condition': 'העתק תנאי',
    'conditions.actions.export_condition': 'ייצא תנאי',
    'conditions.actions.import_condition': 'ייבא תנאי',
    
    // Help Text
    'conditions.help.method_selection': 'בחר שיטת מסחר מהרשימה',
    'conditions.help.parameter_setup': 'הגדר פרמטרים עבור השיטה שנבחרה',
    'conditions.help.logical_operators': 'השתמש באופרטורים לוגיים לשילוב תנאים',
    'conditions.help.condition_groups': 'צור קבוצות תנאים לארגון טוב יותר',
    'conditions.help.alert_creation': 'צור התראות אוטומטיות מתנאים',
    
    // Error Messages
    'conditions.error.load_methods': 'שגיאה בטעינת שיטות',
    'conditions.error.load_parameters': 'שגיאה בטעינת פרמטרים',
    'conditions.error.save_condition': 'שגיאה בשמירת תנאי',
    'conditions.error.delete_condition': 'שגיאה במחיקת תנאי',
    'conditions.error.test_condition': 'שגיאה בבדיקת תנאי',
    'conditions.error.create_alert': 'שגיאה ביצירת התראה',
    
    // Success Messages
    'conditions.success.condition_saved': 'תנאי נשמר בהצלחה',
    'conditions.success.condition_deleted': 'תנאי נמחק בהצלחה',
    'conditions.success.alert_created': 'התראה נוצרה בהצלחה',
    'conditions.success.condition_tested': 'תנאי נבדק בהצלחה',
    
    // Tooltips
    'conditions.tooltip.method_info': 'מידע על השיטה',
    'conditions.tooltip.parameter_help': 'עזרה בפרמטר',
    'conditions.tooltip.logical_operator': 'אופרטור לוגי',
    'conditions.tooltip.condition_status': 'סטטוס התנאי',
    'conditions.tooltip.alert_status': 'סטטוס ההתראה'
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.translations;
}