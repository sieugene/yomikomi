const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Размеры иконок для PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Цвета для создания базовой иконки (если исходная отсутствует)
const DEFAULT_ICON_CONFIG = {
  background: "#000000",
  foreground: "#ffffff",
  text: "Y", // Первая буква приложения
};

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), "public", "icons");
  const sourceIcon = path.join(process.cwd(), "public", "icon-source.png");

  // Создаем директорию для иконок если её нет
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  let baseIcon;

  // Проверяем наличие исходной иконки
  if (fs.existsSync(sourceIcon)) {
    console.log("📁 Используем исходную иконку:", sourceIcon);
    baseIcon = sharp(sourceIcon);
  } else {
    console.log("🎨 Создаем базовую иконку...");

    // Создаем SVG для базовой иконки
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="${DEFAULT_ICON_CONFIG.background}" rx="64"/>
        <text x="50%" y="50%" 
              font-family="Arial, sans-serif" 
              font-size="300" 
              font-weight="bold" 
              fill="${DEFAULT_ICON_CONFIG.foreground}" 
              text-anchor="middle" 
              dominant-baseline="central">
          ${DEFAULT_ICON_CONFIG.text}
        </text>
      </svg>
    `;

    baseIcon = sharp(Buffer.from(svg));
  }

  console.log("🔧 Генерируем иконки размеров:", ICON_SIZES.join(", "));

  // Генерируем иконки всех размеров
  const promises = ICON_SIZES.map(async (size) => {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);

    try {
      await baseIcon
        .clone()
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          quality: 90,
          compressionLevel: 9,
        })
        .toFile(filepath);

      console.log(`✅ Создана иконка: ${filename}`);
    } catch (error) {
      console.error(`❌ Ошибка создания ${filename}:`, error.message);
    }
  });

  await Promise.all(promises);

  // Создаем дополнительные файлы
  await generateAppleTouchIcon(baseIcon, iconsDir);
  await generateFavicon(baseIcon);
  await generateMaskableIcon(baseIcon, iconsDir);

  console.log("🎉 Все иконки созданы успешно!");
}

async function generateAppleTouchIcon(baseIcon, iconsDir) {
  const appleTouchPath = path.join(iconsDir, "apple-touch-icon.png");

  try {
    await baseIcon
      .clone()
      .resize(180, 180)
      .png({ quality: 90 })
      .toFile(appleTouchPath);

    console.log("✅ Создана Apple Touch Icon");
  } catch (error) {
    console.error("❌ Ошибка создания Apple Touch Icon:", error.message);
  }
}

async function generateFavicon(baseIcon) {
  const faviconPath = path.join(process.cwd(), "public", "favicon.ico");

  try {
    await baseIcon
      .clone()
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace(".ico", ".png"));

    // Для .ico файла нужна дополнительная обработка
    await baseIcon
      .clone()
      .resize(16, 16)
      .png()
      .toFile(path.join(process.cwd(), "public", "favicon-16x16.png"));

    await baseIcon
      .clone()
      .resize(32, 32)
      .png()
      .toFile(path.join(process.cwd(), "public", "favicon-32x32.png"));

    console.log("✅ Созданы favicon файлы");
  } catch (error) {
    console.error("❌ Ошибка создания favicon:", error.message);
  }
}

async function generateMaskableIcon(baseIcon, iconsDir) {
  const maskablePath = path.join(iconsDir, "icon-maskable-512x512.png");

  try {
    // Создаем maskable иконку с отступами
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="${DEFAULT_ICON_CONFIG.background}"/>
        <circle cx="256" cy="256" r="200" fill="${DEFAULT_ICON_CONFIG.foreground}" opacity="0.1"/>
        <text x="50%" y="50%" 
              font-family="Arial, sans-serif" 
              font-size="240" 
              font-weight="bold" 
              fill="${DEFAULT_ICON_CONFIG.foreground}" 
              text-anchor="middle" 
              dominant-baseline="central">
          ${DEFAULT_ICON_CONFIG.text}
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(maskablePath);

    console.log("✅ Создана maskable иконка");
  } catch (error) {
    console.error("❌ Ошибка создания maskable иконки:", error.message);
  }
}

// Запускаем генерацию
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };
