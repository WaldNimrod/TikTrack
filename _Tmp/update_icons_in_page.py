#!/usr/bin/env python3
"""
Helper script to understand the mapping between buttons and icons
This creates a mapping reference for updating the HTML page
"""

# Mapping of button selectors/attributes to icon files
ICON_MAPPING = {
    # Unit Size Buttons (1-6)
    'unit-size-btn[data-unit="5min"]': 'chart-unit-5m.svg',
    'unit-size-btn[data-unit="hour"]': 'chart-unit-1h.svg',
    'unit-size-btn[data-unit="day"]': 'chart-unit-1d.svg',
    'unit-size-btn[data-unit="week"]': 'chart-unit-1w.svg',
    'unit-size-btn[data-unit="month"]': 'chart-unit-1m.svg',
    'unit-size-btn[data-unit="year"]': 'chart-unit-1y.svg',
    
    # Time Range Buttons (7-11)
    'chart-control-btn[data-range="day"]': 'chart-range-day.svg',
    'chart-control-btn[data-range="week"]': 'chart-range-week.svg',
    'chart-control-btn[data-range="month"]': 'chart-range-month.svg',
    'chart-control-btn[data-range="year"]': 'chart-range-year.svg',
    'chart-control-btn[data-range="all"]': 'chart-range-all.svg',
    
    # Chart Type Buttons (12-14)
    'chart-type-btn[data-type="line"]': 'chart-type-line.svg',
    'chart-type-btn[data-type="bar"]': 'chart-type-bar.svg',
    'chart-type-btn[data-type="candlestick"]': 'chart-type-candlestick.svg',
    
    # View Mode Buttons (15-16)
    'view-mode-btn[data-mode="price"]': 'chart-view-price.svg',
    'view-mode-btn[data-mode="percent"]': 'chart-view-percent.svg',
    
    # Y-Axis Scale Buttons (17-18)
    'y-scale-btn[data-scale="linear"]': 'chart-scale-linear.svg',
    'y-scale-btn[data-scale="log"]': 'chart-scale-log.svg',
    
    # Volume Toggle (19)
    'volume-toggle-btn': 'chart-volume-toggle.svg',
    
    # Auto Scale (20)
    'auto-scale-btn': 'chart-auto-scale.svg',
    
    # Zoom Buttons (21-23)
    'zoom-btn[data-action="zoom-in"]': 'chart-zoom-in.svg',
    'zoom-btn[data-action="zoom-out"]': 'chart-zoom-out.svg',
    'zoom-btn[data-action="reset"]': 'chart-zoom-reset.svg',
    
    # Indicators (24)
    'indicators-toggle-btn': 'chart-indicators.svg',
    
    # Series Visibility (25)
    'series-visibility-toggle-btn': 'chart-series-toggle.svg',
    
    # Export Buttons (26-27)
    'export-btn[data-action="screenshot"]': 'chart-screenshot.svg',
    'export-btn[data-action="export-image"]': 'chart-export-image.svg',
    
    # Drawing Tools Toggle (28)
    'drawing-tools-toggle-btn': 'chart-drawing-tools.svg',
    
    # Drawing Tool Buttons (29-40)
    'drawing-tool-btn[data-tool="line"]': 'chart-line.svg',
    'drawing-tool-btn[data-tool="horizontal-line"]': 'chart-line-horizontal.svg',
    'drawing-tool-btn[data-tool="vertical-line"]': 'chart-line-vertical.svg',
    'drawing-tool-btn[data-tool="arrow"]': 'chart-arrow.svg',
    'drawing-tool-btn[data-tool="rectangle"]': 'chart-rectangle.svg',
    'drawing-tool-btn[data-tool="text"]': 'chart-text.svg',
    'drawing-tool-btn[data-tool="measure"]': 'chart-measure.svg',
    'drawing-tool-btn[data-tool="fibonacci"]': 'chart-fibonacci.svg',
    'drawing-tool-btn[data-tool="trend-line"]': 'chart-trend-line.svg',
    'drawing-tool-btn[data-tool="support-resistance"]': 'chart-support-resistance.svg',
    'drawing-tool-btn[data-tool="marker"]': 'chart-marker.svg',
    'drawing-tool-btn[data-tool="clear"]': 'chart-clear-all.svg',
}

print("Icon mapping created for reference")
print(f"Total mappings: {len(ICON_MAPPING)}")

