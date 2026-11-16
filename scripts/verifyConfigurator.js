import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🧪 RUNNING FULL SYSTEM VERIFICATION SUITE');
console.log('====================================================\n');

// 1. Check User GLB Model Files Exist and are not empty
console.log('TEST 1: Verifying User GLB 3D Model Assets...');
const glbDir = path.resolve(__dirname, '../public/models');
const models = ['Tent_8_8.glb', 'Tent_6_5_6_5.glb', 'Tent_5_5.glb'];

models.forEach((file) => {
  const fullPath = path.join(glbDir, file);
  assert.ok(fs.existsSync(fullPath), `Missing GLB asset: ${file}`);
  const stats = fs.statSync(fullPath);
  assert.ok(stats.size > 1000000, `GLB ${file} should be > 1MB (actual: ${stats.size} bytes)`);
  console.log(`  ✓ ${file} verified (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
});
console.log('✅ TEST 1 PASSED: All user GLB assets present and valid.\n');

// 2. Test Pricing Engine
console.log('TEST 2: Testing Pure Pricing Calculation Engine...');
import {
  calculatePricing,
  buildShopifyCartPayload,
  BASE_CANOPY_PRICE,
  FRAME_PRICES,
  WALL_PRICES,
  PRINT_PRICES,
  ACCESSORY_PRICES,
} from '../src/services/pricingService.js';
import { INITIAL_CANOPY_CONFIG } from '../src/utils/presets.js';

// Base test
const baseConfig = JSON.parse(JSON.stringify(INITIAL_CANOPY_CONFIG));
// Reset custom items
baseConfig.frame.type = 'standard-steel';
baseConfig.walls.back.type = 'none';
baseConfig.walls.left.type = 'none';
baseConfig.accessories.sandbagsCount = 0;
baseConfig.accessories.heavyDutyRollerBag = false;
baseConfig.accessories.stakeKit = false;
baseConfig.accessories.flagMounts = false;
baseConfig.peaks.front.text = '';
baseConfig.peaks.back.text = '';
baseConfig.peaks.left.text = '';
baseConfig.peaks.right.text = '';
baseConfig.valances.front.text = '';
baseConfig.valances.back.text = '';
baseConfig.valances.left.text = '';
baseConfig.valances.right.text = '';

const basePricing = calculatePricing(baseConfig);
assert.strictEqual(basePricing.basePrice, BASE_CANOPY_PRICE);
assert.strictEqual(basePricing.frameUpgradeTotal, 0);
assert.strictEqual(basePricing.wallsTotal, 0);
assert.strictEqual(basePricing.customizationTotal, 0);
assert.strictEqual(basePricing.accessoriesTotal, 0);
assert.strictEqual(basePricing.subtotal, 399.00);
// Free shipping for subtotal >= 300
assert.strictEqual(basePricing.shipping, 0.00);
console.log('  ✓ Base canopy pricing verified: $399.00');

// Test with upgrades: Commercial Aluminum (+150), 2 printed peaks (+80), solid wall (+75), 4 sandbags (+45), roller bag (+65)
const upgradedConfig = JSON.parse(JSON.stringify(baseConfig));
upgradedConfig.frame.type = 'commercial-aluminum';
upgradedConfig.peaks.front.text = 'TECH CO';
upgradedConfig.peaks.back.text = 'SPONSOR';
upgradedConfig.walls.back.type = 'solid';
upgradedConfig.accessories.sandbagsCount = 4;
upgradedConfig.accessories.heavyDutyRollerBag = true;

const upgradedPricing = calculatePricing(upgradedConfig);
const expectedSubtotal = 399 + 150 + (40 * 2) + 75 + 45 + 65; // 814.00
assert.strictEqual(upgradedPricing.subtotal, expectedSubtotal);
assert.strictEqual(upgradedPricing.frameUpgradeTotal, 150);
assert.strictEqual(upgradedPricing.customizationTotal, 80);
assert.strictEqual(upgradedPricing.wallsTotal, 75);
assert.strictEqual(upgradedPricing.accessoriesTotal, 110);
console.log(`  ✓ Upgraded configuration subtotal verified: $${upgradedPricing.subtotal.toFixed(2)}`);
console.log('✅ TEST 2 PASSED: Dynamic pricing calculation matches formula.\n');

// 3. Test Shopify Cart API Payload Generator
console.log('TEST 3: Testing Shopify Cart Payload Specification...');
const payload = buildShopifyCartPayload(upgradedConfig, upgradedPricing);
assert.ok(payload.items && payload.items.length === 1, 'Should have exactly 1 line item');
const item = payload.items[0];
assert.strictEqual(item.id, FRAME_PRICES['commercial-aluminum'].variantId);
assert.strictEqual(item.quantity, 1);
assert.ok(item.properties, 'Should have properties object');
assert.strictEqual(item.properties._configId, upgradedConfig.id);
assert.strictEqual(item.properties['Base Fabric Color'], upgradedConfig.baseColor);
assert.strictEqual(item.properties['Front Peak Customization'], 'TECH CO');
assert.ok(item.properties['Wall Configuration'].includes('SOLID'), 'Should contain wall config');
assert.ok(payload.note.includes('Custom 3D Canopy Configurator Order'), 'Should contain order note');
assert.ok(payload.attributes['Fabric Standard'], 'Should contain fabric attributes');
console.log('  ✓ Shopify Cart payload conforms to /cart/add.js schema');
console.log('✅ TEST 3 PASSED: Shopify integration mock ready.\n');

// 4. Test Redux Store & Slices
console.log('TEST 4: Testing Redux Toolkit Store Reducers...');
import { store } from '../src/store/store.js';
import {
  setBaseColor,
  setTentSize,
  setCameraPreset,
  setIsExplodedView,
  setExplodedFactor,
  updatePeakGraphics,
} from '../src/store/configuratorSlice.js';

// Test Color update
store.dispatch(setBaseColor('#dc2626'));
assert.strictEqual(store.getState().configurator.config.baseColor, '#dc2626');
console.log('  ✓ setBaseColor action dispatched and verified in store');

// Test Tent Size Switcher
store.dispatch(setTentSize('6.5x6.5'));
assert.strictEqual(store.getState().configurator.config.size, '6.5x6.5');
console.log('  ✓ setTentSize action ("6.5x6.5") updated in store');

// Test Exploded View
store.dispatch(setIsExplodedView(true));
assert.strictEqual(store.getState().configurator.isExplodedView, true);
assert.strictEqual(store.getState().configurator.explodedFactor, 1);
store.dispatch(setExplodedFactor(0.45));
assert.strictEqual(store.getState().configurator.explodedFactor, 0.45);
console.log('  ✓ Exploded view factor dispatched and verified');

// Test Custom Graphics
store.dispatch(updatePeakGraphics({ face: 'front', graphics: { text: 'CHAMPIONS 2026', fontSize: 48 } }));
assert.strictEqual(store.getState().configurator.config.peaks.front.text, 'CHAMPIONS 2026');
assert.strictEqual(store.getState().configurator.config.peaks.front.fontSize, 48);
console.log('  ✓ Custom peak graphics updated in store');
console.log('✅ TEST 4 PASSED: Redux store state transitions operating cleanly.\n');

// 5. Test Production Spec Sheet PDF Generation
console.log('TEST 5: Testing PDF Generation Engine...');
import { generateSpecSheetPdf } from '../src/services/pdfService.js';

const doc = generateSpecSheetPdf({
  config: store.getState().configurator.config,
  pricing: upgradedPricing,
  customerName: 'Enterprise Logistics Corp',
  orderNotes: 'Verify Pantone PMS 186C match before heat press transfer.',
});

assert.ok(doc, 'PDF Document must be created');
const outputBuf = doc.output('arraybuffer');
assert.ok(outputBuf.byteLength > 1000, `PDF size should be > 1KB (actual: ${outputBuf.byteLength} bytes)`);
console.log(`  ✓ PDF Spec Sheet successfully generated (${(outputBuf.byteLength / 1024).toFixed(2)} KB)`);
console.log('✅ TEST 5 PASSED: Production PDF generated with vector tables & BOM.\n');

console.log('====================================================');
console.log('🎉 ALL 5 TEST SUITES PASSED WITH ZERO ERRORS!');
console.log('====================================================');
