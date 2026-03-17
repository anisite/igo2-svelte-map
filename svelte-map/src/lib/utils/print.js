/**
 * Map printing utility.
 */
export function printMap(mapElement) {
  const canvas = mapElement.querySelector('canvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Impression de la carte</title></head>
    <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
      <img src="${dataUrl}" style="max-width:100%;max-height:100vh;" onload="window.print();"/>
    </body>
    </html>
  `);
  win.document.close();
}

/**
 * Export map as PNG image.
 */
export function exportMapAsPng(mapElement, filename = 'carte.png') {
  const canvas = mapElement.querySelector('canvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
