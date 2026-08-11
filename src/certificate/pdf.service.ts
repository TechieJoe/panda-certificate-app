import * as puppeteer from 'puppeteer';

export async function generate(
  html: string,
  certificateName?: string,
): Promise<Buffer> {  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);

    await page.setViewport({
      width: 1200,
      height: 1800,
      deviceScaleFactor: 2,
    });

await page.setContent(html, {
  waitUntil: 'domcontentloaded',
});

console.log('HTML loaded');

await page.waitForSelector('#certificate');

console.log('Certificate found');

const images = await page.evaluate(() => {
  return Array.from(document.images).map(img => ({
    id: img.id,
    src: img.src,
    complete: img.complete,
    width: img.naturalWidth,
    height: img.naturalHeight,
  }));
});

console.log(
  JSON.stringify(images, null, 2)
);

console.log(
  'Contains Base64:',
  html.includes('data:image/')
);

await new Promise(resolve =>
  setTimeout(resolve, 3000)
);


    //console.log('IMAGE INFO:', imageInfo);
    

    // =====================================
    // Detect Drill Pipe certificate
    // =====================================
    const isDrillPipe = html.includes(
      'DRILL PIPE INSPECTION REPORT',
    );

  certificateName === 'drill-pipe';

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,

      margin: isDrillPipe
        ? {
            top: '5mm',
            right: '0mm',
            bottom: '5mm',
            left: '0mm',
          }
        : {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
          },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}